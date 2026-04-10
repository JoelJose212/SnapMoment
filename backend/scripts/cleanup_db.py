import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings

async def cleanup_missing_photos():
    print("\n" + "="*50)
    print("🧹 SNAPMOMENT: DATABASE CLEANUP INITIALIZED")
    print("="*50 + "\n")
    
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with Session() as session:
        print("🗑️ Deleting all photo records, face indices, and matches...")
        
        # Order matters due to foreign key constraints
        await session.execute(text("TRUNCATE TABLE photo_matches CASCADE;"))
        await session.execute(text("TRUNCATE TABLE face_indices CASCADE;"))
        await session.execute(text("TRUNCATE TABLE photos CASCADE;"))
        
        await session.commit()
        print("✅ Database is now empty and clean!")
    
    await engine.dispose()
    print("\n" + "="*50)
    print("✨ READY FOR FRESH UPLOADS!")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(cleanup_missing_photos())
