# flake8: noqa: E501
import ray
import datetime
import json
from typing import Dict, List, Optional
from app.config import settings
from app.schemas.schema_chat import ChatMessage
import redis
from app.redis.redis_utils import get_redis_client


@ray.remote
class ActorChat:
    """
    A Ray actor that manages the chat history.

    This actor receives messages, stores them, and provides them for broadcasting.
    It encapsulates the chat room's state, allowing for concurrent message processing
    without directly handling network I/O, which is managed by the FastAPI app.
    """
    def __init__(self):
        self.messages: Dict[str, List[ChatMessage]] = {}  # Stores lists of ChatMessage objects, keyed by clientId.
        print("ActorChat initialized.")

    def add_message(self, roomId: str, clientId: str, message: ChatMessage) -> ChatMessage:
        """
        Adds a new message to the chat history.

        Args:
            roomId: The room ID.
            clientId: The client ID.
            message: The message object.

        Returns:
            The message object, updated with a timestamp.
        """
        # We assume the ChatMessage object is mutable and has `clientId` and `timestamp` attributes.
        message.timestamp = str(datetime.datetime.now().isoformat())

        if roomId not in self.messages:
            self.messages[roomId] = []
        self.messages[roomId].append(message)
        print(f"Message added by actor: {message}")
        return message

    def get_history(self) -> Dict[str, List[ChatMessage]]:
        """
        Retrieves the entire chat history.

        Returns:
            A dictionary of message lists keyed by client ID.
        """
        print("Chat history requested.")
        return self.messages

    def get_history_by_clientId(self, clientId: str) -> List[ChatMessage]:
        """
        Retrieves the entire chat history of the Client with the given ID.

        Returns:
            List of Message objects.
        """
        print(f"Chat history requested for client {clientId}.")
        room_messages = self.messages.values()
        messages_by_client = map(lambda room_messages: [message for message in room_messages if message.clientId == clientId], room_messages)
        return messages_by_client


@ray.remote
class ActorRedisMessageListener:
    """
    A Ray actor that continuously listens to a Redis queue for incoming messages.
    
    This actor uses BRPOP (blocking pop) to efficiently wait for new messages
    without busy-waiting. When a message arrives, it can be polled by the FastAPI
    server to forward to the appropriate WebSocket connections based on roomId.
    """
    def __init__(self):
        print(f"ActorRedisMessageListener: Connecting to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT} DB={settings.REDIS_DB}", flush=True)
        self.redis = get_redis_client()
        self._running = True
        self._pending_messages: List[dict] = []
        
        # Test connection on init
        try:
            self.redis.ping()
            queue_len = self.redis.llen(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME)
            print(f"ActorRedisMessageListener: ✓ Redis connection successful!", flush=True)
            print(f"ActorRedisMessageListener: Queue '{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}' has {queue_len} messages", flush=True)
        except Exception as e:
            print(f"ActorRedisMessageListener: ✗ Redis connection FAILED: {e}", flush=True)
        
        print(f"ActorRedisMessageListener initialized. Listening on queue: {settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}", flush=True)

    def listen_for_message(self, timeout: int = 1) -> Optional[dict]:
        """
        Blocking listen for a single message from Redis queue.
        
        Uses BRPOP to efficiently wait for messages without busy-waiting.
        
        Args:
            timeout: How long to block waiting for a message (in seconds).
                     Use 0 for indefinite blocking (not recommended).
        
        Returns:
            The message dict if one was received, None if timeout occurred.
        """
        if not self._running:
            return None
            
        try:
            # Listening to main queue (messages from all rooms are pushed here for the listener)
            listening_queue = settings.REDIS_VIDEO_PROCESS_QUEUE_NAME
            
            # Check queue length before BRPOP for debugging
            queue_len = self.redis.llen(listening_queue)
            if queue_len > 0:
                print(f"[LISTENER] Queue '{listening_queue}' has {queue_len} messages waiting (listening...)", flush=True)
            
            # BRPOP returns (queue_name, message) tuple or None on timeout
            result = self.redis.brpop(listening_queue, timeout=timeout)
            
            if result is None:
                return None
            
            queue_name, message_str = result
            
            # Parse the JSON message
            try:
                message_data = json.loads(message_str)
                room_id = message_data.get("roomId", "unknown")
                print(f"[LISTENER] ✓ Message received from queue '{queue_name}' (main queue) for roomId: '{room_id}'", flush=True)
                print(f"[LISTENER] Message: {message_data.get('message', '')[:100]}...", flush=True)
                return message_data
            except json.JSONDecodeError as e:
                print(f"ActorRedisMessageListener: Failed to parse message JSON: {e}", flush=True)
                print(f"Raw message: {message_str}", flush=True)
                return None
                
        except redis.RedisError as e:
            print(f"ActorRedisMessageListener: Redis error while listening: {e}", flush=True)
            import traceback
            traceback.print_exc()
            return None
        except Exception as e:
            print(f"ActorRedisMessageListener: Unexpected error while listening: {e}", flush=True)
            import traceback
            traceback.print_exc()
            return None

    def poll_messages(self, max_messages: int = 10) -> List[dict]:
        """
        Non-blocking poll for multiple messages from Redis queue.
        
        This method uses RPOP to get messages without blocking.
        
        Args:
            max_messages: Maximum number of messages to retrieve in one call.
        
        Returns:
            List of message dicts that were retrieved.
        """
        messages = []
        
        for _ in range(max_messages):
            try:
                message_str = self.redis.rpop(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME)
                
                if message_str is None:
                    break
                
                try:
                    message_data = json.loads(message_str)
                    messages.append(message_data)
                    print(f"ActorRedisMessageListener polled message: {message_data}")
                except json.JSONDecodeError as e:
                    print(f"ActorRedisMessageListener: Failed to parse message JSON: {e}")
                    continue
                    
            except redis.RedisError as e:
                print(f"ActorRedisMessageListener: Redis error while polling: {e}")
                break
            except Exception as e:
                print(f"ActorRedisMessageListener: Unexpected error while polling: {e}")
                break
        
        return messages

    def add_message(self, roomId: str, clientId: str, message: ChatMessage) -> ChatMessage:
        """
        Adds a new message to the Redis queue.

        Args:
            roomId: The room ID.
            clientId: The client ID.
            message: The message object.
        
        Returns:
            The message object.
        """
        message_json = json.dumps({
            "kind": message.kind,
            "clientId": message.clientId,
            "message": message.message,
            "timestamp": message.timestamp,
            "roomId": message.roomId
        })
        # Push to room-specific queue for querying by roomId (RPUSH for chronological order)
        room_queue_name = f"{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}:{roomId}"
        self.redis.rpush(room_queue_name, message_json)
        # Also push to main queue for the listener (LPUSH for FIFO consumption with BRPOP)
        self.redis.lpush(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME, message_json)
        return message
    
    def push_message(self, message_data: dict) -> bool:
        """
        Push a raw message dict to the Redis queue.
        
        Args:
            message_data: The message dictionary to push.
        
        Returns:
            True if successful, False otherwise.
        """
        try:
            message_json = json.dumps(message_data)
            room_id = message_data.get("roomId")
            if room_id:
                # Push to room-specific queue for querying by roomId (RPUSH for chronological order)
                room_queue_name = f"{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}:{room_id}"
                self.redis.rpush(room_queue_name, message_json)
            # Also push to main queue for the listener (LPUSH for FIFO consumption with BRPOP)
            self.redis.lpush(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME, message_json)
            return True
        except Exception as e:
            print(f"ActorRedisMessageListener: Failed to push message: {e}")
            return False
    
    def get_message(self) -> Optional[str]:
        """
        Gets a new message from the queue (non-blocking).

        Returns:
            The message string or None.
        """
        return self.redis.rpop(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME)
    
    def get_all_messages(self) -> List[str]:
        """
        Gets all messages from the queue without removing them.

        Returns:
            List of message strings.
        """
        return self.redis.lrange(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME, 0, -1)

    def clear_messages(self) -> None:
        """
        Clears all messages from the queue.
        """
        self.redis.delete(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME)
    
    def get_message_count(self) -> int:
        """
        Gets the number of messages in the queue.

        Returns:
            The number of messages.
        """
        return self.redis.llen(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME)
    
    def stop(self) -> None:
        """
        Signal the listener to stop.
        """
        self._running = False
        print("ActorRedisMessageListener: Stop signal received.")
    
    def is_running(self) -> bool:
        """
        Check if the listener is still running.
        
        Returns:
            True if running, False otherwise.
        """
        return self._running
    
    def health_check(self) -> bool:
        """
        Check if Redis connection is healthy.
        
        Returns:
            True if healthy, False otherwise.
        """
        try:
            self.redis.ping()
            return True
        except Exception as e:
            print(f"ActorRedisMessageListener: Health check failed: {e}")
            return False
