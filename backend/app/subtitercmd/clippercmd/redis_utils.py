"""
Redis utility functions for creating and managing Redis clients.
"""
import redis
from config import settings


def get_redis_client(decode_responses: bool = True) -> redis.Redis:
    """
    Create and return a Redis client configured with application settings.

    Args:
        decode_responses: Whether to decode responses as strings (default: True).
                         Set to False for binary data handling.

    Returns:
        A configured Redis client instance.
    """
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        db=settings.REDIS_DB,
        decode_responses=decode_responses
    )
