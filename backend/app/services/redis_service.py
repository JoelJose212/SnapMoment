import random
import time
from typing import Optional
import redis.asyncio as aioredis
from app.config import settings

_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


def generate_otp() -> str:
    if settings.DEV_MODE:
        return "123456"
    return str(random.randint(100000, 999999))


async def store_otp(phone: str, event_id: str, otp: str, ttl: int = 300) -> None:
    r = await get_redis()
    key = f"otp:{phone}:{event_id}"
    await r.setex(key, ttl, otp)


async def verify_otp(phone: str, event_id: str, otp: str) -> bool:
    r = await get_redis()
    key = f"otp:{phone}:{event_id}"
    stored = await r.get(key)
    if stored and stored == otp:
        await r.delete(key)
        return True
    return False


async def check_rate_limit(phone: str, max_requests: int = 3, window: int = 600) -> bool:
    """Returns True if allowed, False if rate limited."""
    r = await get_redis()
    key = f"rate:{phone}"
    count = await r.get(key)
    if count and int(count) >= max_requests:
        return False
    pipe = r.pipeline()
    await pipe.incr(key)
    await pipe.expire(key, window)
    await pipe.execute()
    return True


async def store_task_status(event_id: str, status: dict, ttl: int = 3600) -> None:
    r = await get_redis()
    import json
    await r.setex(f"task_status:{event_id}", ttl, json.dumps(status))


async def get_task_status(event_id: str) -> Optional[dict]:
    r = await get_redis()
    import json
    val = await r.get(f"task_status:{event_id}")
    return json.loads(val) if val else None
