from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import selectinload, joinedload
from typing import List
import uuid

from app.database import get_db
from app.models.client_booking import PhotographerFavorite, ClientProfile, PhotographerProfile
from app.schemas.booking import ShortlistOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/shortlist", tags=["shortlist"])

@router.post("/{photographer_id}", status_code=status.HTTP_201_CREATED)
async def add_to_shortlist(
    photographer_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get client profile
    client_res = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=400, detail="Client profile not found")

    # Check if already shortlisted
    existing = await db.execute(
        select(PhotographerFavorite).where(
            and_(PhotographerFavorite.client_id == client.id, PhotographerFavorite.photographer_id == photographer_id)
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already in shortlist"}

    new_fav = PhotographerFavorite(client_id=client.id, photographer_id=photographer_id)
    db.add(new_fav)
    await db.commit()
    return {"message": "Added to shortlist"}

@router.delete("/{photographer_id}")
async def remove_from_shortlist(
    photographer_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    client_res = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=400, detail="Client profile not found")

    await db.execute(
        delete(PhotographerFavorite).where(
            and_(PhotographerFavorite.client_id == client.id, PhotographerFavorite.photographer_id == photographer_id)
        )
    )
    await db.commit()
    return {"message": "Removed from shortlist"}

@router.get("", response_model=List[ShortlistOut])
async def get_my_shortlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    client_res = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_res.scalar_one_or_none()
    if not client:
        return []

    result = await db.execute(
        select(PhotographerFavorite)
        .options(
            joinedload(PhotographerFavorite.photographer).options(
                selectinload(PhotographerProfile.specializations),
                joinedload(PhotographerProfile.user)
            )
        )
        .where(PhotographerFavorite.client_id == client.id)
        .order_by(PhotographerFavorite.created_at.desc())
    )
    return result.scalars().all()
