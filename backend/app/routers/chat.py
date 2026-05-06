from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, func
import uuid
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.chat import ChatMessage
from app.models.user import User, UserRole
from app.services.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatMessageCreate(BaseModel):
    receiver_id: uuid.UUID
    content: str
    booking_id: uuid.UUID = None

class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    other_user_id: uuid.UUID
    other_user_name: str
    other_user_location: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int

@router.post("/send", response_model=ChatMessageResponse)
async def send_message(
    data: ChatMessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    msg = ChatMessage(
        sender_id=user_id,
        receiver_id=data.receiver_id,
        content=data.content,
        booking_id=data.booking_id
    )
    from app.models.notification import Notification
    
    # Determine notification link based on receiver role
    rec_user_res = await db.execute(select(User).where(User.id == data.receiver_id))
    rec_user = rec_user_res.scalar_one_or_none()
    
    notif_link = f"/client/messages?id={user_id}"
    if rec_user and rec_user.role == UserRole.PHOTOGRAPHER:
        notif_link = f"/photographer/chat?id={user_id}"
        
    notif = Notification(
        user_id=data.receiver_id,
        type="message",
        title="New Message",
        content=f"You have a new message from {current_user.get('full_name', 'Someone')}",
        link=notif_link
    )
    db.add(msg)
    db.add(notif)
    
    await db.commit()
    await db.refresh(msg)
    return msg

@router.get("/history/{other_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    other_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Resolve all possible IDs for the interlocutor
    other_ids = [other_id]
    
    from app.models.client_booking import PhotographerProfile
    
    # If other_id is a User ID, find their Profile ID
    prof_res = await db.execute(select(PhotographerProfile.id).where(PhotographerProfile.user_id == other_id))
    pid = prof_res.scalars().first()
    if pid:
        other_ids.append(pid)
    
    # If other_id is a Profile ID, find their User ID
    user_res = await db.execute(select(PhotographerProfile.user_id).where(PhotographerProfile.id == other_id))
    uid = user_res.scalars().first()
    if uid:
        other_ids.append(uid)
    
    # 2. Fetch all messages between current user and any of these IDs
    query = select(ChatMessage).where(
        or_(
            and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id.in_(other_ids)),
            and_(ChatMessage.sender_id.in_(other_ids), ChatMessage.receiver_id == user_id)
        )
    ).order_by(ChatMessage.created_at.asc())
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # 3. Mark incoming messages as read
    for msg in messages:
        if msg.receiver_id == user_id and not msg.is_read:
            msg.is_read = True
    
    await db.commit()
    return messages

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = uuid.UUID(current_user["sub"])
    
    # 1. Find all unique user IDs that the current user has chatted with
    # Get IDs where I am the sender
    sent_res = await db.execute(select(ChatMessage.receiver_id).where(ChatMessage.sender_id == user_id).distinct())
    sent_ids = set(sent_res.scalars().all())
    
    # Get IDs where I am the receiver
    rec_res = await db.execute(select(ChatMessage.sender_id).where(ChatMessage.receiver_id == user_id).distinct())
    rec_ids = set(rec_res.scalars().all())
    
    # Combine and remove my own ID just in case
    raw_interlocutor_ids = sent_ids.union(rec_ids)
    if user_id in raw_interlocutor_ids:
        raw_interlocutor_ids.remove(user_id)
    
    # Normalize IDs (Convert Profile IDs to User IDs if necessary)
    interlocutor_ids = set()
    from app.models.client_booking import PhotographerProfile, ClientProfile, ClientEvent, SubEventBooking
    
    for rid in raw_interlocutor_ids:
        # Check if this ID is a PhotographerProfile ID
        prof_res = await db.execute(select(PhotographerProfile.user_id).where(PhotographerProfile.id == rid))
        uid = prof_res.scalar_one_or_none()
        if uid:
            interlocutor_ids.add(uid)
        else:
            interlocutor_ids.add(rid)
            
    # Also include clients I have a booking with (even if no messages yet)
    booking_clients_res = await db.execute(
        select(ClientProfile.user_id)
        .join(ClientEvent, ClientEvent.client_id == ClientProfile.id)
        .join(SubEventBooking, SubEventBooking.client_event_id == ClientEvent.id)
        .join(PhotographerProfile, SubEventBooking.photographer_id == PhotographerProfile.id)
        .where(PhotographerProfile.user_id == user_id)
        .distinct()
    )
    booking_client_ids = set(booking_clients_res.scalars().all())
    interlocutor_ids = interlocutor_ids.union(booking_client_ids)

    conversations = []
    
    for uid in interlocutor_ids:
        # 2. Get the other user's identity (Name or Studio Name)
        # Check if they are a photographer
        photo_res = await db.execute(
            select(PhotographerProfile).where(PhotographerProfile.user_id == uid)
        )
        photo_profile = photo_res.scalar_one_or_none()
        
        # Get User details
        u_res = await db.execute(select(User).where(User.id == uid))
        other_user = u_res.scalar_one_or_none()
        
        if not other_user:
            continue
            
        display_name = photo_profile.business_name if photo_profile else (other_user.full_name or "Unknown User")
        
        # 3. Get the latest message for this conversation
        # We need to check for messages sent to either their User ID or their Profile ID
        other_ids = [uid]
        if photo_profile:
            other_ids.append(photo_profile.id)

        last_res = await db.execute(
            select(ChatMessage).where(
                or_(
                    and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id.in_(other_ids)),
                    and_(ChatMessage.sender_id.in_(other_ids), ChatMessage.receiver_id == user_id)
                )
            ).order_by(desc(ChatMessage.created_at)).limit(1)
        )
        last_msg = last_res.scalar_one_or_none()
        
        last_message_content = last_msg.content if last_msg else "Start a new conversation"
        last_message_time = last_msg.created_at if last_msg else datetime.now()
        # 4. Count unread messages
        unread_res = await db.execute(
            select(func.count(ChatMessage.id)).where(
                and_(
                    ChatMessage.sender_id.in_(other_ids), 
                    ChatMessage.receiver_id == user_id, 
                    ChatMessage.is_read == False
                )
            )
        )
        # Get Client profile if they are not a photographer
        location_str = None
        if not photo_profile:
            from app.models.client_booking import ClientProfile
            client_res = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uid))
            client_profile = client_res.scalar_one_or_none()
            if client_profile and client_profile.city and client_profile.state:
                location_str = f"{client_profile.city}, {client_profile.state}"
        
        unread_count = unread_res.scalar() or 0
        
        conversations.append(ConversationResponse(
            other_user_id=uid,
            other_user_name=display_name,
            other_user_location=location_str,
            last_message=last_message_content,
            last_message_at=last_message_time,
            unread_count=unread_count
        ))
        
    # 5. Sort by most recent activity
    conversations.sort(key=lambda x: x.last_message_at, reverse=True)
    return conversations
