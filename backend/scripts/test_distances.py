import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.guest import Guest
from app.models.face_index import FaceIndex

async def main():
    async with AsyncSessionLocal() as db:
        # Get the latest guest
        res = await db.execute(select(Guest).order_by(Guest.verified_at.desc()).limit(1))
        guest = res.scalar_one_or_none()
        if not guest or not guest.face_embedding:
            print("No guest or selfie found.")
            return
            
        print(f"Guest: {guest.full_name}, Event: {guest.event_id}")
        selfie_emb = guest.face_embedding["embedding"]
        
        # Get distances to all faces in that event
        res = await db.execute(
            select(FaceIndex.photo_id, FaceIndex.embedding.cosine_distance(selfie_emb).label("dist"))
            .where(FaceIndex.event_id == guest.event_id)
            .order_by("dist")
        )
        distances = res.all()
        
        print(f"Total faces found: {len(distances)}")
        for i, (pid, dist) in enumerate(distances):
            print(f"Photo {pid} - Distance: {dist}")
            if i >= 100:
                print("...")
                break

if __name__ == "__main__":
    asyncio.run(main())
