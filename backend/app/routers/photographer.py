from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
import uuid
from typing import List

from app.database import get_db
from app.models import User, PhotographerProfile
from app.models.specialization import PhotographerSpecialization
from app.schemas.booking import (
    PhotographerProfileOut, 
    PhotographerProfileUpdate,
    SpecializationCreate,
    SpecializationOut
)
from app.services.auth import get_current_user
from app.services import s3

router = APIRouter(prefix="/api/photographer", tags=["photographer"])

@router.get("/profile", response_model=PhotographerProfileOut)
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id_str = current_user.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if user_id_str == "admin":
        raise HTTPException(status_code=403, detail="Admin has no profile")

    user_id = uuid.UUID(user_id_str)
    result = await db.execute(
        select(PhotographerProfile)
        .options(
            selectinload(PhotographerProfile.specializations),
            joinedload(PhotographerProfile.user)
        )
        .where(PhotographerProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        # Check if user exists
        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Create profile
        profile = PhotographerProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            business_name=user.full_name or "My Studio",
            status="pending"
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
        # Re-fetch with relationships to avoid lazy loading during serialization
        result = await db.execute(
            select(PhotographerProfile)
            .options(
                selectinload(PhotographerProfile.specializations),
                joinedload(PhotographerProfile.user)
            )
            .where(PhotographerProfile.id == profile.id)
        )
        profile = result.scalar_one()
        
    return profile

@router.patch("/profile", response_model=PhotographerProfileOut)
async def update_my_profile(
    data: PhotographerProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(
        select(PhotographerProfile)
        .options(
            selectinload(PhotographerProfile.specializations),
            joinedload(PhotographerProfile.user)
        )
        .where(PhotographerProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    await db.commit()
    await db.refresh(profile)
    
    # Re-fetch with relationships to avoid lazy loading during serialization
    result = await db.execute(
        select(PhotographerProfile)
        .options(
            selectinload(PhotographerProfile.specializations),
            joinedload(PhotographerProfile.user)
        )
        .where(PhotographerProfile.id == profile.id)
    )
    return result.scalar_one()

@router.post("/portfolio/upload")
async def upload_portfolio_item(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    print(f"DEBUG: Uploading portfolio for user {user_id}, profile {profile.id}")
    try:
        content = await file.read()
        print(f"DEBUG: File size: {len(content)} bytes")
        key = f"portfolios/{profile.id}/{uuid.uuid4()}.{file.filename.split('.')[-1]}"
        url = await s3.upload_file(content, key, content_type=file.content_type)
        print(f"DEBUG: Uploaded to {url}")

        # Ensure portfolio_urls is initialized
        current_urls = profile.portfolio_urls or []
        # Create a new list to ensure SQLAlchemy detects the change
        profile.portfolio_urls = list(current_urls) + [url]
        
        await db.commit()
        await db.refresh(profile)
        print(f"DEBUG: Profile updated with new portfolio URL")
        
        return {"url": url, "portfolio_urls": profile.portfolio_urls}
    except Exception as e:
        print(f"ERROR in upload_portfolio_item: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/portfolio")
async def delete_portfolio_item(
    url: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if not profile.portfolio_urls or url not in profile.portfolio_urls:
        raise HTTPException(status_code=404, detail="Image not found in portfolio")

    # Remove from list
    new_urls = [u for u in profile.portfolio_urls if u != url]
    profile.portfolio_urls = new_urls
    
    await db.commit()
    await db.refresh(profile)
    
    # Try to delete from S3 if it's our URL
    if "/portfolios/" in url:
        try:
            key = url.split(".com/")[-1] if ".com/" in url else url.split("8000/")[-1]
            await s3.delete_file(key)
        except Exception as e:
            print(f"Warning: Failed to delete file from storage: {e}")

    return {"status": "success", "portfolio_urls": profile.portfolio_urls}

# --- Specializations ---

@router.get("/specializations", response_model=List[SpecializationOut])
async def get_my_specializations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(
        select(PhotographerSpecialization)
        .join(PhotographerProfile)
        .where(PhotographerProfile.user_id == user_id)
    )
    return result.scalars().all()

@router.post("/specializations", response_model=SpecializationOut)
async def add_specialization(
    data: SpecializationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    prof_res = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == user_id))
    profile = prof_res.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    spec = PhotographerSpecialization(
        id=uuid.uuid4(),
        photographer_id=profile.id,
        **data.model_dump()
    )
    db.add(spec)
    await db.commit()
    await db.refresh(spec)
    return spec

@router.patch("/specializations/{spec_id}", response_model=SpecializationOut)
async def update_specialization(
    spec_id: uuid.UUID,
    data: SpecializationCreate, # Reuse Create schema for simplicity or use a Partial one
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    # Verify ownership
    result = await db.execute(
        select(PhotographerSpecialization)
        .join(PhotographerProfile)
        .where(PhotographerProfile.user_id == user_id)
        .where(PhotographerSpecialization.id == spec_id)
    )
    spec = result.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(spec, key, value)
    
    await db.commit()
    await db.refresh(spec)
    return spec

@router.delete("/specializations/{spec_id}")
async def remove_specialization(
    spec_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(
        select(PhotographerSpecialization)
        .join(PhotographerProfile)
        .where(PhotographerProfile.user_id == user_id)
        .where(PhotographerSpecialization.id == spec_id)
    )
    spec = result.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    await db.delete(spec)
    await db.commit()
    return {"status": "success"}
