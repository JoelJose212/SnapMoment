from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc
import uuid
from typing import List

from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationOut, NotificationUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationOut])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(desc(Notification.created_at))
        .limit(50)
    )
    return result.scalars().all()

@router.patch("/{notification_id}", response_model=NotificationOut)
async def mark_as_read(
    notification_id: uuid.UUID,
    data: NotificationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    notification = await db.get(Notification, notification_id)
    
    if not notification or notification.user_id != user_id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = data.is_read
    await db.commit()
    await db.refresh(notification)
    return notification

@router.post("/read-all")
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id)
        .values(is_read=True)
    )
    await db.commit()
    return {"status": "success"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    notification = await db.get(Notification, notification_id)
    
    if not notification or notification.user_id != user_id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    await db.delete(notification)
    await db.commit()
    return {"status": "success"}
