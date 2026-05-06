import uuid
from datetime import datetime, date, time
from enum import Enum
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, Date, Time, Integer, Float, ForeignKey, Text, func, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from app.database import Base


class PhotographerStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class EventStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    DISPUTED = "disputed"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"


class ClientProfile(Base):
    __tablename__ = "client_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    profile_photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    district: Mapped[str] = mapped_column(String(100), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str] = mapped_column(String(10), nullable=True)
    
    dob: Mapped[date] = mapped_column(Date, nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    referral_source: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    events = relationship("ClientEvent", back_populates="client")


class PhotographerProfile(Base):
    __tablename__ = "photographer_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    business_name: Mapped[str] = mapped_column(String(200))
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    website: Mapped[str] = mapped_column(String(200), nullable=True)
    profile_photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    portfolio_urls: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=True)
    
    service_states: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=True, index=True)
    service_districts: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=True, index=True)
    travel_range_km: Mapped[int] = mapped_column(Integer, default=50)
    
    status: Mapped[PhotographerStatus] = mapped_column(SqlEnum(PhotographerStatus), default=PhotographerStatus.PENDING, index=True)
    aadhaar_url: Mapped[str] = mapped_column(String(500), nullable=True) # ID proof
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    total_bookings: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    starting_price: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])
    packages = relationship("PhotographerPackage", back_populates="photographer")
    specializations = relationship("PhotographerSpecialization", back_populates="photographer")


class PhotographerPackage(Base):
    __tablename__ = "photographer_packages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_profiles.id", ondelete="CASCADE"))
    
    name: Mapped[str] = mapped_column(String(200))
    event_category: Mapped[str] = mapped_column(String(50)) # wedding, birthday, etc.
    applicable_sub_events: Mapped[List[str]] = mapped_column(ARRAY(String), default=["all"])
    
    price: Mapped[int] = mapped_column(Integer)
    price_per_hour: Mapped[int] = mapped_column(Integer, nullable=True)
    
    duration_hours: Mapped[int] = mapped_column(Integer)
    photos_delivered: Mapped[int] = mapped_column(Integer)
    edited_photos: Mapped[int] = mapped_column(Integer)
    turnaround_days: Mapped[int] = mapped_column(Integer)
    
    includes_reels: Mapped[bool] = mapped_column(Boolean, default=False)
    includes_album: Mapped[bool] = mapped_column(Boolean, default=False)
    includes_drone: Mapped[bool] = mapped_column(Boolean, default=False)
    includes_video: Mapped[bool] = mapped_column(Boolean, default=False)
    second_photographer: Mapped[bool] = mapped_column(Boolean, default=False)
    
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    photographer = relationship("PhotographerProfile", back_populates="packages")


class PhotographerAvailability(Base):
    __tablename__ = "photographer_availability"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_profiles.id", ondelete="CASCADE"))
    
    date: Mapped[date] = mapped_column(Date)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)


class ClientEvent(Base):
    __tablename__ = "client_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_ref: Mapped[str] = mapped_column(String(20), unique=True, index=True) # SMB-YYYY-XXXXX
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("client_profiles.id", ondelete="CASCADE"))
    
    event_category: Mapped[str] = mapped_column(String(50))
    event_title: Mapped[str] = mapped_column(String(300))
    
    state: Mapped[str] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    venue_name: Mapped[str] = mapped_column(String(300), nullable=True)
    venue_address: Mapped[str] = mapped_column(Text, nullable=True)
    pincode: Mapped[str] = mapped_column(String(10), nullable=True)
    
    status: Mapped[EventStatus] = mapped_column(SqlEnum(EventStatus), default=EventStatus.DRAFT)
    total_budget: Mapped[int] = mapped_column(Integer, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    client = relationship("ClientProfile", back_populates="events")
    sub_events = relationship("SubEventBooking", back_populates="client_event")


class SubEventBooking(Base):
    __tablename__ = "sub_event_bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("client_events.id", ondelete="CASCADE"))
    
    sub_event_name: Mapped[str] = mapped_column(String(100))
    event_date: Mapped[date] = mapped_column(Date)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time, nullable=True)
    duration_hours: Mapped[int] = mapped_column(Integer, nullable=True)
    
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_profiles.id"))
    package_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_packages.id"), nullable=True)
    specialization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_specializations.id"), nullable=True)
    
    agreed_price: Mapped[int] = mapped_column(Integer)
    status: Mapped[BookingStatus] = mapped_column(SqlEnum(BookingStatus), default=BookingStatus.PENDING)
    agreed_to_terms_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Connection to AI pipeline
    snapmoment_event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    client_event = relationship("ClientEvent", back_populates="sub_events")
    photographer = relationship("PhotographerProfile")
    package = relationship("PhotographerPackage")


class PhotographerReview(Base):
    __tablename__ = "photographer_reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sub_event_booking_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sub_event_bookings.id", ondelete="CASCADE"))
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("client_profiles.id"))
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_profiles.id"))
    
    rating: Mapped[int] = mapped_column(Integer) # 1-5
    review_text: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PhotographerFavorite(Base):
    __tablename__ = "photographer_favorites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("client_profiles.id", ondelete="CASCADE"))
    photographer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("photographer_profiles.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    client = relationship("ClientProfile")
    photographer = relationship("PhotographerProfile")
