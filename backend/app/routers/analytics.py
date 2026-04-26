import uuid
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, String
from app.database import get_db
from app.models.event import Event
from app.models.photo import Photo
from app.models.guest import Guest
from app.schemas import ContactForm
from app.services.auth import require_photographer
from datetime import datetime, timedelta
import logging

from app.models.analytics import AnalyticsEvent

router = APIRouter(prefix="/api", tags=["analytics"])
logger = logging.getLogger(__name__)


@router.get("/analytics/photographer")
async def photographer_analytics(current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    photographer_id = current_user["sub"]
    if photographer_id == "admin":
        return {"total_events": 0, "total_photos": 0, "total_guests": 0, "events_per_month": [], "type_distribution": {}, "engagement": []}

    events_result = await db.execute(select(Event).where(Event.photographer_id == uuid.UUID(photographer_id)))
    events = events_result.scalars().all()
    event_ids = [e.id for e in events]

    total_photos = 0
    total_guests = 0
    if event_ids:
        tp = await db.execute(select(func.count(Photo.id)).where(Photo.event_id.in_(event_ids)))
        total_photos = tp.scalar() or 0
        tg = await db.execute(select(func.count(Guest.id)).where(Guest.event_id.in_(event_ids)))
        total_guests = tg.scalar() or 0

    # Monthly distribution (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    epd = []
    if event_ids:
        pp_result = await db.execute(
            select(func.date(Photo.uploaded_at).label("day"), func.count(Photo.id).label("count"))
            .where(Photo.event_id.in_(event_ids), Photo.uploaded_at >= thirty_days_ago)
            .group_by(func.date(Photo.uploaded_at))
            .order_by(func.date(Photo.uploaded_at))
        )
        epd = [{"day": str(r.day), "count": r.count} for r in pp_result]

    # Engagement Distribution (Log Actions)
    engagement = []
    if event_ids:
        eng_result = await db.execute(
            select(AnalyticsEvent.action_type, func.count(AnalyticsEvent.id).label("count"))
            .where(AnalyticsEvent.event_id.in_(event_ids))
            .group_by(AnalyticsEvent.action_type)
        )
        engagement = [{"type": r.action_type, "count": r.count} for r in eng_result]

    type_distribution = {}
    for event in events:
        type_distribution[event.type] = type_distribution.get(event.type, 0) + 1

    return {
        "total_events": len(events),
        "total_photos": total_photos,
        "total_guests": total_guests,
        "events_per_month": epd,
        "type_distribution": type_distribution,
        "engagement": engagement
    }


@router.get("/analytics/engagement/guests")
async def guest_engagement(current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    photographer_id = current_user["sub"]
    
    # Get all events for this photographer
    events_result = await db.execute(select(Event.id).where(Event.photographer_id == uuid.UUID(photographer_id)))
    event_ids = [r[0] for r in events_result.all()]
    
    if not event_ids:
        return []
        
    # Get guests and their interaction counts
    query = (
        select(
            Guest.full_name, 
            Guest.phone_number, 
            Event.name.label("event_name"),
            Guest.joined_at,
            func.count(AnalyticsEvent.id).label("interactions")
        )
        .join(Event, Guest.event_id == Event.id)
        .outerjoin(AnalyticsEvent, AnalyticsEvent.guest_id == Guest.id)
        .where(Guest.event_id.in_(event_ids))
        .group_by(Guest.id, Event.name)
        .order_by(Guest.joined_at.desc())
    )
    
    result = await db.execute(query)
    return [
        {
            "name": r.full_name,
            "phone": r.phone_number,
            "event": r.event_name,
            "accessed": r.joined_at,
            "interactions": r.interactions
        } for r in result.all()
    ]

@router.get("/analytics/engagement/top-photos")
async def top_photos(current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    photographer_id = current_user["sub"]
    
    # Get all event IDs
    events_result = await db.execute(select(Event.id).where(Event.photographer_id == uuid.UUID(photographer_id)))
    event_ids = [r[0] for r in events_result.all()]
    
    if not event_ids:
        return []
        
    # Get top downloaded and viewed photos
    # We use the metadata->'photo_id' to group
    query = (
        select(
            Photo,
            func.count(AnalyticsEvent.id).filter(AnalyticsEvent.action_type == 'DOWNLOAD').label("downloads"),
            func.count(AnalyticsEvent.id).filter(AnalyticsEvent.action_type == 'VIEW').label("views"),
            func.count(AnalyticsEvent.id).filter(AnalyticsEvent.action_type == 'LIKE').label("likes")
        )
        .join(AnalyticsEvent, Photo.id.cast(String) == AnalyticsEvent.metadata_['photo_id'].astext)
        .where(Photo.event_id.in_(event_ids))
        .group_by(Photo.id)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(10)
    )
    
    result = await db.execute(query)
    # We need signed URLs
    from app.services import s3 as s3_service
    return [
        {
            "id": str(r.Photo.id),
            "url": s3_service.get_signed_url(r.Photo.s3_key),
            "downloads": r.downloads,
            "views": r.views,
            "likes": r.likes
        } for r in result.all()
    ]

@router.post("/analytics/log")
async def log_event(
    event_id: uuid.UUID,
    action_type: str,
    photo_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    """Log guest interaction (VIEW, DOWNLOAD, SHARE, LIKE)."""
    # Note: We try to get guest identity if possible, but logging should not fail if not present
    # In a real scenario, we might use a separate dependency or just rely on the frontend passing it
    
    log = AnalyticsEvent(
        id=uuid.uuid4(),
        event_id=event_id,
        action_type=action_type,
        metadata_={"photo_id": str(photo_id) if photo_id else None}
    )
    db.add(log)
    await db.commit()
    return {"status": "logged"}


@router.post("/contact")
async def contact(data: ContactForm, db: AsyncSession = Depends(get_db)):
    from app.models.message import Message
    logger.info(f"[CONTACT] From: {data.name} <{data.email}>, Subject: {data.subject}")
    
    msg = Message(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(msg)
    await db.commit()
    
    return {"message": "Thank you! We'll get back to you shortly."}
