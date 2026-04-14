import uuid
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
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


@router.post("/analytics/log")
async def log_event(
    event_id: uuid.UUID,
    action_type: str,
    photo_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    """Log guest interaction (VIEW, DOWNLOAD, SHARE)."""
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
