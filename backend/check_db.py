import asyncio
import uuid
from sqlalchemy import select, inspect
from app.database import engine, Base
from app.models.client_booking import PhotographerProfile

async def check():
    async with engine.begin() as conn:
        # Check tables
        tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
        print(f"Tables: {tables}")
        
        if "photographer_profiles" not in tables:
            print("Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("Tables created.")
        else:
            print("PhotographerProfile table exists.")

if __name__ == "__main__":
    asyncio.run(check())
