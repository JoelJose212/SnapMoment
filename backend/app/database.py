from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    from sqlalchemy import text
    from app.models import photographer, event, photo, guest, photo_match, analytics, face_index, message, collaboration  # noqa
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        
        # Manual migrations
        try:
            await conn.execute(text("ALTER TABLE photo_matches ADD COLUMN IF NOT EXISTS is_suggested BOOLEAN DEFAULT FALSE"))
            await conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS ftp_password VARCHAR(100)"))
            await conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS ftp_enabled BOOLEAN DEFAULT TRUE"))
            await conn.execute(text("ALTER TABLE photos ADD COLUMN IF NOT EXISTS original_s3_key VARCHAR(500)"))
            await conn.execute(text("ALTER TABLE photos ADD COLUMN IF NOT EXISTS original_s3_url VARCHAR(1000)"))
            await conn.execute(text("ALTER TABLE photos ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'processing'"))
            await conn.execute(text("ALTER TABLE photos ALTER COLUMN s3_key DROP NOT NULL"))
            await conn.execute(text("ALTER TABLE photos ALTER COLUMN s3_url DROP NOT NULL"))
        except Exception as e:
            print(f"Migration error: {e}")
