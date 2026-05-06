from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, not_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional
from datetime import date, datetime
import uuid
from app.models.photographer import Photographer

from app.database import get_db
from app.models.user import User, UserRole
from app.models.client_booking import (
    ClientProfile, 
    PhotographerProfile, 
    PhotographerPackage, 
    PhotographerAvailability, 
    ClientEvent, 
    SubEventBooking, 
    PhotographerReview,
    PhotographerStatus,
    BookingStatus
)
from app.schemas.booking import (
    ClientEventCreate, ClientEventOut,
    SubEventBookingCreate, SubEventBookingOut,
    PhotographerProfileOut, PackageOut, ReviewOut, ReviewCreate,
    AvailabilityOut, AvailabilityBase, ClientProfileOut
)
from app.services.auth import get_current_user, require_admin
from app.services import booking_service
from app.utils import india_locations

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# ── LOCATION ENDPOINTS ──────────────────────────

@router.get("/locations/states")
def get_states():
    return india_locations.get_states()

@router.get("/locations/districts/{state}")
def get_districts(state: str):
    return india_locations.get_districts(state)

# ── DISCOVERY ENDPOINTS ─────────────────────────

@router.get("/photographers/search", response_model=List[PhotographerProfileOut])
async def search_photographers(
    state: Optional[str] = None,
    district: Optional[str] = None,
    event_category: Optional[str] = None,
    date_val: Optional[date] = None,
    min_price: int = 0,
    max_price: int = 1000000,
    sort: str = "rating", # rating, price_low, price_high
    db: AsyncSession = Depends(get_db)
):
    query = select(PhotographerProfile).options(
        selectinload(PhotographerProfile.specializations),
        selectinload(PhotographerProfile.user)
    )
    
    filters = [PhotographerProfile.status.in_([PhotographerStatus.VERIFIED, PhotographerStatus.PENDING])]
    
    if state:
        filters.append(or_(
            PhotographerProfile.service_states.any(state),
            PhotographerProfile.service_states.any("All India"),
            PhotographerProfile.service_states.is_(None)
        ))
    if district:
        filters.append(or_(
            PhotographerProfile.service_districts.any(district),
            PhotographerProfile.service_districts.any("All India"),
            PhotographerProfile.service_districts.is_(None)
        ))
        
    # Price filtering: Check starting_price on profile
    profile_price_filter = PhotographerProfile.starting_price.between(min_price, max_price)
    
    # Check if any package matches the criteria (category and price)
    package_exists = select(1).where(
        and_(
            PhotographerPackage.photographer_id == PhotographerProfile.id,
            PhotographerPackage.price.between(min_price, max_price)
        )
    )
    if event_category:
        package_exists = package_exists.where(PhotographerPackage.event_category == event_category)
    
    filters.append(or_(profile_price_filter, package_exists.exists()))
    
    if date_val:
        # Check if NOT booked on this date
        conflict_subquery = select(SubEventBooking.photographer_id).where(
            and_(
                SubEventBooking.event_date == date_val,
                SubEventBooking.status != BookingStatus.CANCELLED
            )
        )
        filters.append(not_(PhotographerProfile.id.in_(conflict_subquery)))
        
        # Also check PhotographerAvailability for manual blocks
        availability_subquery = select(PhotographerAvailability.photographer_id).where(
            and_(
                PhotographerAvailability.date == date_val,
                PhotographerAvailability.is_available == False
            )
        )
        filters.append(not_(PhotographerProfile.id.in_(availability_subquery)))

    query = query.where(and_(*filters))
    
    if sort == "rating":
        query = query.order_by(PhotographerProfile.rating.desc())
    elif sort == "price_low":
        query = query.order_by(PhotographerProfile.starting_price.asc())
    elif sort == "price_high":
        query = query.order_by(PhotographerProfile.starting_price.desc())
    else:
        query = query.order_by(PhotographerProfile.rating.desc())
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/photographers/{id}", response_model=PhotographerProfileOut)
async def get_photographer_profile(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PhotographerProfile)
        .options(
            selectinload(PhotographerProfile.specializations),
            joinedload(PhotographerProfile.user)
        )
        .where(PhotographerProfile.id == id)
    )
    photog = result.scalar_one_or_none()
    if not photog:
        raise HTTPException(status_code=404, detail="Photographer not found")
    return photog

@router.get("/photographers/{id}/packages", response_model=List[PackageOut])
async def get_photographer_packages(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PhotographerPackage).where(PhotographerPackage.photographer_id == id))
    return result.scalars().all()

# ── CLIENT EVENT ENDPOINTS ──────────────────────

@router.post("/events", response_model=ClientEventOut)
async def create_event(
    data: ClientEventCreate, 
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get client profile
    client_result = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=400, detail="Client profile not found")
        
    try:
        return await booking_service.create_client_event(
            client_id=client.id,
            event_category=data.event_category,
            event_title=data.event_title,
            state=data.state,
            district=data.district,
            venue_name=data.venue_name,
            venue_address=data.venue_address,
            pincode=data.pincode,
            total_budget=data.total_budget,
            photographer_id=data.photographer_id,
            event_date=data.event_date,
            start_time=data.start_time,
            agreed_to_terms=data.agreed_to_terms,
            db=db
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Backend Error: {str(e)}")

@router.get("/events", response_model=List[ClientEventOut])
async def get_my_events(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    client_result = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_result.scalar_one_or_none()
    if not client:
        return []
    
    result = await db.execute(
        select(ClientEvent)
        .where(ClientEvent.client_id == client.id)
        .options(
            selectinload(ClientEvent.sub_events).selectinload(SubEventBooking.photographer)
        )
        .order_by(ClientEvent.created_at.desc())
    )
    events = result.scalars().all()
    
    # Manual population for photographer_name if needed, or rely on ORM if schema is compatible
    # Actually, let's just make sure the schemas handle it
    for event in events:
        for sub in event.sub_events:
            if sub.photographer:
                sub.photographer_name = sub.photographer.business_name
                
    return events

@router.get("/events/{id}", response_model=ClientEventOut)
async def get_event_details(
    id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    client_result = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=403, detail="Not a client")

    
    result = await db.execute(
        select(ClientEvent)
        .where(and_(ClientEvent.id == id, ClientEvent.client_id == client.id))
        .options(
            selectinload(ClientEvent.sub_events).selectinload(SubEventBooking.photographer)
        )
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for sub in event.sub_events:
        if sub.photographer:
            sub.photographer_name = sub.photographer.business_name
            
    return event

@router.post("/events/{id}/book", response_model=SubEventBookingOut)
async def book_sub_event(
    id: uuid.UUID,
    data: SubEventBookingCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify event belongs to client
    event = await db.get(ClientEvent, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Check client profile
    client_result = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_result.scalar_one_or_none()
    if not client or event.client_id != client.id:
        raise HTTPException(status_code=403, detail="Not authorized to book for this event")
        
    return await booking_service.book_photographer_for_sub_event(
        client_event_id=id,
        sub_event_name=data.sub_event_name,
        photographer_id=data.photographer_id,
        package_id=data.package_id,
        specialization_id=data.specialization_id,
        event_date=data.event_date,
        start_time=data.start_time,
        db=db
    )

# ── PHOTOGRAPHER MANAGEMENT ENDPOINTS ───────────

@router.put("/photographer/availability", response_model=List[AvailabilityOut])
async def update_availability(
    dates: List[AvailabilityBase],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    photog_result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    photog = photog_result.scalar_one_or_none()
    if not photog:
        raise HTTPException(status_code=403, detail="Not a photographer")
        
    # Simple clear and replace for simplicity in this dev phase
    # In production, we'd do upserts
    await db.execute(select(PhotographerAvailability).where(PhotographerAvailability.photographer_id == photog.id).delete())
    
    new_availabilities = [
        PhotographerAvailability(
            id=uuid.uuid4(),
            photographer_id=photog.id,
            date=d.date,
            is_available=d.is_available
        ) for d in dates
    ]
    db.add_all(new_availabilities)
    await db.commit()
    return new_availabilities

@router.get("/photographer/bookings", response_model=List[SubEventBookingOut])
async def get_photographer_bookings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    photog_result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    photog = photog_result.scalar_one_or_none()
    if not photog:
        raise HTTPException(status_code=403, detail="Not a photographer")
    
    result = await db.execute(
        select(SubEventBooking)
        .where(SubEventBooking.photographer_id == photog.id)
        .options(
            selectinload(SubEventBooking.photographer),
            selectinload(SubEventBooking.client_event).selectinload(ClientEvent.client)
        )
        .order_by(SubEventBooking.created_at.desc())
    )
    bookings = result.scalars().all()
    
    # Enrich with client event title
    for b in bookings:
        if b.client_event:
            b.event_title = b.client_event.event_title
            b.client_id = b.client_event.client_id
            if b.client_event.client:
                b.client_user_id = b.client_event.client.user_id
            # Also update sub_event_name if it was a default one to make it look nicer
            if "Main Event" in b.sub_event_name:
                b.sub_event_name = b.client_event.event_title
                
    return bookings

@router.get("/photographer/clients/{client_id}", response_model=ClientProfileOut)
async def get_client_details_for_photographer(
    client_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify the requester is a photographer
    photog_result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    photog = photog_result.scalar_one_or_none()
    if not photog:
        raise HTTPException(status_code=403, detail="Not a photographer")
    
    # Verify the photographer has a booking with this client
    # Path: SubEventBooking -> ClientEvent -> ClientProfile
    booking_check = await db.execute(
        select(SubEventBooking)
        .join(ClientEvent, SubEventBooking.client_event_id == ClientEvent.id)
        .where(
            and_(
                SubEventBooking.photographer_id == photog.id,
                ClientEvent.client_id == client_id
            )
        )
    )
    if not booking_check.first():
        raise HTTPException(status_code=403, detail="You do not have a booking with this client")
    
    # Fetch client profile with user info
    result = await db.execute(
        select(ClientProfile)
        .options(selectinload(ClientProfile.user))
        .where(ClientProfile.id == client_id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Enrich with user info
    client_out = ClientProfileOut.from_orm(client)
    if client.user:
        client_out.full_name = client.user.full_name
        client_out.email = client.user.email
        
    return client_out

@router.patch("/photographer/bookings/{booking_id}/respond")
async def respond_to_booking(
    booking_id: uuid.UUID,
    action: str, # accept, reject
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    photog_result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
    photog = photog_result.scalar_one_or_none()
    
    booking = await db.get(SubEventBooking, booking_id)
    if not booking or booking.photographer_id != photog.id:
        raise HTTPException(status_code=404, detail="Booking not found or not yours")

    if action == "accept":
        await booking_service.accept_booking(booking_id, db)
        return {"status": "accepted"}
    elif action == "reject":
        await booking_service.reject_booking(booking_id, db)
        return {"status": "rejected"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@router.delete("/photographer/bookings/{booking_id}")
async def cancel_booking_endpoint(
    booking_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    role = current_user.get("role")
    booking = await db.get(SubEventBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if role == "client":
        if booking.status != BookingStatus.PENDING:
            raise HTTPException(
                status_code=403, 
                detail="Elite Tier Policy: Confirmed bookings cannot be cancelled by the client. Please Raise a Disagreement."
            )
    elif role == "photographer":
        # Photographers can cancel (reject) their own bookings
        photog_result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.user_id == uuid.UUID(current_user["sub"])))
        photog = photog_result.scalar_one_or_none()
        if not photog or booking.photographer_id != photog.id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    await booking_service.reject_booking(booking_id, db)
    return {"status": "cancelled"}
@router.post("/events/{booking_id}/dispute")
async def dispute_booking_endpoint(
    booking_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify client owns this booking
    client_result = await db.execute(select(ClientProfile).where(ClientProfile.user_id == uuid.UUID(current_user["sub"])))
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=403, detail="Not a client")
        
    booking = await db.get(SubEventBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Check ownership via parent event
    event = await db.get(ClientEvent, booking.client_event_id)
    if not event or event.client_id != client.id:
        raise HTTPException(status_code=403, detail="Not authorized to dispute this booking")
        
    return await booking_service.dispute_booking(booking_id, db)

# ── ADMIN ENDPOINTS ────────────────────────────

@router.get("/admin/pending", response_model=List[PhotographerProfileOut])
async def get_pending_photographers(
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(PhotographerProfile).where(PhotographerProfile.status == PhotographerStatus.PENDING))
    return result.scalars().all()

@router.post("/admin/verify/{id}")
async def verify_photographer(
    id: uuid.UUID,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    photog = await db.get(PhotographerProfile, id)
    if not photog:
        raise HTTPException(status_code=404, detail="Photographer profile not found")
        
    photog.status = PhotographerStatus.VERIFIED
    photog.verified_at = datetime.utcnow()
    photog.verified_by = uuid.UUID(current_user["sub"]) if current_user["sub"] != "admin" else None
    
    # Also update legacy photographer record
    legacy = await db.get(Photographer, photog.user_id)
    if legacy:
        legacy.is_verified = True
        
    await db.commit()
    
    # Notify Photographer
    user = await db.get(User, photog.user_id)
    if user:
        await booking_service.send_email(
            to=user.email,
            subject="🎉 You're verified on SnapMoment!",
            body="""
            Congratulations! Your profile has been verified.
            You can now receive bookings on SnapMoment.
            
            Complete your profile:
            → Add your packages
            → Set your availability
            → Upload portfolio photos
            """
        )
        
    return {"status": "verified"}
