from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid


# --- Auth Schemas ---
class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    studio_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str
    onboarding_step: int = 1
    subscription_active: bool = True


# --- Photographer Schemas ---
class PhotographerOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str]
    studio_name: Optional[str]
    watermark_url: Optional[str]
    plan: str
    onboarding_step: int
    subscription_expires_at: Optional[datetime]
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PhotographerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    studio_name: Optional[str] = None
    watermark_url: Optional[str] = None


class AdminPhotographerUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    plan: Optional[str] = None


# --- Event Schemas ---
class EventCreate(BaseModel):
    name: str
    type: str = "other"
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    photographer_note: Optional[str] = None


class EventUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    photographer_note: Optional[str] = None
    is_active: Optional[bool] = None
    cover_photo_url: Optional[str] = None
    ftp_password: Optional[str] = None
    ftp_enabled: Optional[bool] = None


class EventOut(BaseModel):
    id: uuid.UUID
    photographer_id: uuid.UUID
    name: str
    type: str
    event_date: Optional[datetime]
    location: Optional[str]
    description: Optional[str]
    cover_photo_url: Optional[str]
    qr_token: str
    vip_token: uuid.UUID
    is_active: bool
    expires_at: Optional[datetime]
    photographer_note: Optional[str]
    created_at: datetime
    ftp_password: Optional[str] = None
    ftp_enabled: bool = True
    photo_count: int = 0
    guest_count: int = 0

    class Config:
        from_attributes = True


class PublicEventOut(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    cover_photo_url: Optional[str] = None
    studio_logo_url: Optional[str] = None
    studio_name: Optional[str] = None
    is_active: bool = True
    photographer_note: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Photo Schemas ---
class PhotoOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    s3_url: Optional[str] = None
    original_s3_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: str = "processing"
    face_indexed: bool
    faces_count: int
    has_social_crops: bool = False
    uploaded_at: datetime

    class Config:
        from_attributes = True


# --- Guest Schemas ---
class OTPSendRequest(BaseModel):
    phone_number: str
    event_id: str


class OTPVerifyRequest(BaseModel):
    phone_number: str
    event_id: str
    full_name: str
    otp: str


class GuestTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    guest_id: str
    event_id: str


class GalleryPhotoOut(BaseModel):
    match_id: str
    photo_id: str
    event_id: str
    photo_url: str
    thumbnail_url: Optional[str]
    crop_1x1_url: Optional[str] = None
    crop_9x16_url: Optional[str] = None
    confidence_score: float
    is_reported: bool
    is_suggested: bool = False
    matched_at: datetime


# --- Process Status ---
class ProcessStatusOut(BaseModel):
    status: str
    processed: int
    total: int
    unique_faces: int


# --- Admin Stats ---
class AdminStatsOut(BaseModel):
    total_photographers: int
    active_events: int
    total_photos: int
    photos_per_day: list
    event_type_distribution: dict
    top_photographers: list


# --- Contact ---
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
