import os
import json
import logging
from typing import Optional, Any
import redis.asyncio as redis

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")

# Initialize Redis client
redis_client = redis.from_url(CELERY_BROKER_URL, decode_responses=True)

async def get_cached_weather(key: str) -> Optional[Any]:
    """
    Attempt to fetch weather data from Redis cache.
    Fails gracefully if Redis is unavailable.
    """
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Redis cache miss/error for key {key}: {e}")
    return None

async def set_cached_weather(key: str, data: Any, expire_seconds: int = 900):
    """
    Attempt to store weather data in Redis cache.
    Fails gracefully if Redis is unavailable.
    Default expiration is 15 minutes.
    """
    try:
        await redis_client.setex(key, expire_seconds, json.dumps(data))
    except Exception as e:
        logger.warning(f"Failed to set Redis cache for key {key}: {e}")
