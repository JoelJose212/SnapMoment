import random
import string
import uuid
import logging
from datetime import datetime, date, time
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, not_, delete
from app.models.user import User, UserRole
from app.models.client_booking import (
    ClientProfile, 
    PhotographerProfile, 
    PhotographerPackage, 
    PhotographerAvailability, 
    ClientEvent, 
    SubEventBooking, 
    PhotographerStatus,
    EventStatus,
    BookingStatus
)
from app.models.specialization import PhotographerSpecialization
from app.services.email import send_email # Assuming this exists or will be updated

logger = logging.getLogger(__name__)

async def create_booking_ref() -> str:
    """Generate a unique booking reference like SMB-2024-54321"""
    year = datetime.now().year
    rand = ''.join(random.choices(string.digits, k=5))
    return f"SMB-{year}-{rand}"

async def create_client_event(
    client_id: uuid.UUID,
    event_category: str,
    event_title: str,
    state: str,
    district: str,
    venue_name: Optional[str],
    venue_address: Optional[str],
    pincode: Optional[str],
    total_budget: Optional[int],
    photographer_id: uuid.UUID,
    event_date: date,
    start_time: time,
    agreed_to_terms: bool,
    db: AsyncSession
) -> ClientEvent:
    if not agreed_to_terms:
        raise HTTPException(status_code=400, detail="You must agree to the Terms & Conditions")
    
    ref = await create_booking_ref()
    
    event = ClientEvent(
        id=uuid.uuid4(),
        event_ref=ref,
        client_id=client_id,
        event_category=event_category,
        event_title=event_title,
        state=state,
        district=district,
        venue_name=venue_name,
        venue_address=venue_address,
        pincode=pincode,
        total_budget=total_budget,
        status=EventStatus.DRAFT
    )
    
    db.add(event)
    await db.flush() # Get the event ID
    
    # Create the primary booking request
    # Use the first specialization found for that category or a generic one
    from app.models.specialization import PhotographerSpecialization
    spec_res = await db.execute(
        select(PhotographerSpecialization)
        .where(and_(
            PhotographerSpecialization.photographer_id == photographer_id,
            PhotographerSpecialization.sub_category.ilike(f"%{event_category}%")
        ))
    )
    spec = spec_res.scalar_one_or_none()
    
    # If no spec found, just get the first active one
    if not spec:
        spec_res = await db.execute(
            select(PhotographerSpecialization)
            .where(PhotographerSpecialization.photographer_id == photographer_id)
            .limit(1)
        )
        spec = spec_res.scalar_one_or_none()
        
    spec_id = spec.id if spec else None

    booking = await book_photographer_for_sub_event(
        client_event_id=event.id,
        sub_event_name=event_title,
        photographer_id=photographer_id,
        package_id=None,
        specialization_id=spec_id,
        event_date=event_date,
        start_time=start_time,
        db=db
    )
    
    # Record T&C agreement on the booking
    booking.agreed_to_terms_at = datetime.now()
    
    await db.commit()
    
    # Reload event with sub_events relationship populated to prevent MissingGreenlet in FastAPI response
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ClientEvent)
        .options(selectinload(ClientEvent.sub_events).selectinload(SubEventBooking.photographer))
        .where(ClientEvent.id == event.id)
    )
    loaded_event = result.scalar_one()
    
    return loaded_event

async def book_photographer_for_sub_event(
    client_event_id: uuid.UUID,
    sub_event_name: str,
    photographer_id: uuid.UUID,
    package_id: Optional[uuid.UUID],
    specialization_id: Optional[uuid.UUID],
    event_date: date,
    start_time: time,
    db: AsyncSession
) -> SubEventBooking:
    
    # 1. Verify Photographer
    photog = await db.get(PhotographerProfile, photographer_id)
    if not photog or photog.status not in [PhotographerStatus.VERIFIED, PhotographerStatus.PENDING]:
        raise HTTPException(status_code=400, detail="Photographer profile is neither verified nor pending")
    
    # 2. Check Availability
    availability_conflict = await db.execute(
        select(PhotographerAvailability).where(
            and_(
                PhotographerAvailability.photographer_id == photographer_id,
                PhotographerAvailability.date == event_date,
                PhotographerAvailability.is_available == False
            )
        )
    )
    if availability_conflict.scalar():
        raise HTTPException(status_code=400, detail="Photographer is not available on this date")
    
    # 3. Check for existing bookings
    existing_booking = await db.execute(
        select(SubEventBooking).where(
            and_(
                SubEventBooking.photographer_id == photographer_id,
                SubEventBooking.event_date == event_date,
                SubEventBooking.status != BookingStatus.CANCELLED
            )
        )
    )
    if existing_booking.scalar():
        raise HTTPException(status_code=400, detail="Photographer already has a booking on this date")
    
    agreed_price = 0
    if package_id:
        package = await db.get(PhotographerPackage, package_id)
        if not package or not package.is_active:
            raise HTTPException(status_code=400, detail="Invalid or inactive package")
        if "all" not in package.applicable_sub_events and sub_event_name not in package.applicable_sub_events:
            raise HTTPException(status_code=400, detail=f"This package does not cover {sub_event_name}")
        agreed_price = package.price
    elif specialization_id:
        spec = await db.get(PhotographerSpecialization, specialization_id)
        if not spec:
            raise HTTPException(status_code=400, detail="Invalid specialization")
        agreed_price = spec.base_price
    else:
        # Fallback to starting price if no package/spec
        agreed_price = photog.starting_price or 0

    # 5. Create Sub-event Booking
    booking = SubEventBooking(
        id=uuid.uuid4(),
        client_event_id=client_event_id,
        sub_event_name=sub_event_name,
        event_date=event_date,
        start_time=start_time,
        photographer_id=photographer_id,
        package_id=package_id,
        specialization_id=specialization_id,
        agreed_price=agreed_price,
        status=BookingStatus.PENDING
    )
    db.add(booking)
    
    # 6. Block the date (Wait until confirmed? User said "the notification should go to the photograher panel... so the photo have the full right to accept")
    # We won't block the date until ACCEPTED
    
    # 7. Update event status
    event = await db.get(ClientEvent, client_event_id)
    if event:
        event.status = EventStatus.CONFIRMED
        
    await db.commit()
    await db.refresh(booking)
    
    # 8. Dispatch Notifications (Async)
    try:
        await send_booking_notifications(booking, db)
    except Exception as e:
        logger.error(f"Failed to send booking notifications: {e}")
        
    return booking

async def send_booking_notifications(booking: SubEventBooking, db: AsyncSession):
    """Notify both client and photographer about the booking"""
    # This would require loading relationships, which might be tricky in async without eager loading
    # For now, let's fetch the emails manually
    
    # Load relationships
    # booking = await db.get(SubEventBooking, booking.id, options=[joinedload(SubEventBooking.photographer), ...])
    # For brevity, let's assume we fetch what's needed
    
    photog_profile = await db.get(PhotographerProfile, booking.photographer_id)
    photog_user = await db.get(User, photog_profile.user_id)
    
    client_event = await db.get(ClientEvent, booking.client_event_id)
    client_profile = await db.get(ClientProfile, client_event.client_id)
    client_user = await db.get(User, client_profile.user_id)
    
    service_name = ""
    if booking.package_id:
        pkg = await db.get(PhotographerPackage, booking.package_id)
        service_name = f"Package: {pkg.name}" if pkg else "Standard Package"
    else:
        spec = await db.get(PhotographerSpecialization, booking.specialization_id)
        service_name = f"Specialization: {spec.sub_category}" if spec else "Custom Service"
    
    # Email to Client
    await send_email(
        to=client_user.email,
        subject=f"Booking Requested — {client_event.event_ref}",
        body=f"""
        Your booking request has been sent!
        
        The photographer is reviewing your request.
        
        Event:        {client_event.event_title} ({booking.sub_event_name})
        Photographer: {photog_profile.business_name}
        Date:         {booking.event_date}
        Service:      {service_name}
        Amount:       ₹{booking.agreed_price:,}
        
        You will receive a notification once the photographer responds.
        """
    )
    
    # Email to Photographer
    await send_email(
        to=photog_user.email,
        subject=f"Action Required: New Booking Request — {client_event.event_ref}",
        body=f"""
        You have a new booking request!
        
        Client:      {client_user.full_name}
        Date:        {booking.event_date}
        Location:    {client_event.venue_name}, {client_event.district}
        Service:     {service_name}
        Event:       {client_event.event_title} ({booking.sub_event_name})
        Total:       ₹{booking.agreed_price:,}
        
        Log in to your panel to Accept or Reject this booking.
        """
    )

async def accept_booking(booking_id: uuid.UUID, db: AsyncSession):
    booking = await db.get(SubEventBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus.CONFIRMED
    
    # Block the date now
    block = PhotographerAvailability(
        id=uuid.uuid4(),
        photographer_id=booking.photographer_id,
        date=booking.event_date,
        is_available=False
    )
    db.add(block)
    
    await db.commit()
    
    # Notify client
    client_event = await db.get(ClientEvent, booking.client_event_id)
    client_profile = await db.get(ClientProfile, client_event.client_id)
    client_user = await db.get(User, client_profile.user_id)
    
    await send_email(
        to=client_user.email,
        subject="✅ Booking Accepted!",
        body=f"Great news! Your booking for {booking.event_date} has been accepted. Log in to SnapMoment to proceed."
    )

async def reject_booking(booking_id: uuid.UUID, db: AsyncSession):
    booking = await db.get(SubEventBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    old_status = booking.status
    if old_status == BookingStatus.CONFIRMED:
        booking.status = BookingStatus.CANCELLED
        # Release the date
        await db.execute(
            delete(PhotographerAvailability).where(
                and_(
                    PhotographerAvailability.photographer_id == booking.photographer_id,
                    PhotographerAvailability.date == booking.event_date
                )
            )
        )
    else:
        booking.status = BookingStatus.REJECTED
        
    await db.commit()
    
    # Notify client
    client_event = await db.get(ClientEvent, booking.client_event_id)
    client_profile = await db.get(ClientProfile, client_event.client_id)
    client_user = await db.get(User, client_profile.user_id)
    
    subject = "❌ Booking Update"
    body = f"The photographer has rejected your request for {booking.event_date}."
    if old_status == BookingStatus.CONFIRMED:
        subject = "⚠️ Professional Commitment Cancelled"
        body = f"The photographer has cancelled their commitment for {booking.event_date} due to unforeseen circumstances. Please contact support or find another artist."

    await send_email(to=client_user.email, subject=subject, body=body)

async def dispute_booking(booking_id: uuid.UUID, db: AsyncSession):
    booking = await db.get(SubEventBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus.DISPUTED
    await db.commit()
    
    # Notify Photographer
    photog = await db.get(PhotographerProfile, booking.photographer_id)
    photog_user = await db.get(User, photog.user_id)
    
    await send_email(
        to=photog_user.email,
        subject="⚠️ New Booking Dispute Raised",
        body=f"A client has raised a disagreement regarding the booking on {booking.event_date}. Please check your dashboard to address this."
    )
    
    return booking
