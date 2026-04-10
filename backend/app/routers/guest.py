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
import logging

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
            phone_number=data.phone_number,
            event_id=uuid.UUID(data.event_id),
            verified_at=datetime.utcnow(),
        )
        db.add(guest)
    else:
        guest.verified_at = datetime.utcnow()

    await db.commit()
    await db.refresh(guest)

    token = create_token(
        {"sub": str(guest.id), "role": "guest", "event_id": data.event_id, "phone": data.phone_number},
        expires_hours=24,
    )
    return GuestTokenResponse(access_token=token, guest_id=str(guest.id), event_id=data.event_id)


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

        # ── Stage 1: Cluster-based matching (fast, O(k)) ─────────────────────
        from app.models.face_index import FaceIndex
        from app.models.face_cluster import FaceCluster
        from sqlalchemy import delete

        cluster_result = await db.execute(
            select(FaceCluster).where(FaceCluster.event_id == uuid.UUID(event_id))
        )
        clusters_db = cluster_result.scalars().all()

        matches = []

        if clusters_db:
            logger.info(f"Using cluster matching: {len(clusters_db)} clusters for event {event_id}")
            cluster_data = [
                {
                    "centroid": list(c.centroid),
                    "photo_ids": c.photo_ids,
                    "face_count": c.face_count,
                }
                for c in clusters_db
            ]
            cluster_matches = match_selfie_to_clusters(selfie_embedding, cluster_data)
            seen_photos: set = set()
            for cm in cluster_matches:
                for pid in cm["photo_ids"]:
                    if pid not in seen_photos:
                        matches.append({
                            "photo_id": pid,
                            "distance": cm["distance"],
                            "confidence_score": cm["confidence_score"],
                        })
                        seen_photos.add(pid)

        else:
            # ── Stage 2: pgvector linear scan fallback ─────────────────────
            logger.info(f"No clusters found — falling back to pgvector scan for event {event_id}")
            THRESHOLD = 0.30
            search_query = (
                select(FaceIndex.photo_id, FaceIndex.embedding.cosine_distance(selfie_embedding).label("distance"))
                .where(FaceIndex.event_id == uuid.UUID(event_id))
                .order_by("distance")
                .limit(100)
            )
            results = await db.execute(search_query)
            matches_raw = results.all()
            seen_photos = set()
            for photo_id, distance in matches_raw:
                if distance <= THRESHOLD and photo_id not in seen_photos:
                    confidence_score = max(0.0, (1.0 - distance / THRESHOLD) * 100)
                    matches.append({
                        "photo_id": str(photo_id),
                        "distance": float(distance),
                        "confidence_score": round(float(confidence_score), 2),
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
            )
            db.add(pm)

        await db.commit()
        return {"matched_count": len(matches), "photos": matches}

    finally:
        os.unlink(tmp_path)


@router.get("/gallery", response_model=list[GalleryPhotoOut])
async def get_gallery(current_guest: dict = Depends(get_guest_user), db: AsyncSession = Depends(get_db)):
    guest_id = current_guest["sub"]

    result = await db.execute(
        select(PhotoMatch, Photo).join(Photo, PhotoMatch.photo_id == Photo.id)
        .where(PhotoMatch.guest_id == uuid.UUID(guest_id))
        .order_by(PhotoMatch.confidence_score.desc())
    )
    rows = result.all()

    gallery = []
    for match, photo in rows:
        gallery.append(GalleryPhotoOut(
            match_id=str(match.id),
            photo_id=str(photo.id),
            photo_url=s3_service.get_signed_url(photo.s3_key),
            thumbnail_url=s3_service.get_signed_url(photo.s3_key) if photo.thumbnail_url else None,
            confidence_score=match.confidence_score,
            is_reported=match.is_reported,
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
