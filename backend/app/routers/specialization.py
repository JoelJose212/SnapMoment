import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel

from app.database import get_db
from app.models.client_booking import PhotographerProfile
from app.models.specialization import PhotographerSpecialization
from app.services.auth import get_current_user, require_photographer

router = APIRouter(prefix="/api/photographer/specializations", tags=["Photographer Specializations"])

from app.schemas.booking import SpecializationCreate, SpecializationOut

@router.get("", response_model=List[SpecializationOut])
async def get_my_specializations(
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    result = await db.execute(select(PhotographerSpecialization).where(PhotographerSpecialization.photographer_id == profile.id))
    return result.scalars().all()

@router.post("", response_model=SpecializationOut)
async def add_specialization(
    data: SpecializationCreate,
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check if already exists
    existing = await db.execute(
        select(PhotographerSpecialization).where(
            PhotographerSpecialization.photographer_id == profile.id,
            PhotographerSpecialization.sub_category == data.sub_category
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Specialization already exists. Update it instead.")

    new_spec = PhotographerSpecialization(
        photographer_id=profile.id,
        **data.model_dump()
    )
    db.add(new_spec)
    await db.commit()
    await db.refresh(new_spec)
    return new_spec

@router.put("/{spec_id}", response_model=SpecializationOut)
async def update_specialization(
    spec_id: uuid.UUID,
    data: SpecializationCreate,
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(PhotographerSpecialization).where(
            PhotographerSpecialization.id == spec_id,
            PhotographerSpecialization.photographer_id == profile.id
        )
    )
    spec = result.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    
    spec.base_price = data.base_price
    spec.description = data.description
    
    await db.commit()
    await db.refresh(spec)
    return spec

@router.delete("/{spec_id}")
async def remove_specialization(
    spec_id: uuid.UUID,
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(PhotographerSpecialization).where(
            PhotographerSpecialization.id == spec_id,
            PhotographerSpecialization.photographer_id == profile.id
        )
    )
    spec = result.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    
    await db.delete(spec)
    await db.commit()
    return {"message": "Specialization removed"}
