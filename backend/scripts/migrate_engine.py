import asyncio
import uuid
import sys
import os
import tempfile
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

# Add app directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models.photo import Photo
from app.models.face_index import FaceIndex
from app.models.photo_match import PhotoMatch
from app.services import s3 as s3_service
from app.services.face_engine import extract_all_embeddings

async def migrate_to_buffalo():
    """
    Migration script to re-calculate all face embeddings using Buffalo_L.
    This replaces all legacy 512-point signatures with the new ResNet-100 ones.
    """
    print("\n" + "="*60)
    print("🚀 SNAPMOMENT: AI ENGINE MIGRATION (BUFFALO_L)")
    print("="*60)
    
    async with AsyncSessionLocal() as db:
        # 1. Clear Photo Matches and Face Indices
        print("⚠️  Clearing old matches and face signatures...")
        await db.execute(delete(PhotoMatch))
        await db.execute(delete(FaceIndex))
        
        # 2. Fetch all photos
        result = await db.execute(select(Photo))
        photos = result.scalars().all()
        total = len(photos)
        print(f"📸 Found {total} photos to re-index.")
        
        # 3. Process each photo
        for i, photo in enumerate(photos):
            print(f"[{i+1}/{total}] Processing photo {photo.id}...", end="\r")
            
            try:
                # Download from S3
                image_bytes = await s3_service.read_file(photo.s3_key)
                
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(image_bytes)
                    tmp_path = tmp.name
                
                try:
                    # Extract new embeddings
                    faces = extract_all_embeddings(tmp_path)
                    
                    # Update FaceIndex
                    for face in faces:
                        idx = FaceIndex(
                            id=uuid.uuid4(),
                            photo_id=photo.id,
                            event_id=photo.event_id,
                            embedding=face["embedding"],
                            metadata_json={"bbox": face["bbox"], "confidence": face["confidence"]}
                        )
                        db.add(idx)
                    
                    # Update Photo record
                    photo.face_indexed = True
                    photo.faces_count = len(faces)
                    photo.face_embeddings = {"faces": faces}
                    
                finally:
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
                        
            except Exception as e:
                print(f"\n❌ Error processing {photo.id}: {e}")
                continue
                
            # Periodic commit to avoid massive transaction overhead
            if (i + 1) % 10 == 0:
                await db.commit()
                print(f"\n✅ Checkpoint: {i+1} photos processed.")

        await db.commit()
        print("\n" + "="*60)
        print(f"🎉 MIGRATION COMPLETE: {total} photos re-indexed with Buffalo_L!")
        print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(migrate_to_buffalo())
