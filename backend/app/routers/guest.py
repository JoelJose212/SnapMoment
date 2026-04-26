import uuid
import tempfile
import os
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.guest import Guest
from app.models.event import Event
from app.models.photo import Photo
from app.models.photo_match import PhotoMatch
from app.schemas import OTPSendRequest, OTPVerifyRequest, GuestTokenResponse, GalleryPhotoOut
from app.services.auth import create_token, get_guest_user
from app.services.redis_service import generate_otp, store_otp, verify_otp, check_rate_limit
from app.services import s3 as s3_service
from app.services.face_engine import extract_embedding, match_selfie_to_event, match_selfie_to_clusters
from app.config import settings
from app.models.photographer import Photographer
from app.utils.watermark import apply_text_watermark
from fastapi.responses import StreamingResponse
import io
import logging
import zipfile

router = APIRouter(prefix="/api/guest", tags=["guest"])
logger = logging.getLogger(__name__)


@router.post("/otp/send")
async def send_otp(data: OTPSendRequest, db: AsyncSession = Depends(get_db)):
    # Validate event exists
    result = await db.execute(select(Event).where(Event.id == uuid.UUID(data.event_id)))
    event = result.scalar_one_or_none()
    if not event or not event.is_active:
        raise HTTPException(status_code=404, detail="Event not found or inactive")

    # Rate limit
    allowed = await check_rate_limit(data.phone_number)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many OTP requests. Try again in 10 minutes.")

    otp = generate_otp()
    await store_otp(data.phone_number, data.event_id, otp)

    if settings.DEV_MODE:
        logger.info(f"[DEV OTP] Phone: {data.phone_number}, Event: {data.event_id}, OTP: {otp}")
        print(f"\n{'='*50}\n[DEV OTP] Phone: {data.phone_number} → OTP: {otp}\n{'='*50}\n")
    else:
        # Send via MSG91 (production)
        pass

    return {"message": "OTP sent", "dev_otp": otp if settings.DEV_MODE else None}


@router.post("/otp/verify", response_model=GuestTokenResponse)
async def verify_otp_route(data: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    valid = await verify_otp(data.phone_number, data.event_id, data.otp)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Upsert guest record
    result = await db.execute(
        select(Guest).where(Guest.phone_number == data.phone_number, Guest.event_id == uuid.UUID(data.event_id))
    )
    guest = result.scalar_one_or_none()
    if not guest:
        guest = Guest(
            id=uuid.uuid4(),
            full_name=data.full_name,
            phone_number=data.phone_number,
            event_id=uuid.UUID(data.event_id),
            verified_at=datetime.utcnow(),
        )
        db.add(guest)
    else:
        guest.full_name = data.full_name
        guest.verified_at = datetime.utcnow()

    await db.commit()
    await db.refresh(guest)

    token = create_token(
        {"sub": str(guest.id), "role": "guest", "event_id": data.event_id, "phone": data.phone_number},
        expires_hours=24,
    )
    return GuestTokenResponse(access_token=token, guest_id=str(guest.id), event_id=data.event_id)


@router.get("/vip/{vip_token}")
async def vip_login(vip_token: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.vip_token == vip_token))
    event = result.scalar_one_or_none()
    if not event or not event.is_active:
        raise HTTPException(status_code=404, detail="VIP access link invalid or expired")

    # Generate a VIP token (no specific guest ID, just the event and role)
    token = create_token(
        {"sub": "VIP", "role": "guest_vip", "event_id": str(event.id)},
        expires_hours=48, # VIPs get longer access
    )
    return {"access_token": token, "event_name": event.name, "event_id": str(event.id)}


@router.post("/selfie")
async def upload_selfie(
    file: UploadFile = File(...),
    current_guest: dict = Depends(get_guest_user),
    db: AsyncSession = Depends(get_db),
):
    guest_id = current_guest["sub"]
    event_id = current_guest["event_id"]

    # Save selfie temporarily
    selfie_bytes = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False, mode="wb") as tmp:
        tmp.write(selfie_bytes)
        tmp_path = tmp.name

    try:
        # Extract embedding
        try:
            selfie_embedding = extract_embedding(tmp_path)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))

        # Upload selfie to storage
        selfie_key = s3_service.generate_key(f"guests/{guest_id}/selfies", "jpg")
        selfie_url = await s3_service.upload_file(selfie_bytes, selfie_key)

        # Update guest record
        result = await db.execute(select(Guest).where(Guest.id == uuid.UUID(guest_id)))
        guest = result.scalar_one_or_none()
        if guest:
            guest.selfie_s3_key = selfie_key
            guest.face_embedding = {"embedding": selfie_embedding}

        # ── Comprehensive matching via pgvector (O(log N)) ──────────────────
        from app.models.face_index import FaceIndex
        from sqlalchemy import delete
        
        THRESHOLD = 0.60
        logger.info(f"Performing Buffalo_L match for event {event_id} (threshold: {THRESHOLD})")
        
        # Search every indexed face in the event, including non-clustered faces
        search_query = (
            select(FaceIndex.photo_id, FaceIndex.embedding.cosine_distance(selfie_embedding).label("distance"))
            .where(FaceIndex.event_id == uuid.UUID(event_id))
            .order_by("distance")
            .limit(200) 
        )
        
        results = await db.execute(search_query)
        matches_raw = results.all()
        
        matches = []
        seen_photos = set()
        
        # TIERED CLASSIFICATION FOR BUFFALO_L
        PRECISION_BASELINE = 0.50 # Highly likely same person 
        
        for photo_id, distance in matches_raw:
            if distance <= THRESHOLD:
                if photo_id not in seen_photos:
                    is_suggested = distance > PRECISION_BASELINE
                    
                    # Recalibrated confidence mapping for ResNet-100 signatures:
                    if not is_suggested:
                        # 0.0 -> 100%, 0.50 -> 90%
                        confidence_score = (1.0 - (distance / PRECISION_BASELINE) * 0.1) * 100
                    else:
                        # 0.50 -> 85%, 0.60 -> 15%
                        confidence_score = (0.85 - ((distance - PRECISION_BASELINE) / (THRESHOLD - PRECISION_BASELINE)) * 0.70) * 100
                    
                    matches.append({
                        "photo_id": str(photo_id),
                        "distance": float(distance),
                        "confidence_score": round(float(confidence_score), 2),
                        "is_suggested": is_suggested
                    })
                    seen_photos.add(photo_id)

        # ── Save matches ───────────────────────────────────────────────────
        await db.execute(delete(PhotoMatch).where(PhotoMatch.guest_id == uuid.UUID(guest_id)))
        for match in matches:
            pm = PhotoMatch(
                id=uuid.uuid4(),
                photo_id=uuid.UUID(match["photo_id"]),
                guest_id=uuid.UUID(guest_id),
                confidence_score=match["confidence_score"],
                is_suggested=match["is_suggested"],
            )
            db.add(pm)

        await db.commit()
        return {"matched_count": len(matches), "photos": matches}

    finally:
        os.unlink(tmp_path)


@router.get("/gallery/download-all")
async def download_all(
    current_guest: dict = Depends(get_guest_user),
    db: AsyncSession = Depends(get_db)
):
    guest_id = current_guest["sub"]
    event_id = current_guest["event_id"]

    # 1. Get All Matches
    result = await db.execute(
        select(Photo).join(PhotoMatch, PhotoMatch.photo_id == Photo.id)
        .where(PhotoMatch.guest_id == uuid.UUID(guest_id))
    )
    photos = result.scalars().all()
    if not photos:
        raise HTTPException(status_code=404, detail="No matched photos found for download")

    # 2. Get Studio Name for watermarking
    result = await db.execute(
        select(Photographer.studio_name)
        .join(Event, Event.photographer_id == Photographer.id)
        .where(Event.id == uuid.UUID(event_id))
    )
    studio_name = result.scalar() or "SnapMoment"
    watermark_text = f"Captured by {studio_name}"

    # 3. Create ZIP Archive
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for i, photo in enumerate(photos):
            try:
                # Fetch original image
                image_bytes = await s3_service.read_file(photo.s3_key)
                
                # Apply watermark (consistent with individual downloads)
                watermarked_bytes = apply_text_watermark(image_bytes, watermark_text)
                
                # Add to ZIP
                zip_file.writestr(f"SnapMoment_{i+1}_{photo.id}.jpg", watermarked_bytes)
            except Exception as e:
                logger.error(f"Failed to add photo {photo.id} to ZIP: {e}")
                continue

    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=SnapMoment_Gallery_{event_id}.zip"}
    )



@router.get("/gallery", response_model=list[GalleryPhotoOut])
async def get_gallery(current_guest: dict = Depends(get_guest_user), db: AsyncSession = Depends(get_db)):
    guest_id = current_guest["sub"]
    event_id = current_guest["event_id"]
    is_vip = current_guest.get("role") == "guest_vip"

    if is_vip:
        # VIPs see ALL photos
        result = await db.execute(
            select(Photo).where(Photo.event_id == uuid.UUID(event_id))
            .order_by(Photo.uploaded_at.desc())
        )
        photos = result.scalars().all()
        
        gallery = []
        for photo in photos:
            gallery.append(GalleryPhotoOut(
                match_id=str(photo.id),
                photo_id=str(photo.id),
                event_id=str(photo.event_id),
                photo_url=s3_service.get_signed_url(photo.s3_key),
                thumbnail_url=s3_service.get_signed_url(photo.s3_key) if photo.thumbnail_url else None,
                confidence_score=100.0,
                is_reported=False,
                is_suggested=False,
                matched_at=datetime.utcnow(),
            ))
        return gallery

    # Standard guest face-match flow
    result = await db.execute(
        select(PhotoMatch, Photo).join(Photo, PhotoMatch.photo_id == Photo.id)
        .where(PhotoMatch.guest_id == uuid.UUID(guest_id))
        .order_by(PhotoMatch.confidence_score.desc())
    )
    rows = result.all()

    gallery = []
    for match, photo in rows:
        crop_1x1 = None
        crop_9x16 = None
        
        if getattr(photo, 'has_social_crops', False):
            crop_1x1 = s3_service.get_signed_url(f"crops/{photo.id}_1x1.jpg")
            crop_9x16 = s3_service.get_signed_url(f"crops/{photo.id}_9x16.jpg")

        gallery.append(GalleryPhotoOut(
            match_id=str(match.id),
            photo_id=str(photo.id),
            event_id=str(photo.event_id),
            photo_url=s3_service.get_signed_url(photo.s3_key),
            thumbnail_url=s3_service.get_signed_url(photo.s3_key) if photo.thumbnail_url else None,
            crop_1x1_url=crop_1x1,
            crop_9x16_url=crop_9x16,
            confidence_score=match.confidence_score,
            is_reported=match.is_reported,
            is_suggested=match.is_suggested,
            matched_at=match.matched_at,
        ))
    return gallery


@router.post("/gallery/{photo_id}/report")
async def report_photo(photo_id: str, current_guest: dict = Depends(get_guest_user), db: AsyncSession = Depends(get_db)):
    guest_id = current_guest["sub"]
    result = await db.execute(
        select(PhotoMatch).where(PhotoMatch.photo_id == uuid.UUID(photo_id), PhotoMatch.guest_id == uuid.UUID(guest_id))
    )
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.is_reported = True
    await db.commit()
    return {"message": "Reported"}


@router.get("/gallery/{photo_id}/download")
async def download_photo(
    photo_id: str,
    format: str = "original",  # original, 1x1, 9:16
    current_guest: dict = Depends(get_guest_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Get Photo
    result = await db.execute(select(Photo).where(Photo.id == uuid.UUID(photo_id)))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # 2. Get Studio Name
    result = await db.execute(
        select(Photographer.studio_name)
        .join(Event, Event.photographer_id == Photographer.id)
        .where(Event.id == photo.event_id)
    )
    studio_name = result.scalar() or "SnapMoment"
    watermark_text = f"Captured by {studio_name}"

    # 3. Determine Storage Key
    if format == "1x1":
        key = f"crops/{photo.id}_1x1.jpg"
    elif format == "9:16":
        key = f"crops/{photo.id}_9:16.jpg" # Note: our logic used _9x16 earlier, checking...
        # Let's use the actual stored format from face_indexing
        key = f"crops/{photo.id}_9x16.jpg" 
    else:
        key = photo.s3_key

    # 4. Fetch and Watermark
    try:
        image_bytes = await s3_service.read_file(key)
        watermarked_bytes = apply_text_watermark(image_bytes, watermark_text)
        
        return StreamingResponse(
            io.BytesIO(watermarked_bytes),
            media_type="image/jpeg",
            headers={"Content-Disposition": f"attachment; filename=SnapMoment_{photo_id}_{format}.jpg"}
        )
    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise HTTPException(status_code=500, detail="Could not process image for download")

