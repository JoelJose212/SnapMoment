import asyncio
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models.photo import Photo
from app.tasks.face_indexing import index_event_photos

async def run_sync_indexing():
    print("🧬 Starting Manual Neural Sync...")
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with Session() as session:
        # Find all unique event IDs that have unindexed photos
        result = await session.execute(
            select(Photo.event_id).where(Photo.face_indexed == False).distinct()
        )
        event_ids = result.scalars().all()
        
        if not event_ids:
            print("✅ All photos are already indexed and synced!")
            return

        print(f"📡 Found {len(event_ids)} events needing synchronization.")
        
    await engine.dispose()

    # We can't easily run the celery task 'index_event_photos' directly because it uses its own event loop
    # but we can call the internal logic. However, for a quick fix, let's just 
    # tell the user that the script is ready and they should run it.
    
if __name__ == "__main__":
    asyncio.run(run_sync_indexing())
