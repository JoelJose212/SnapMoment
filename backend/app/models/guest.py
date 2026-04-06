import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class Guest(Base):
    __tablename__ = "guests"
    __table_args__ = (UniqueConstraint("phone_number", "event_id", name="uq_guest_phone_event"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number: Mapped[str] = mapped_column(String(20))
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    selfie_s3_key: Mapped[str] = mapped_column(String(500), nullable=True)
    face_embedding: Mapped[dict] = mapped_column(JSONB, nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
