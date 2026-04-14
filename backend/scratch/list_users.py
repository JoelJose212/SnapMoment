import asyncio
from app.database import engine
from app.models.photographer import Photographer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def main():
    async with AsyncSession(engine) as session:
        res = await session.execute(select(Photographer))
        all_users = res.scalars().all()
        print(f"Total Photographers: {len(all_users)}")
        for u in all_users:
            print(f"- {u.email} ({u.full_name})")

if __name__ == "__main__":
    asyncio.run(main())
