import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.collaboration import EventCollaboration
from app.models.photographer import Photographer
from app.models.event import Event
from app.services.auth import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/collaborations", tags=["collaboration"])


class CollaborationInvite(BaseModel):
    event_id: uuid.UUID
    email: EmailStr
    role: str = "contributor"


class CollaborationOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    event_name: str
    photographer_name: str
    photographer_email: str
    role: str

    class Config:
        from_attributes = True


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_collaborator(
    data: CollaborationInvite,
    current_user: Photographer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Verify event ownership
    res = await db.execute(select(Event).where(Event.id == data.event_id, Event.photographer_id == current_user.id))
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")

    # 2. Find photographer by email
    res = await db.execute(select(Photographer).where(Photographer.email == data.email))
    target = res.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Photographer with this email not found")
    
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot invite yourself")

    # 3. Create collaboration record
    collab = EventCollaboration(
        id=uuid.uuid4(),
        event_id=data.event_id,
        photographer_id=target.id,
        role=data.role,
        invited_by=current_user.id
    )
    db.add(collab)
    
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Photographer is already a collaborator for this event")
    
    return {"message": "Collaborator invited successfully"}


@router.get("/my-shared-events", response_model=List[CollaborationOut])
async def get_my_shared_events(
    current_user: Photographer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Events where I am a collaborator
    query = (
        select(EventCollaboration, Event.name, Photographer.full_name, Photographer.email)
        .join(Event, EventCollaboration.event_id == Event.id)
        .join(Photographer, EventCollaboration.photographer_id == Photographer.id)
        .where(EventCollaboration.photographer_id == current_user.id)
    )
    res = await db.execute(query)
    rows = res.all()
    
    return [
        CollaborationOut(
            id=row[0].id,
            event_id=row[0].event_id,
            event_name=row[1],
            photographer_name=row[2],
            photographer_email=row[3],
            role=row[0].role
        ) for row in rows
    ]


@router.delete("/{collaboration_id}")
async def remove_collaboration(
    collaboration_id: uuid.UUID,
    current_user: Photographer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only the event owner or the collaborator themselves can remove a collaboration
    res = await db.execute(
        select(EventCollaboration, Event.photographer_id)
        .join(Event, EventCollaboration.event_id == Event.id)
        .where(EventCollaboration.id == collaboration_id)
    )
    row = res.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    
    collab, owner_id = row
    if current_user.id != owner_id and current_user.id != collab.photographer_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    await db.execute(delete(EventCollaboration).where(EventCollaboration.id == collaboration_id))
    await db.commit()
    return {"message": "Collaboration removed"}
