import asyncio
import uuid
import traceback
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.event import Event
from app.models.photographer import Photographer
from app.schemas import PublicEventOut

async def debug_event(qr_token):
    async with AsyncSessionLocal() as db:
        try:
            stmt = (
                select(Event, Photographer.studio_logo_url, Photographer.studio_name)
                .outerjoin(Photographer, Event.photographer_id == Photographer.id)
                .where(Event.qr_token == qr_token)
            )
            result = await db.execute(stmt)
            row = result.first()
            
            if not row:
                print("Event not found (404 logic)")
                return
                
            event, studio_logo, studio_name = row
            print(f"Row fetched: Event ID={event.id}, logo={studio_logo}, name={studio_name}")
            
            try:
                out = PublicEventOut.model_validate(event)
                print("model_validate successful")
                out.studio_logo_url = studio_logo
                out.studio_name = studio_name
                print("Final data:", out.model_dump())
            except Exception as e:
                print("Validation Error:")
                print(traceback.format_exc())
                
        except Exception as e:
            print("Database/Query Error:")
            print(traceback.format_exc())

if __name__ == "__main__":
    import sys
    token = sys.argv[1] if len(sys.argv) > 1 else "eJVPd2jnrnyKQKPJx6jwNA"
    asyncio.run(debug_event(token))
