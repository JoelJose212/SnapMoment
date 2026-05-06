from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime

from app.database import get_db
from app.models.photographer import Photographer
from app.models.user import User, UserRole
from app.models.client_booking import ClientProfile, PhotographerProfile
from app.schemas import SignupRequest, LoginRequest, TokenResponse
from app.services.auth import hash_password, verify_password, create_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/client/signup", response_model=TokenResponse)
async def client_signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.CLIENT,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    
    profile = ClientProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        phone=data.phone,
        state=data.state,
        district=data.district,
        city=data.city,
        pincode=data.pincode,
        dob=data.dob,
        gender=data.gender,
        referral_source=data.referral_source
    )
    db.add(profile)
    
    await db.commit()
    await db.refresh(user)

    token = create_token({"sub": str(user.id), "role": "client", "email": user.email})
    return TokenResponse(
        access_token=token, 
        role=UserRole.CLIENT.value, 
        user_id=str(user.id), 
        full_name=user.full_name, 
        email=user.email,
        onboarding_step=1,
        subscription_active=True
    )

@router.post("/photographer/signup", response_model=TokenResponse)
async def photographer_signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Create User
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.PHOTOGRAPHER,
        is_active=True,
        is_verified=False
    )
    db.add(user)
    
    # Create Photographer Profile (Marketplace)
    profile = PhotographerProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        business_name=data.studio_name or data.full_name,
        status="pending"
    )
    db.add(profile)
    
    # Also create legacy Photographer record for compatibility with existing dashboard
    legacy = Photographer(
        id=user.id, # Keep ID same for now
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=user.password_hash,
        studio_name=data.studio_name,
        plan="free"
    )
    db.add(legacy)
    
    await db.commit()
    await db.refresh(user)

    token = create_token({"sub": str(user.id), "role": "photographer", "email": user.email})
    return TokenResponse(
        access_token=token, 
        role="photographer", 
        user_id=str(user.id), 
        full_name=user.full_name, 
        onboarding_step=1,
        subscription_active=True
    )

@router.post("/login", response_model=TokenResponse)
async def unified_login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Check User table
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        
        if user and verify_password(data.password, user.password_hash):
            onboarding_step = 1
            sub_active = True
            
            # If photographer, fetch details from Photographer table
            if user.role == UserRole.PHOTOGRAPHER:
                res = await db.execute(select(Photographer).where(Photographer.id == user.id))
                photog = res.scalar_one_or_none()
                if photog:
                    onboarding_step = photog.onboarding_step
                    # If verified, they should at least be past onboarding
                    if photog.is_verified and onboarding_step < 6:
                        onboarding_step = 6
                    
                    from datetime import timezone
                    if photog.subscription_expires_at and photog.subscription_expires_at < datetime.now(timezone.utc):
                        sub_active = False
            
            token = create_token({"sub": str(user.id), "role": user.role.value, "email": user.email})
            return TokenResponse(
                access_token=token,
                role=user.role.value,
                user_id=str(user.id),
                full_name=user.full_name or "",
                email=user.email,
                onboarding_step=onboarding_step,
                subscription_active=sub_active
            )
            
        # 2. Legacy Photographer Fallback
        result = await db.execute(select(Photographer).where(Photographer.email == data.email))
        photographer = result.scalar_one_or_none()
        
        if photographer and verify_password(data.password, photographer.password_hash):
            # AUTO-MIGRATE TO NEW TABLES
            try:
                user = User(
                    id=photographer.id, # Keep existing ID
                    email=photographer.email,
                    password_hash=photographer.password_hash,
                    full_name=photographer.full_name,
                    role=UserRole.PHOTOGRAPHER,
                    is_active=photographer.is_active,
                    is_verified=photographer.is_verified
                )
                db.add(user)
                
                # Create Photographer Profile if missing
                prof_res = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == photographer.id))
                if not prof_res.scalar_one_or_none():
                    new_profile = PhotographerProfile(
                        id=uuid.uuid4(),
                        user_id=user.id,
                        business_name=photographer.studio_name or photographer.full_name,
                        status="verified" if photographer.is_verified else "pending"
                    )
                    db.add(new_profile)
                
                await db.commit()
                await db.refresh(user)
            except Exception as migrate_err:
                await db.rollback()
                # If migration fails (e.g. user already exists), just continue to token generation
                # as long as we have some user record to work with.
                # But here we didn't find one in Step 1, so this is a real error.
                raise HTTPException(status_code=500, detail=f"Migration error: {str(migrate_err)}")

            from datetime import timezone
            sub_active = True
            if photographer.subscription_expires_at and photographer.subscription_expires_at < datetime.now(timezone.utc):
                sub_active = False
                
            token = create_token({"sub": str(user.id), "role": "photographer", "email": user.email})
            return TokenResponse(
                access_token=token, 
                role="photographer", 
                user_id=str(user.id), 
                full_name=user.full_name or photographer.full_name, 
                email=user.email,
                onboarding_step=photographer.onboarding_step,
                subscription_active=sub_active
            )

        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Login Error: {str(e)}")

@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(data: LoginRequest):
    if data.email != settings.ADMIN_EMAIL or data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
    token = create_token({"sub": "admin", "role": "admin", "email": data.email})
    return TokenResponse(access_token=token, role="admin", user_id="admin", full_name="Admin", email=data.email)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
