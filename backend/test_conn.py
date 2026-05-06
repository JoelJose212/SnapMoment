import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    # Try different hosts
    hosts = ["127.0.0.1", "localhost", "0.0.0.0"]
    for host in hosts:
        url = f"postgresql+asyncpg://snapmoment:snapmoment123@{host}:5432/snapmoment"
        print(f"Testing {url}...")
        try:
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print(f"Success with {host}!")
            return
        except Exception as e:
            print(f"Failed with {host}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
