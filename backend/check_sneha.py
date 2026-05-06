import asyncio
import uuid
from sqlalchemy import select, or_
from app.database import AsyncSessionLocal
from app.models.photographer import Photographer
from app.models.user import User

async def find_sneha(search_term):
    async with AsyncSessionLocal() as db:
        query = select(Photographer).where(
            or_(
                Photographer.full_name.ilike(f"%{search_term}%"),
                Photographer.email.ilike(f"%{search_term}%"),
                Photographer.studio_name.ilike(f"%{search_term}%")
            )
        )
        res = await db.execute(query)
        photogs = res.scalars().all()
        
        if photogs:
            for photog in photogs:
                print(f"--- Photographer Found ---")
                print(f"Name: {photog.full_name}")
                print(f"Email: {photog.email}")
                print(f"ID: {photog.id}")
                print(f"Onboarding Step: {photog.onboarding_step}")
                print(f"Is Verified: {photog.is_verified}")
                print(f"Plan: {photog.plan}")
                print(f"Is Active: {photog.is_active}")
                print("-" * 30)
        else:
            print(f"No photographer matching '{search_term}' found.")

if __name__ == "__main__":
    import sys
    term = "Sneha"
    if len(sys.argv) > 1:
        term = sys.argv[1]
    asyncio.run(find_sneha(term))
