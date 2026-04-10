import asyncio
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models.photo import Photo
from app.models.event import Event

async def verify_everything():
    print("\n" + "="*50)
    print("🔍 DATA VERIFICATION")
    print("="*50)
    
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine)
    
    async with Session() as session:
        # 1. Total Photos
        res = await session.execute(select(func.count()).select_from(Photo))
        total_photos = res.scalar()
        print(f"📦 Total Photos in DB: {total_photos}")
        
        # 2. Events Summary
        res = await session.execute(select(Event))
        events = res.scalars().all()
        print(f"📅 Total Events: {len(events)}")
        for e in events:
            p_res = await session.execute(select(func.count()).select_from(Photo).where(Photo.event_id == e.id))
            p_count = p_res.scalar()
            print(f"  - Event: '{e.name}' | ID: {e.id} | Photos: {p_count}")
            
    await engine.dispose()
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(verify_everything())
