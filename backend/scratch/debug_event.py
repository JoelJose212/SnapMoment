import asyncio
import uuid
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.event import Event
from app.models.photographer import Photographer

async def debug_event(qr_token):
    async with AsyncSessionLocal() as db:
        # Check Event only
        res = await db.execute(select(Event).where(Event.qr_token == qr_token))
        event = res.scalar_one_or_none()
        print(f"Event found by token: {event is not None}")
        if event:
            print(f"Event ID: {event.id}")
            print(f"Photographer ID: {event.photographer_id}")
            
            # Check Photographer
            res2 = await db.execute(select(Photographer).where(Photographer.id == event.photographer_id))
            photog = res2.scalar_one_or_none()
            print(f"Photographer found for event: {photog is not None}")
            
            # Test Join
            stmt = select(Event).join(Photographer, Event.photographer_id == Photographer.id).where(Event.qr_token == qr_token)
            res3 = await db.execute(stmt)
            join_row = res3.first()
            print(f"Join successful: {join_row is not None}")

if __name__ == "__main__":
    import sys
    token = sys.argv[1] if len(sys.argv) > 1 else "eJVPd2jnrnyKQKPJx6jwNA"
    asyncio.run(debug_event(token))
