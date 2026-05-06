import asyncio
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.photographer import Photographer

async def count_photographers():
    async with AsyncSessionLocal() as db:
        # Total photographers
        total_res = await db.execute(select(func.count(Photographer.id)))
        total = total_res.scalar()
        
        # Completed onboarding (Step 6)
        completed_res = await db.execute(select(func.count(Photographer.id)).where(Photographer.onboarding_step >= 6))
        completed = completed_res.scalar()
        
        # Verified but not necessarily completed onboarding (legacy)
        verified_res = await db.execute(select(func.count(Photographer.id)).where(Photographer.is_verified == True))
        verified = verified_res.scalar()
        
        # Names of completed ones
        names_res = await db.execute(select(Photographer.full_name, Photographer.email).where(Photographer.onboarding_step >= 6))
        names = names_res.all()
        
        print(f"Total Photographers: {total}")
        print(f"Fully Onboarded (Step 6): {completed}")
        print(f"Verified Studios: {verified}")
        print("\nList of Fully Onboarded Photographers:")
        for name, email in names:
            print(f"- {name} ({email})")

if __name__ == "__main__":
    asyncio.run(count_photographers())
