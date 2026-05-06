import asyncio
from sqlalchemy import update
from app.database import AsyncSessionLocal
from app.models.photographer import Photographer

async def fix_sneha():
    async with AsyncSessionLocal() as db:
        q = update(Photographer).where(Photographer.email == "sneha@snapmoment.app").values(onboarding_step=6)
        await db.execute(q)
        await db.commit()
        print("Sneha Nair's account has been successfully activated and marked as onboarded.")

if __name__ == "__main__":
    asyncio.run(fix_sneha())
