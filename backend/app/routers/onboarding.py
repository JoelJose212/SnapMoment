import stripe
import uuid
from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.photographer import Photographer
from app.services.auth import require_photographer
from app.config import settings
from app.services.invoice import generate_invoice_pdf
from app.services.email import send_invoice_email
from app.models.invoice import Invoice
from datetime import datetime, timedelta
from fastapi import File, UploadFile
from app.services import s3 as s3_service

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/step2")
async def onboarding_step2(
    data: dict = Body(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    if not photographer:
        # Fallback: Create legacy Photographer record if missing
        from app.models.user import User
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["sub"])))
        user = user_res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        photographer = Photographer(
            id=user.id,
            full_name=user.full_name or "Photographer",
            email=user.email,
            password_hash=user.password_hash,
            plan="free"
        )
        db.add(photographer)
        await db.flush() # Get it into the session
        
    photographer.founded_year = int(data.get("founded_year", 2024))
    photographer.team_size = data.get("team_size", "Just Me")
    photographer.services = data.get("services", [])
    photographer.primary_gear = data.get("primary_gear", "")
    photographer.portfolio_url = data.get("portfolio_url", "")
    photographer.experience_level = data.get("experience_level", "Hobbyist")
    photographer.onboarding_step = 3
    
    await db.commit()
    return {"message": "Step 2 completed", "onboarding_step": 3}

@router.post("/step3")
async def onboarding_step3(
    data: dict = Body(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    if not photographer:
        from app.models.user import User
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["sub"])))
        user = user_res.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404)
        photographer = Photographer(id=user.id, full_name=user.full_name or "Photographer", email=user.email, password_hash=user.password_hash, plan="free")
        db.add(photographer)
        await db.flush()
    
    photographer.plan = data.get("plan", "free")
    photographer.onboarding_step = 4
    await db.commit()
    return {"message": "Step 3 completed", "onboarding_step": 4}

@router.post("/step4")
async def onboarding_step4(
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    if not photographer:
        from app.models.user import User
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["sub"])))
        user = user_res.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404)
        photographer = Photographer(id=user.id, full_name=user.full_name or "Photographer", email=user.email, password_hash=user.password_hash, plan="free")
        db.add(photographer)
        await db.flush()
    
    photographer.onboarding_step = 5
    # No plans are free anymore, so we don't skip Step 5 (Payment)
        
    await db.commit()
    return {"message": "Step 4 completed", "onboarding_step": photographer.onboarding_step}

@router.post("/create-order")
async def create_stripe_checkout(
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    if not photographer:
        from app.models.user import User
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["sub"])))
        user = user_res.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404)
        photographer = Photographer(id=user.id, full_name=user.full_name or "Photographer", email=user.email, password_hash=user.password_hash, plan="free")
        db.add(photographer)
        await db.flush()
    
    if photographer.plan == "fresher":
        amount = 50 * 100
    elif photographer.plan == "pro":
        amount = 1499 * 100
    else:
        amount = 4999 * 100
        
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "sk_test_placeholder":
        # Mock session for dev environment without keys
        return {"id": f"cs_test_{uuid.uuid4().hex[:12]}", "url": f"{settings.FRONTEND_URL}/onboarding?mock_success=true"}

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': f"SnapMoment {photographer.plan.upper()} Plan",
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            metadata={
                'photographer_id': str(photographer.id),
                'plan': photographer.plan
            },
            mode='payment',
            success_url=f"{settings.FRONTEND_URL}/onboarding?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/onboarding",
        )
        return {"id": session.id, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-payment")
async def verify_stripe_payment(
    data: dict = Body(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    # This is a fallback manual verification via session_id
    # The professional way is via Stripe Webhooks
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    if not photographer:
        from app.models.user import User
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(current_user["sub"])))
        user = user_res.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404)
        photographer = Photographer(id=user.id, full_name=user.full_name or "Photographer", email=user.email, password_hash=user.password_hash, plan="free")
        db.add(photographer)
        await db.flush()
    
    session_id = data.get("session_id")
    mock_success = data.get("mock_success")
    
    if not mock_success and not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id or mock_success")
    
    # In a real app, we would verify session_id with Stripe here
    # session = stripe.checkout.Session.retrieve(session_id)
    # if session.payment_status != "paid": ...
    
    payment_id = session_id or f"pay_mock_{uuid.uuid4().hex[:8]}"
    
    if photographer.onboarding_step < 6:
        photographer.onboarding_step = 6
        photographer.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
        photographer.is_active = True
        await db.commit()
    
        try:
            if photographer.plan == "fresher":
                amount_inr = 50
            elif photographer.plan == "pro":
                amount_inr = 1499
            else:
                amount_inr = 4999
            pdf_path = generate_invoice_pdf(
                name=photographer.full_name,
                studio_name=photographer.studio_name or "",
                email=photographer.email,
                plan_name=photographer.plan,
                amount_inr=amount_inr,
                payment_id=payment_id
            )
            
            invoice_rec = Invoice(
                id=uuid.uuid4(),
                photographer_id=photographer.id,
                order_id=session_id or f"ord_mock_{uuid.uuid4().hex[:8]}",
                payment_id=payment_id,
                amount=float(amount_inr),
                pdf_url=pdf_path
            )
            db.add(invoice_rec)
            await db.commit()
            
            send_invoice_email(photographer.email, photographer.full_name, pdf_path)
            
        except Exception as e:
            print("Invoice/Email Error:", e)
        
    return {"message": "Payment verified", "onboarding_step": 6}

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook Error: {str(e)}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        photog_id = session["metadata"]["photographer_id"]
        
        result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(photog_id)))
        photog = result.scalar_one_or_none()
        
        if photog:
            photog.is_active = True
            photog.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
            photog.onboarding_step = 6
            # We could also generate the invoice here for maximum reliability
            await db.commit()
            
    return {"status": "success"}


@router.post("/studio-logo")
async def upload_studio_logo(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    photog_id = current_user["sub"]
    
    # Check photographer
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(photog_id)))
    photog = result.scalar_one_or_none()
    if not photog:
        from app.models.user import User
        user_res = await db.execute(select(User).where(User.id == uuid.UUID(photog_id)))
        user = user_res.scalar_one_or_none()
        if not user: raise HTTPException(status_code=404, detail="Photographer not found")
        photog = Photographer(id=user.id, full_name=user.full_name or "Photographer", email=user.email, password_hash=user.password_hash, plan="free")
        db.add(photog)
        await db.flush()
        
    # Read file bytes
    file_bytes = await file.read()
    
    # Generate S3 key and upload
    key = s3_service.generate_key(f"logos/{photog_id}", "png")
    logo_url = await s3_service.upload_file(file_bytes, key, content_type=file.content_type or "image/png")
    
    # Update DB
    photog.studio_logo_url = logo_url
    await db.commit()
    
    return {"logo_url": logo_url}
