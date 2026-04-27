import uuid
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.event import Event
from app.models.photo import Photo
from app.models.guest import Guest
from app.schemas import EventCreate, EventUpdate, EventOut, PublicEventOut
from app.services.auth import require_photographer

from app.models.photographer import Photographer

router = APIRouter(prefix="/api/events", tags=["events"])

async def check_subscription(photographer_id: str, db: AsyncSession):
    if photographer_id == "admin": 
        return True
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(photographer_id)))
    p = result.scalar_one_or_none()
    if not p: return False
    # If is_active is specifically False and sub is still active, we block.
    # But if sub is expired, we block data management.
    from datetime import timezone
    if p.subscription_expires_at and p.subscription_expires_at < datetime.now(timezone.utc):
        return False
    if not p.is_active:
        return False
    return True


def _generate_qr_token() -> str:
    return secrets.token_urlsafe(16)


@router.post("", response_model=EventOut)
async def create_event(data: EventCreate, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    photographer_id = current_user["sub"]
    if not await check_subscription(photographer_id, db):
        raise HTTPException(status_code=403, detail="Subscription expired. Please reactivate your account.")
    qr_token = _generate_qr_token()
    event_date = data.event_date
    expires_at = (event_date + timedelta(days=90)) if event_date else (datetime.utcnow() + timedelta(days=90))

    event = Event(
        id=uuid.uuid4(),
        photographer_id=uuid.UUID(photographer_id) if photographer_id != "admin" else uuid.uuid4(),
        name=data.name,
        type=data.type,
        event_date=event_date,
        location=data.location,
        description=data.description,
        photographer_note=data.photographer_note,
        qr_token=qr_token,
        is_active=True,
        expires_at=expires_at,
        ftp_password=secrets.token_urlsafe(12),
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    out = EventOut.model_validate(event)
    out.photo_count = 0
    out.guest_count = 0
    return out


@router.get("", response_model=list[EventOut])
async def list_events(current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    photographer_id = current_user["sub"]
    if not await check_subscription(photographer_id, db):
        return []

    # 🚀 Optimized single-query fetch using scalar subqueries
    photo_count_sub = (
        select(func.count(Photo.id))
        .where(Photo.event_id == Event.id)
        .scalar_subquery()
    )
    guest_count_sub = (
        select(func.count(Guest.id))
        .where(Guest.event_id == Event.id)
        .scalar_subquery()
    )

    stmt = (
        select(Event, photo_count_sub, guest_count_sub)
        .where(Event.photographer_id == uuid.UUID(photographer_id))
        .order_by(Event.created_at.desc())
    )
    
    result = await db.execute(stmt)
    rows = result.all()

    out_list = []
    for event, photo_count, guest_count in rows:
        ev_out = EventOut.model_validate(event)
        ev_out.photo_count = photo_count or 0
        ev_out.guest_count = guest_count or 0
        out_list.append(ev_out)

    return out_list


@router.get("/public/:qr_token", response_model=PublicEventOut)
async def get_public_event_wrong(qr_token: str, db: AsyncSession = Depends(get_db)):
    # This route is handled below - placeholder to show order
    pass


@router.get("/public/{qr_token}", response_model=PublicEventOut)
async def get_public_event(qr_token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.qr_token == qr_token))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Get photographer brand (optional)
    res2 = await db.execute(select(Photographer).where(Photographer.id == event.photographer_id))
    photog = res2.scalar_one_or_none()
    
    out = PublicEventOut.model_validate(event)
    if photog:
        out.studio_logo_url = photog.studio_logo_url
        out.studio_name = photog.studio_name
        
    return out


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    if not await check_subscription(current_user["sub"], db):
        raise HTTPException(status_code=403, detail="Subscription expired")

    # 🚀 Optimized fetch
    photo_count_sub = select(func.count(Photo.id)).where(Photo.event_id == Event.id).scalar_subquery()
    guest_count_sub = select(func.count(Guest.id)).where(Guest.event_id == Event.id).scalar_subquery()

    stmt = select(Event, photo_count_sub, guest_count_sub).where(Event.id == uuid.UUID(event_id))
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event, photo_count, guest_count = row
    ev_out = EventOut.model_validate(event)
    ev_out.photo_count = photo_count or 0
    ev_out.guest_count = guest_count or 0
    return ev_out


@router.patch("/{event_id}", response_model=EventOut)
async def update_event(event_id: str, data: EventUpdate, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    if not await check_subscription(current_user["sub"], db):
        raise HTTPException(status_code=403, detail="Subscription expired")
    result = await db.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)

    ev_out = EventOut.model_validate(event)
    ev_out.photo_count = 0
    ev_out.guest_count = 0
    return ev_out


@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    if not await check_subscription(current_user["sub"], db):
        raise HTTPException(status_code=403, detail="Subscription expired")
    from app.models.photo import Photo as PhotoModel
    from app.services.s3 import delete_file

    result = await db.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete all photos from storage
    photos_result = await db.execute(select(PhotoModel).where(PhotoModel.event_id == event.id))
    photos = photos_result.scalars().all()
    for photo in photos:
        try:
            await delete_file(photo.s3_key)
        except Exception:
            pass

    await db.delete(event)
    await db.commit()
    return {"message": "Event deleted"}
