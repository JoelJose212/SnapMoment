import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class EventCollaboration(Base):
    __tablename__ = "event_collaborations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographers.id", ondelete="CASCADE"))
    
    # role: 'viewer', 'contributor', 'admin'
    role: Mapped[str] = mapped_column(String(50), default="contributor")
    
    invited_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographers.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Ensure a photographer can't be added twice to the same event
    __table_args__ = (
        UniqueConstraint("event_id", "photographer_id", name="uq_event_photographer"),
    )
