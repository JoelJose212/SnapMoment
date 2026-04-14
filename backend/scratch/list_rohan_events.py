import asyncio
from app.database import engine
from app.models.photographer import Photographer
from app.models.event import Event
from sqlalchemy import select

async def run():
    async with engine.connect() as conn:
        res = await conn.execute(
            select(Event.id, Event.name)
            .join(Photographer, Event.photographer_id == Photographer.id)
            .where(Photographer.email == 'rohan@snapmoment.app')
        )
        for r in res.fetchall():
            print(f"EVENT: {r[0]} - {r[1]}")

if __name__ == "__main__":
    asyncio.run(run())
