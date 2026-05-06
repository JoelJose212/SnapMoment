from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional, List

class NotificationBase(BaseModel):
    type: str
    title: str
    content: str
    link: Optional[str] = None

class NotificationOut(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool
