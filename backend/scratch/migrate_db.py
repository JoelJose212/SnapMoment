import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        print("Running migrations...")
        try:
            await conn.execute(text("ALTER TABLE photographers ADD COLUMN IF NOT EXISTS studio_logo_url VARCHAR(500)"))
            print("Added studio_logo_url to photographers")
        except Exception as e:
            print(f"Error adding studio_logo_url: {e}")
        
        # Also ensure is_suggested exists in photo_matches just in case
        try:
            await conn.execute(text("ALTER TABLE photo_matches ADD COLUMN IF NOT EXISTS is_suggested BOOLEAN DEFAULT FALSE"))
        except Exception:
            pass
            
    print("Migration finished")

if __name__ == "__main__":
    asyncio.run(migrate())
