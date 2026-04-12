import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.database import get_db
from app.models.photographer import Photographer
from app.models.event import Event
from app.models.photo import Photo
from app.models.guest import Guest
from app.schemas import AdminPhotographerUpdate, PhotographerOut, EventOut, AdminStatsOut
from app.services.auth import require_admin
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/photographers", response_model=list[PhotographerOut])
async def list_photographers(
    search: str = Query(None),
    plan: str = Query(None),
    is_active: bool = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(Photographer).where(Photographer.is_deleted == False)
    if search:
        q = q.where(Photographer.full_name.ilike(f"%{search}%") | Photographer.email.ilike(f"%{search}%"))
    if plan:
        q = q.where(Photographer.plan == plan)
    if is_active is not None:
        q = q.where(Photographer.is_active == is_active)
    q = q.offset((page - 1) * limit).limit(limit).order_by(Photographer.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/photographers/{photographer_id}", response_model=PhotographerOut)
async def update_photographer(
    photographer_id: str,
    data: AdminPhotographerUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(photographer_id)))
    photographer = result.scalar_one_or_none()
    if not photographer:
        raise HTTPException(status_code=404, detail="Photographer not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(photographer, field, value)
    await db.commit()
    await db.refresh(photographer)
    return photographer


@router.delete("/photographers/{photographer_id}")
async def delete_photographer(
    photographer_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(photographer_id)))
    photographer = result.scalar_one_or_none()
    if not photographer:
        raise HTTPException(status_code=404, detail="Photographer not found")

    photographer.is_deleted = True
    photographer.is_active = False
    await db.commit()
    return {"message": "Photographer deleted"}


@router.get("/events")
async def list_all_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Event, Photographer.full_name.label("photographer_name"))
        .join(Photographer, Event.photographer_id == Photographer.id)
        .offset((page - 1) * limit).limit(limit)
        .order_by(Event.created_at.desc())
    )
    rows = result.all()
    events = []
    for event, photographer_name in rows:
        d = {
            "id": str(event.id),
            "name": event.name,
            "type": event.type,
            "is_active": event.is_active,
            "photographer_name": photographer_name,
            "created_at": event.created_at.isoformat() if event.created_at else None,
            "event_date": event.event_date.isoformat() if event.event_date else None,
            "qr_token": event.qr_token,
        }
        events.append(d)
    return events


@router.delete("/events/{event_id}")
async def force_delete_event(event_id: str, current_user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from app.services.s3 import delete_file
    result = await db.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    photos_result = await db.execute(select(Photo).where(Photo.event_id == event.id))
    for photo in photos_result.scalars().all():
        try:
            await delete_file(photo.s3_key)
        except Exception:
            pass

    await db.delete(event)
    await db.commit()
    return {"message": "Event deleted"}


@router.post("/photographers/{photographer_id}/suspend")
async def suspend_photographer(photographer_id: str, current_user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(photographer_id)))
    photographer = result.scalar_one_or_none()
    if not photographer:
        raise HTTPException(status_code=404, detail="Photographer not found")
    
    # Manually expire the subscription
    photographer.subscription_expires_at = datetime.utcnow() - timedelta(minutes=1)
    await db.commit()
    return {"message": "Account suspended successfully"}

@router.get("/stats")
async def get_stats(current_user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    total_photographers = (await db.execute(select(func.count(Photographer.id)).where(Photographer.is_deleted == False))).scalar()
    active_events = (await db.execute(select(func.count(Event.id)).where(Event.is_active == True))).scalar()
    total_photos = (await db.execute(select(func.count(Photo.id)))).scalar()

    # Photos per day (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    ppd_result = await db.execute(
        select(func.date(Photo.uploaded_at).label("day"), func.count(Photo.id).label("count"))
        .where(Photo.uploaded_at >= thirty_days_ago)
        .group_by(func.date(Photo.uploaded_at))
        .order_by(func.date(Photo.uploaded_at))
    )
    photos_per_day = [{"day": str(r.day), "count": r.count} for r in ppd_result]

    # Event type distribution
    etd_result = await db.execute(
        select(Event.type, func.count(Event.id).label("count")).group_by(Event.type)
    )
    event_type_distribution = {r.type: r.count for r in etd_result}

    # Top photographers by photo count
    top_result = await db.execute(
        select(Photographer.full_name, func.count(Photo.id).label("photo_count"))
        .join(Event, Event.photographer_id == Photographer.id)
        .join(Photo, Photo.event_id == Event.id)
        .where(Photographer.is_deleted == False)
        .group_by(Photographer.id, Photographer.full_name)
        .order_by(desc("photo_count"))
        .limit(5)
    )
    top_photographers = [{"name": r.full_name, "photo_count": r.photo_count} for r in top_result]

    return {
        "total_photographers": total_photographers,
        "active_events": active_events,
        "total_photos": total_photos,
        "photos_per_day": photos_per_day,
        "event_type_distribution": event_type_distribution,
        "top_photographers": top_photographers,
    }

@router.get("/messages")
async def get_messages(current_user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from app.models.message import Message
    result = await db.execute(select(Message).order_by(Message.created_at.desc()))
    return result.scalars().all()

@router.patch("/messages/{message_id}/resolve")
async def resolve_message(message_id: str, current_user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from app.models.message import Message
    result = await db.execute(select(Message).where(Message.id == uuid.UUID(message_id)))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_resolved = True
    await db.commit()
    return {"message": "Successfully marked as resolved"}

@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_user: dict = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from app.models.message import Message
    result = await db.execute(select(Message).where(Message.id == uuid.UUID(message_id)))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(msg)
    await db.commit()
    return {"message": "Successfully deleted message"}
