import asyncio
import uuid
import os
from pathlib import Path
from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.models.photo import Photo
from app.config import settings

async def re_crop_event(event_id: str):
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine)
    
    async with Session() as session:
        result = await session.execute(
            select(Photo).where(Photo.event_id == uuid.UUID(event_id))
        )
        photos = result.scalars().all()
        print(f"Re-cropping {len(photos)} photos for event {event_id}")
        
        crops_dir = Path(settings.LOCAL_STORAGE_PATH) / "crops"
        crops_dir.mkdir(parents=True, exist_ok=True)
        
        for photo in photos:
            if not photo.face_embeddings:
                continue
            
            img_path = Path(settings.LOCAL_STORAGE_PATH) / photo.s3_key
            if not img_path.exists():
                print(f"File not found: {img_path}")
                continue
                
            results = photo.face_embeddings.get("faces", [])
            if not results:
                continue
                
            with Image.open(img_path) as im:
                w, h = im.size
                
                # Group-Aware Bounding Box
                min_x = min(f.get("facial_area", {}).get("x", w // 2) for f in results)
                max_x = max(f.get("facial_area", {}).get("x", w // 2) + f.get("facial_area", {}).get("w", 0) for f in results)
                min_y = min(f.get("facial_area", {}).get("y", h // 2) for f in results)
                max_y = max(f.get("facial_area", {}).get("y", h // 2) + f.get("facial_area", {}).get("h", 0) for f in results)
                
                fx = (min_x + max_x) // 2
                fy = (min_y + max_y) // 2
                
                # 1:1
                size = min(w, h)
                left = max(0, min(fx - size // 2, w - size))
                top = max(0, min(fy - size // 2, h - size))
                im.crop((left, top, left + size, top + size)).convert("RGB").save(crops_dir / f"{photo.id}_1x1.jpg", quality=90)
                
                # 9:16
                sw = int(h * (9/16))
                if sw > w:
                    sw = w
                    sh = int(w * (16/9))
                else:
                    sh = h
                left = max(0, min(fx - sw // 2, w - sw))
                top = max(0, min(fy - sh // 2, h - sh))
                im.crop((left, top, left + sw, top + sh)).convert("RGB").save(crops_dir / f"{photo.id}_9x16.jpg", quality=90)
                
            print(f"Updated crops for {photo.id}")

if __name__ == "__main__":
    import sys
    eid = "f4ad2534-a422-4f6e-82b9-f6180f55db23" # The correct event ID
    asyncio.run(re_crop_event(eid))
