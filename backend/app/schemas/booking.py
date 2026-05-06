from datetime import datetime, date, time
from typing import List, Optional
from pydantic import BaseModel, EmailStr
import uuid
from app.models.user import UserRole
from app.models.client_booking import PhotographerStatus, EventStatus, BookingStatus, PaymentStatus


# --- Specialization Schemas ---

class SpecializationBase(BaseModel):
    category: str
    sub_category: str
    base_price: int
    description: str | None = None


class SpecializationCreate(SpecializationBase):
    pass


class SpecializationOut(SpecializationBase):
    id: uuid.UUID
    photographer_id: uuid.UUID

    class Config:
        from_attributes = True


# --- User & Profile Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ClientProfileBase(BaseModel):
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    referral_source: Optional[str] = None


class ClientProfileCreate(ClientProfileBase):
    pass


class ClientProfileOut(ClientProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    profile_photo_url: Optional[str] = None
    created_at: datetime
    full_name: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class PhotographerProfileBase(BaseModel):
    business_name: str
    bio: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    service_states: Optional[List[str]] = None
    service_districts: Optional[List[str]] = None
    travel_range_km: int = 50
    starting_price: int = 0


class PhotographerProfileCreate(PhotographerProfileBase):
    aadhaar_url: Optional[str] = None


class PhotographerProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    service_states: Optional[List[str]] = None
    service_districts: Optional[List[str]] = None
    travel_range_km: Optional[int] = None
    portfolio_urls: Optional[List[str]] = None
    profile_photo_url: Optional[str] = None
    starting_price: Optional[int] = None


class PhotographerProfileOut(PhotographerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    profile_photo_url: Optional[str] = None
    portfolio_urls: Optional[List[str]] = None
    status: PhotographerStatus
    verified_at: Optional[datetime] = None
    total_bookings: int
    rating: float
    starting_price: int
    user: Optional[UserOut] = None
    created_at: datetime
    specializations: Optional[List[SpecializationOut]] = None

    class Config:
        from_attributes = True


# --- Package Schemas ---

class PackageBase(BaseModel):
    name: str
    event_category: str
    applicable_sub_events: List[str] = ["all"]
    price: int
    price_per_hour: Optional[int] = None
    duration_hours: int
    photos_delivered: int
    edited_photos: int
    turnaround_days: int
    includes_reels: bool = False
    includes_album: bool = False
    includes_drone: bool = False
    includes_video: bool = False
    second_photographer: bool = False
    description: Optional[str] = None


class PackageCreate(PackageBase):
    pass


class PackageOut(PackageBase):
    id: uuid.UUID
    photographer_id: uuid.UUID
    is_active: bool

    class Config:
        from_attributes = True


# --- Availability Schemas ---

class AvailabilityBase(BaseModel):
    date: date
    is_available: bool = True


class AvailabilityOut(AvailabilityBase):
    id: uuid.UUID
    photographer_id: uuid.UUID

    class Config:
        from_attributes = True


# --- Booking & Event Schemas ---

class ClientEventCreate(BaseModel):
    event_category: str
    event_title: str
    state: str
    district: str
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    pincode: Optional[str] = None
    total_budget: Optional[int] = None
    # Mandatory booking fields
    photographer_id: uuid.UUID
    event_date: date
    start_time: time = "10:00:00"
    agreed_to_terms: bool = False


class ClientEventOut(BaseModel):
    id: uuid.UUID
    event_ref: str
    client_id: uuid.UUID
    event_category: str
    event_title: str
    state: str
    district: str
    venue_name: Optional[str]
    venue_address: Optional[str]
    pincode: Optional[str]
    status: EventStatus
    total_budget: Optional[int]
    created_at: datetime
    sub_events: List['SubEventBookingOut'] = []

    class Config:
        from_attributes = True


class SubEventBookingCreate(BaseModel):
    sub_event_name: str
    event_date: date
    start_time: time
    end_time: Optional[time] = None
    photographer_id: uuid.UUID
    package_id: Optional[uuid.UUID] = None
    specialization_id: Optional[uuid.UUID] = None


class PhotographerMiniOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    business_name: str
    
    class Config:
        from_attributes = True

class SubEventBookingOut(BaseModel):
    id: uuid.UUID
    client_event_id: uuid.UUID
    client_id: Optional[uuid.UUID] = None
    client_user_id: Optional[uuid.UUID] = None
    sub_event_name: str
    event_title: Optional[str] = None
    event_date: date
    start_time: time
    end_time: Optional[time]
    duration_hours: Optional[int]
    photographer_id: uuid.UUID
    package_id: Optional[uuid.UUID]
    specialization_id: Optional[uuid.UUID]
    agreed_price: int
    status: BookingStatus
    snapmoment_event_id: Optional[uuid.UUID]
    photographer_name: Optional[str] = None
    photographer: Optional[PhotographerMiniOut] = None
    agreed_to_terms_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Review Schemas ---

class ReviewCreate(BaseModel):
    rating: int
    review_text: Optional[str] = None


class ReviewOut(BaseModel):
    id: uuid.UUID
    sub_event_booking_id: uuid.UUID
    client_id: uuid.UUID
    photographer_id: uuid.UUID
    rating: int
    review_text: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ShortlistOut(BaseModel):
    id: uuid.UUID
    photographer_id: uuid.UUID
    created_at: datetime
    photographer: Optional[PhotographerProfileOut] = None

    class Config:
        from_attributes = True
