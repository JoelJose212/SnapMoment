import asyncio
from sqlalchemy import update
from app.database import AsyncSessionLocal
from app.models.client_booking import PhotographerProfile

async def fix_prices():
    async with AsyncSessionLocal() as db:
        # Set starting_price to 0 where it is NULL
        q = update(PhotographerProfile).where(PhotographerProfile.starting_price == None).values(starting_price=0)
        await db.execute(q)
        await db.commit()
        print("Updated all photographers with NULL starting_price to 0.")

if __name__ == "__main__":
    asyncio.run(fix_prices())
