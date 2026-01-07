"""
Redis utility functions for creating and managing Redis clients.
"""
import redis
import os
from dotenv import load_dotenv
load_dotenv()

# Configuration - loaded from .env file (same as server)
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "26379"))
REDIS_DB = int(os.environ.get("REDIS_DB", "0"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")  # Password is required for Redis connection
REDIS_QUEUE_NAME = os.environ.get("REDIS_VIDEO_PROCESS_QUEUE_NAME", "klippers_video_process")


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
        host=REDIS_HOST,
        port=REDIS_PORT,
        password=REDIS_PASSWORD,
        db=REDIS_DB,
        decode_responses=decode_responses
    )
