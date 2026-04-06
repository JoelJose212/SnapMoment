import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographers.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(300))
    type: Mapped[str] = mapped_column(String(50), default="other")  # wedding/birthday/college/corporate/anniversary/other
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    location: Mapped[str] = mapped_column(String(300), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    cover_photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    qr_token: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    photographer_note: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
