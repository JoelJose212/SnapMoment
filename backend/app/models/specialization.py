import uuid
from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class PhotographerSpecialization(Base):
    __tablename__ = "photographer_specializations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_profiles.id", ondelete="CASCADE"), index=True)
    
    category: Mapped[str] = mapped_column(String(100), index=True)
    sub_category: Mapped[str] = mapped_column(String(100))
    base_price: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    photographer = relationship("PhotographerProfile", back_populates="specializations")
