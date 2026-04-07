import asyncio
import uuid
from sqlalchemy import update, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models.photo import Photo
from app.models.face_index import FaceIndex

async def reset_indexing():
    print(f"🚀 Resetting face indexing for all photos...")
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with Session() as session:
        # 1. Clear all face indices
        print(" - Clearing FaceIndex table...")
        await session.execute(text("TRUNCATE TABLE face_indices CASCADE;"))
        await session.execute(text("TRUNCATE TABLE photo_matches CASCADE;"))
        
        # 2. Reset photo indexed status
        print(" - Resetting Photo table status...")
        await session.execute(
            update(Photo).values(
                face_indexed=False,
                faces_count=0,
                face_embeddings={}
            )
        )
        
        await session.commit()
        print("✅ Database reset complete. Background indexing will now re-scan all photos.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_indexing())
