"""
Seed script: Creates admin, photographers, events, and dummy photos.
Run inside Docker: docker compose exec backend python seed.py
Or locally: DATABASE_URL=... python seed.py
"""
# pyre-ignore-all-errors
import asyncio
import uuid
import secrets
from datetime import datetime, timedelta
import random
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models.photographer import Photographer
from app.models.event import Event
from app.models.photo import Photo
from app.database import Base
from app.services.auth import hash_password

PHOTOGRAPHERS = [
    {"name": "Rohan Mehta", "email": "rohan@snapmoment.app", "studio": "Rohan Mehta Studios", "plan": "pro"},
    {"name": "Priya Sharma", "email": "priya@snapmoment.app", "studio": "Priya Clicks", "plan": "studio"},
    {"name": "Arjun Patel", "email": "arjun@snapmoment.app", "studio": "Arjun Photography", "plan": "free"},
    {"name": "Kavya Reddy", "email": "kavya@snapmoment.app", "studio": "Kavya Visual Arts", "plan": "pro"},
    {"name": "Vikram Singh", "email": "vikram@snapmoment.app", "studio": "Vikram Singh Photos", "plan": "studio"},
    {"name": "Anjali Gupta", "email": "anjali@snapmoment.app", "studio": "Anjali Moments", "plan": "free"},
    {"name": "Rahul Joshi", "email": "rahul@snapmoment.app", "studio": "Joshi Photography", "plan": "pro"},
    {"name": "Sneha Nair", "email": "sneha@snapmoment.app", "studio": "Sneha Captures", "plan": "studio"},
]

EVENT_TYPES = ["wedding", "birthday", "college", "corporate", "anniversary", "other"]
EVENT_NAMES = [
    "Sharma-Mehta Wedding Celebration",
    "Priya's 25th Birthday Bash",
    "IIT Delhi Convocation 2024",
    "Tech Summit Annual Gala",
    "Golden Jubilee Anniversary",
    "Corporate Diwali Party",
    "Aryan & Neha's Sangeet Night",
    "MBA Batch Farewell",
    "Product Launch Event",
    "Family Reunion 2024",
]
LOCATIONS = ["Mumbai, Maharashtra", "Delhi NCR", "Bangalore, Karnataka", "Hyderabad", "Chennai, Tamil Nadu", "Noida, UP", "Pune, Maharashtra", "Kolkata"]


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with Session() as session:
        # Skip if already seeded
        from sqlalchemy import select
        ex = await session.execute(select(Photographer).limit(1))
        if ex.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        photographers = []
        for p in PHOTOGRAPHERS:
            ph = Photographer(
                id=uuid.uuid4(),
                full_name=p["name"],
                email=p["email"],
                phone=f"+91{random.randint(7000000000, 9999999999)}",
                password_hash=hash_password("Password@123"),
                studio_name=p["studio"],
                plan=p["plan"],
                is_active=True,
                is_verified=p["plan"] != "free",
            )
            session.add(ph)
            photographers.append(ph)

        await session.commit()
        print(f"Created {len(photographers)} photographers")

        for ph in photographers:
            for i in range(5):
                event_type = random.choice(EVENT_TYPES)
                event_name = random.choice(EVENT_NAMES)
                event_date = datetime.utcnow() - timedelta(days=random.randint(0, 180))
                qr_token = secrets.token_urlsafe(16)

                event = Event(
                    id=uuid.uuid4(),
                    photographer_id=ph.id,
                    name=event_name,
                    type=event_type,
                    event_date=event_date,
                    location=random.choice(LOCATIONS),
                    description=f"A wonderful {event_type} event captured by {ph.studio_name}.",
                    qr_token=qr_token,
                    is_active=random.choice([True, True, True, False]),
                    expires_at=event_date + timedelta(days=90),
                    photographer_note="Please share these precious memories with your loved ones!",
                )
                session.add(event)
                await session.flush()

                # 20 dummy photos per event
                for j in range(20):
                    w, h = random.choice([(800, 600), (1024, 768), (1200, 900)])
                    pic_id = random.randint(1, 1000)
                    url = f"https://picsum.photos/id/{pic_id}/{w}/{h}"
                    photo = Photo(
                        id=uuid.uuid4(),
                        event_id=event.id,
                        s3_key=f"events/{event.id}/photos/{uuid.uuid4()}.jpg",
                        s3_url=url,
                        thumbnail_url=f"https://picsum.photos/id/{pic_id}/400/300",
                        face_indexed=False,
                        faces_count=0,
                    )
                    session.add(photo)

        await session.commit()
        print("Created 5 events × 20 photos for each photographer")
        print("\n✅ Seed complete!")
        print(f"   Admin:         {settings.ADMIN_EMAIL} (See settings/env)")
        print("   Photographers: (Password verified via hashing system)")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
