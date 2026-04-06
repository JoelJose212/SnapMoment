import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Float, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class PhotoMatch(Base):
    __tablename__ = "photo_matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"))
    guest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("guests.id", ondelete="CASCADE"))
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    is_reported: Mapped[bool] = mapped_column(Boolean, default=False)
    matched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
