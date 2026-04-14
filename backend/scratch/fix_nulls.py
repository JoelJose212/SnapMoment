import asyncio
from app.database import engine
from app.models.photo import Photo
from sqlalchemy import select, update, text
from sqlalchemy.ext.asyncio import AsyncSession

async def fix():
    async with AsyncSession(engine) as session:
        # Check for NULL has_social_crops
        res = await session.execute(text("SELECT count(*) FROM photos WHERE has_social_crops IS NULL"))
        null_count = res.scalar()
        print(f"Found {null_count} photos with NULL has_social_crops")
        
        if null_count > 0:
            print("Backfilling NULL values to False...")
            await session.execute(update(Photo).where(Photo.has_social_crops == None).values(has_social_crops=False))
            await session.commit()
            print("Successfully backfilled photos.")
        
        # Check for NULL face_indexed (just in case)
        res = await session.execute(text("SELECT count(*) FROM photos WHERE face_indexed IS NULL"))
        null_face = res.scalar()
        if null_face > 0:
            print(f"Found {null_face} photos with NULL face_indexed. Fixing...")
            await session.execute(update(Photo).where(Photo.face_indexed == None).values(face_indexed=False))
            await session.commit()

if __name__ == "__main__":
    asyncio.run(fix())
