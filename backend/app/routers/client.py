from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
import uuid

from app.database import get_db
from app.models.client_booking import ClientProfile
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/client", tags=["client"])

class ClientProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: Optional[str]
    email: str
    phone: Optional[str]
    state: Optional[str]
    district: Optional[str]
    city: Optional[str]
    pincode: Optional[str]
    dob: Optional[date]
    gender: Optional[str]

    class Config:
        from_attributes = True

class ClientProfileUpdate(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None

@router.get("/profile", response_model=ClientProfileResponse)
async def get_client_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # Get user details
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Get client profile details
    prof_res = await db.execute(select(ClientProfile).where(ClientProfile.user_id == user_id))
    profile = prof_res.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")
        
    return ClientProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=profile.phone,
        state=profile.state,
        district=profile.district,
        city=profile.city,
        pincode=profile.pincode,
        dob=profile.dob,
        gender=profile.gender
    )

@router.patch("/profile", response_model=ClientProfileResponse)
async def update_client_profile(
    data: ClientProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    user = await db.get(User, user_id)
    prof_res = await db.execute(select(ClientProfile).where(ClientProfile.user_id == user_id))
    profile = prof_res.scalar_one_or_none()
    
    if not profile or not user:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Update allowed fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    await db.commit()
    await db.refresh(profile)
    
    return ClientProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=profile.phone,
        state=profile.state,
        district=profile.district,
        city=profile.city,
        pincode=profile.pincode,
        dob=profile.dob,
        gender=profile.gender
    )
