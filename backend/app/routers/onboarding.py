import razorpay
import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.photographer import Photographer
from app.services.auth import require_photographer
from app.config import settings
from app.services.invoice import generate_invoice_pdf

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

rzp_client = None
if settings.RAZORPAY_KEY_ID != "rzp_test_placeholder":
    rzp_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.post("/step2")
async def onboarding_step2(
    data: dict = Body(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    if not photographer: raise HTTPException(status_code=404)
        
    photographer.founded_year = int(data.get("founded_year", 2024))
    photographer.team_size = data.get("team_size", "Just Me")
    photographer.services = data.get("services", [])
    photographer.primary_gear = data.get("primary_gear", "")
    photographer.portfolio_url = data.get("portfolio_url", "")
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
    
    photographer.onboarding_step = 5
    if photographer.plan == "free":
        photographer.onboarding_step = 6
        
    await db.commit()
    return {"message": "Step 4 completed", "onboarding_step": photographer.onboarding_step}

@router.post("/create-order")
async def create_razorpay_order(
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    amount = 1499 * 100 if photographer.plan == "pro" else 4999 * 100
        
    if not rzp_client:
        return {"id": f"order_mock_{uuid.uuid4().hex[:8]}", "amount": amount, "currency": "INR"}
        
    order = rzp_client.order.create({
        "amount": amount,
        "currency": "INR",
        "receipt": f"receipt_{photographer.id}"
    })
    return order

@router.post("/verify-payment")
async def verify_payment(
    data: dict = Body(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Photographer).where(Photographer.id == uuid.UUID(current_user["sub"])))
    photographer = result.scalar_one_or_none()
    
    payment_id = data.get("razorpay_payment_id", f"pay_mock_{uuid.uuid4().hex[:8]}")
    
    photographer.onboarding_step = 6
    photographer.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
    photographer.is_active = True
    await db.commit()
    
    try:
        generate_invoice_pdf(
            name=photographer.full_name,
            studio_name=photographer.studio_name or "",
            email=photographer.email,
            plan_name=photographer.plan,
            amount_inr=1499 if photographer.plan == "pro" else 4999,
            payment_id=payment_id
        )
    except Exception as e:
        print("Invoice Error:", e)
        
    return {"message": "Payment verified", "onboarding_step": 6}
