import asyncio
import uuid
import logging
import os
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models.photo import Photo
from app.models.face_index import FaceIndex
from app.services import face_engine
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("manual_sync")

async def manual_index_everything():
    print("\n" + "="*50)
    print("🚀 SNAPMOMENT: MANUAL NEURAL SYNC INITIALIZED")
    print("="*50 + "\n")
    
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with Session() as session:
        # Get all photos that haven't been indexed
        result = await session.execute(
            select(Photo).where(Photo.face_indexed == False)
        )
        photos = result.scalars().all()
        
        if not photos:
            print("✅ All photos are already indexed. No action needed.")
            return

        print(f"📡 Found {len(photos)} photos pending AI analysis...")
        
        for photo in photos:
            try:
                print(f"🧬 Analyzing {photo.s3_key[:15]}...")
                
                # Get local path
                img_path = str(Path(settings.LOCAL_STORAGE_PATH) / photo.s3_key)
                
                if not os.path.exists(img_path):
                    print(f"❌ Error: File not found at {img_path}")
                    continue

                # AI Analysis
                results = face_engine.extract_all_embeddings(img_path)
                faces_count = len(results)
                
                # Update Photo
                photo.face_indexed = True
                photo.face_embeddings = {"faces": results}
                photo.faces_count = faces_count
                
                # Add to Vector Index
                for face in results:
                    fi = FaceIndex(
                        id=uuid.uuid4(),
                        photo_id=photo.id,
                        event_id=photo.event_id,
                        embedding=face["embedding"],
                        metadata_json={"bbox": face.get("facial_area", {})}
                    )
                    session.add(fi)
                    
                print(f"   -> Success: Found {faces_count} faces.")
                await session.commit()
                
            except Exception as e:
                print(f"❌ Failed to index {photo.id}: {e}")
                
    await engine.dispose()
    print("\n" + "="*50)
    print("✅ NEURAL SYNC COMPLETE: Your gallery is now live!")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(manual_index_everything())
