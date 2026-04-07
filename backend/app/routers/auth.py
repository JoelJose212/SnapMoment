from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.photographer import Photographer
from app.schemas import SignupRequest, LoginRequest, TokenResponse
from app.services.auth import hash_password, verify_password, create_token, require_photographer, get_current_user
from app.config import settings
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Photographer).where(Photographer.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    photographer = Photographer(
        id=uuid.uuid4(),
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        studio_name=data.studio_name,
        plan="free",
        is_active=True,
        is_verified=False,
    )
    db.add(photographer)
    await db.commit()
    await db.refresh(photographer)

    token = create_token({"sub": str(photographer.id), "role": "photographer", "email": photographer.email})
    return TokenResponse(access_token=token, role="photographer", user_id=str(photographer.id), full_name=photographer.full_name)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photographer).where(Photographer.email == data.email))
    photographer = result.scalar_one_or_none()

    if not photographer or not verify_password(data.password, photographer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not photographer.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_token({"sub": str(photographer.id), "role": "photographer", "email": photographer.email})
    return TokenResponse(access_token=token, role="photographer", user_id=str(photographer.id), full_name=photographer.full_name)


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(data: LoginRequest):
    if data.email != settings.ADMIN_EMAIL or not verify_password(data.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    token = create_token({"sub": "admin", "role": "admin", "email": data.email})
    return TokenResponse(access_token=token, role="admin", user_id="admin", full_name="Admin")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
