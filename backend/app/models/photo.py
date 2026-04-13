import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    s3_key: Mapped[str] = mapped_column(String(500))
    s3_url: Mapped[str] = mapped_column(String(1000))
    thumbnail_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    face_indexed: Mapped[bool] = mapped_column(Boolean, default=False)
    face_embeddings: Mapped[dict] = mapped_column(JSONB, nullable=True)
    faces_count: Mapped[int] = mapped_column(Integer, default=0)
    has_social_crops: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
