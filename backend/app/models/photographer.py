import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Photographer(Base):
    __tablename__ = "photographers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    studio_name: Mapped[str] = mapped_column(String(200), nullable=True)
    watermark_url: Mapped[str] = mapped_column(String(500), nullable=True)
    plan: Mapped[str] = mapped_column(String(20), default="free")  # free/pro/studio
    
    # Onboarding & Studio Profile
    onboarding_step: Mapped[int] = mapped_column(Integer, default=1)
    founded_year: Mapped[int] = mapped_column(Integer, nullable=True)
    services: Mapped[list] = mapped_column(JSON, nullable=True) # stores list of strings
    team_size: Mapped[str] = mapped_column(String(50), nullable=True)
    primary_gear: Mapped[str] = mapped_column(String(200), nullable=True)
    portfolio_url: Mapped[str] = mapped_column(String(500), nullable=True)
    experience_level: Mapped[str] = mapped_column(String(100), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
