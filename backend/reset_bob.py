import asyncio
from app.services.auth import hash_password
from app.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def reset():
    async with AsyncSessionLocal() as db:
        user_res = await db.execute(select(User).where(User.email == 'Bob@mail.com'))
        user = user_res.scalar_one_or_none()
        if user:
            user.password_hash = hash_password('Bob@123')
            await db.commit()
            print("Password for Bob@mail.com reset to: Bob@123")
        else:
            print("User Bob@mail.com not found")

if __name__ == "__main__":
    asyncio.run(reset())
