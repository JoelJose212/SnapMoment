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
    from app.models import photographer, event, photo, guest, photo_match, analytics, face_index, message, collaboration, client_booking  # noqa
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
            await conn.execute(text("ALTER TABLE photographer_profiles ADD COLUMN IF NOT EXISTS starting_price INTEGER DEFAULT 0"))
            await conn.execute(text("ALTER TABLE photographer_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20)"))
            await conn.execute(text("ALTER TABLE photographer_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(200)"))
            
            # Sub-event booking migrations
            await conn.execute(text("ALTER TABLE sub_event_bookings ADD COLUMN IF NOT EXISTS specialization_id UUID"))
            await conn.execute(text("ALTER TABLE sub_event_bookings ADD COLUMN IF NOT EXISTS agreed_to_terms_at TIMESTAMP WITH TIME ZONE"))
            await conn.execute(text("ALTER TABLE sub_event_bookings ADD COLUMN IF NOT EXISTS snapmoment_event_id UUID"))
            await conn.execute(text("ALTER TABLE sub_event_bookings ADD COLUMN IF NOT EXISTS end_time TIME"))
            await conn.execute(text("ALTER TABLE sub_event_bookings ADD COLUMN IF NOT EXISTS duration_hours INTEGER"))
            await conn.execute(text("ALTER TABLE sub_event_bookings ALTER COLUMN package_id DROP NOT NULL"))
            
            # Photographer profile additional fields
            await conn.execute(text("ALTER TABLE photographer_profiles ADD COLUMN IF NOT EXISTS service_states VARCHAR[]"))
            await conn.execute(text("ALTER TABLE photographer_profiles ADD COLUMN IF NOT EXISTS service_districts VARCHAR[]"))
            await conn.execute(text("ALTER TABLE photographer_profiles ADD COLUMN IF NOT EXISTS travel_range_km INTEGER DEFAULT 50"))
        except Exception as e:
            print(f"Migration error: {e}")

    # Enums need to be modified outside of transaction blocks
    async_engine_auto = engine.execution_options(isolation_level="AUTOCOMMIT")
    async with async_engine_auto.connect() as conn:
        try:
            await conn.execute(text("ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'PENDING'"))
            await conn.execute(text("ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'REJECTED'"))
            await conn.execute(text("ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'DISPUTED'"))
        except Exception as e:
            print(f"Enum migration error: {e}")
