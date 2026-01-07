# flake8: noqa: E501
"""
Test script for Redis -> WebSocket message delivery.

This script tests the integration between:
1. Redis queue (message producer)
2. ActorRedisMessageListener (Ray actor that listens to Redis)
3. WebSocket connections (message consumer)

Redis Authentication:
    This script uses password authentication for Redis connections.
    The password is automatically loaded from the .env file via the REDIS_PASSWORD
    environment variable. Make sure REDIS_PASSWORD is set in your .env file.

Usage:
    1. Start the FastAPI server: python -m app.main
    2. Run this test: python -m pytest tests/test_redis_websocket_integration.py -v -s
    
    Or run directly:
    python tests/test_redis_websocket_integration.py
"""

import asyncio
import json
import redis
import websockets
import time
import sys
import os
import random
import string
import click
from datetime import datetime
from app.redis.redis_utils import get_redis_client
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load .env file to get the same settings as the server
from dotenv import load_dotenv
load_dotenv()

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "26379"))
REDIS_DB = int(os.environ.get("REDIS_DB", "0"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")  # Password is required for Redis connection
REDIS_QUEUE_NAME = os.environ.get("REDIS_VIDEO_PROCESS_QUEUE_NAME", "subtiter_video_process")


WEBSOCKET_HOST = os.environ.get("WEBSOCKET_HOST", "localhost")
WEBSOCKET_PORT = int(os.environ.get("WEBSOCKET_PORT", "22081"))

# Test parameters
TEST_CLIENT_ID = "test-client-456"


def generate_random_room_id(length=10):
    """Generate a random string of specified length."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def send_message_to_redis(message_data: dict):
    """
    Send a message to the Redis queue.
    
    Messages are pushed to both:
    1. Room-specific queue: REDIS_QUEUE_NAME:roomId (for querying by roomId)
    2. Main queue: REDIS_QUEUE_NAME (for the listener/dispatcher)
    
    Args:
        message_data: The message dictionary to send. Must contain 'roomId' field.
    """
    client = get_redis_client()
    message_json = json.dumps(message_data)
    
    # Get roomId from message data
    room_id = message_data.get("roomId")
    
    # For room-specific queue: Use RPUSH to add to the right (tail)
    # This ensures LRANGE returns messages in chronological order (oldest first)
    # For main queue: Use LPUSH to add to the left (head)
    # The listener uses BRPOP which pops from the right (tail)
    # This creates a FIFO queue for consumption
    
    # Push to room-specific queue for querying by roomId (RPUSH for chronological order)
    if room_id:
        room_queue_name = f"{REDIS_QUEUE_NAME}:{room_id}"
        client.rpush(room_queue_name, message_json)
        print(f"[REDIS] Sent message to room-specific queue '{room_queue_name}': {message_data}")
    
    # Also push to main queue for the listener (LPUSH for FIFO consumption with BRPOP)
    client.lpush(REDIS_QUEUE_NAME, message_json)
    print(f"[REDIS] Sent message to main queue '{REDIS_QUEUE_NAME}': {message_data}")
    client.close()


async def test_redis_to_websocket(room_id=None):
    """
    Test that messages sent to Redis are delivered via WebSocket.
    
    Args:
        room_id: Room ID to use for testing. If None, generates a random one.
    """
    if room_id is None:
        room_id = generate_random_room_id()
    websocket_url = f"ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}/api/v1/chat/ws/{room_id}/{TEST_CLIENT_ID}"
    
    print("=" * 60)
    print("Redis -> WebSocket Integration Test")
    print("=" * 60)
    print(f"Redis: {REDIS_HOST}:{REDIS_PORT} (DB: {REDIS_DB}, Password: {'set' if REDIS_PASSWORD else 'not set'})")
    print(f"Queue: {REDIS_QUEUE_NAME}")
    print(f"WebSocket: {websocket_url}")
    print(f"Room ID: {room_id}")
    print(f"Client ID: {TEST_CLIENT_ID}")
    print("=" * 60)
    
    received_messages = []
    test_message_id = f"test-{int(time.time() * 1000)}"
    
    try:
        print(f"\n[WS] Connecting to WebSocket...")
        async with websockets.connect(websocket_url) as websocket:
            print(f"[WS] ✓ Connected successfully!")
            
            # Give the server a moment to register the connection
            await asyncio.sleep(1)
            
            # Create test message
            test_message = {
                "kind": "video-process-message",
                "clientId": f"bot-{TEST_CLIENT_ID}",
                "message": f"1___Test message from Redis at {datetime.now().isoformat()} (ID: {test_message_id})",
                "timestamp": datetime.now().isoformat(),
                "roomId": room_id
            }
            
            print(f"\n[TEST] Sending test message to Redis queue...")
            print(f"[TEST] Message: {json.dumps(test_message, indent=2)}")
            
            # Send message to Redis
            send_message_to_redis(test_message)
            
            # Wait for message to be received via WebSocket
            print(f"\n[WS] Waiting for message from WebSocket (timeout: 30s)...")
            
            try:
                # Set a timeout for receiving messages
                timeout = 30  # seconds
                start_time = time.time()
                
                while time.time() - start_time < timeout:
                    try:
                        # Wait for a message with a short timeout
                        message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                        message_data = json.loads(message)
                        
                        print(f"\n[WS] ✓ Received message:")
                        print(f"     Kind: {message_data.get('kind')}")
                        print(f"     Client ID: {message_data.get('clientId')}")
                        print(f"     Room ID: {message_data.get('roomId')}")
                        print(f"     Message: {message_data.get('message')}")
                        print(f"     Timestamp: {message_data.get('timestamp')}")
                        
                        received_messages.append(message_data)
                        
                        # Check if this is our test message
                        if message_data.get("kind") == "video-process-message":
                            msg_content = message_data.get("message", "")
                            if test_message_id in msg_content:
                                print(f"\n[TEST] ✓ SUCCESS! Test message received via WebSocket!")
                                print("=" * 60)
                                return True
                        
                        # Skip heartbeat messages
                        if message_data.get("kind") in ["heartbeat", "ping"]:
                            print(f"     (Heartbeat/ping message, continuing to wait...)")
                            continue
                            
                    except asyncio.TimeoutError:
                        # No message received, continue waiting
                        elapsed = time.time() - start_time
                        print(f"[WS] Still waiting... ({elapsed:.1f}s elapsed)")
                        continue
                
                print(f"\n[TEST] ✗ TIMEOUT! No test message received within {timeout}s")
                print(f"[TEST] Received {len(received_messages)} messages total:")
                for i, msg in enumerate(received_messages):
                    print(f"       {i+1}. {msg.get('kind')}: {msg.get('message', '')[:50]}...")
                return False
                
            except Exception as e:
                print(f"\n[WS] Error receiving message: {e}")
                import traceback
                traceback.print_exc()
                return False
                
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"\n[WS] ✗ Connection closed: {e}")
        return False
    except ConnectionRefusedError:
        print(f"\n[WS] ✗ Connection refused. Is the FastAPI server running?")
        print(f"     Start it with: python -m app.main")
        return False
    except Exception as e:
        print(f"\n[WS] ✗ Connection error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_multiple_messages(room_id=None):
    """
    Test sending multiple messages to Redis and receiving them via WebSocket.
    
    Args:
        room_id: Room ID to use for testing. If None, generates a random one.
    """
    if room_id is None:
        room_id = generate_random_room_id()
    websocket_url = f"ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}/api/v1/chat/ws/{room_id}/{TEST_CLIENT_ID}"
    
    print("\n" + "=" * 60)
    print("Multiple Messages Test")
    print("=" * 60)
    
    num_messages = 3
    test_batch_id = f"batch-{int(time.time() * 1000)}"
    
    try:
        async with websockets.connect(websocket_url) as websocket:
            print(f"[WS] ✓ Connected!")
            await asyncio.sleep(1)
            
            # Send multiple messages
            print(f"\n[TEST] Sending {num_messages} messages to Redis...")
            for i in range(num_messages):
                test_message = {
                    "kind": "video-process-message",
                    "clientId": f"bot-{TEST_CLIENT_ID}",
                    "message": f"{i+1}___Message {i+1} of {num_messages} (Batch: {test_batch_id})",
                    "timestamp": datetime.now().isoformat(),
                    "roomId": room_id
                }
                send_message_to_redis(test_message)
                await asyncio.sleep(0.1)  # Small delay between sends
            
            # Receive messages
            received_count = 0
            timeout = 30
            start_time = time.time()
            
            print(f"\n[WS] Waiting for {num_messages} messages...")
            
            while received_count < num_messages and time.time() - start_time < timeout:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    message_data = json.loads(message)
                    
                    if message_data.get("kind") == "video-process-message":
                        msg_content = message_data.get("message", "")
                        if test_batch_id in msg_content:
                            received_count += 1
                            msg_room_id = message_data.get("roomId", "N/A")
                            print(f"[WS] ✓ Received message {received_count}/{num_messages} (Room ID: {msg_room_id}): {msg_content[:60]}...")
                            
                except asyncio.TimeoutError:
                    continue
            
            if received_count == num_messages:
                print(f"\n[TEST] ✓ SUCCESS! All {num_messages} messages received!")
                return True
            else:
                print(f"\n[TEST] ✗ PARTIAL! Only {received_count}/{num_messages} messages received")
                return False
                
    except Exception as e:
        print(f"\n[TEST] ✗ Error: {e}")
        return False


def test_redis_connection():
    """Test that Redis is reachable."""
    print("\n" + "=" * 60)
    print("Redis Connection Test")
    print("=" * 60)
    
    try:
        client = get_redis_client()
        client.ping()
        print(f"[REDIS] ✓ Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
        
        # Check main queue length
        queue_len = client.llen(REDIS_QUEUE_NAME)
        print(f"[REDIS] Main queue '{REDIS_QUEUE_NAME}' has {queue_len} messages")
        
        # Check room-specific queue length (if it exists) - using a sample random room ID
        sample_room_id = generate_random_room_id()
        room_queue_name = f"{REDIS_QUEUE_NAME}:{sample_room_id}"
        room_queue_len = client.llen(room_queue_name)
        if room_queue_len > 0:
            print(f"[REDIS] Room-specific queue '{room_queue_name}' has {room_queue_len} messages")
        
        client.close()
        return True
    except redis.ConnectionError as e:
        print(f"[REDIS] ✗ Connection failed: {e}")
        print(f"        Make sure Redis is running at {REDIS_HOST}:{REDIS_PORT}")
        if not REDIS_PASSWORD:
            print(f"        WARNING: REDIS_PASSWORD is not set. Redis may require authentication.")
        else:
            print(f"        Check that REDIS_PASSWORD is correct in your .env file.")
        return False
    except redis.AuthenticationError as e:
        print(f"[REDIS] ✗ Authentication failed: {e}")
        print(f"        Check that REDIS_PASSWORD is correct in your .env file.")
        return False
    except Exception as e:
        print(f"[REDIS] ✗ Error: {e}")
        return False


def clear_redis_queue(room_id=None):
    """Clear the Redis queues (useful for clean test runs)."""
    try:
        client = get_redis_client()
        
        # Clear main queue
        deleted_main = client.delete(REDIS_QUEUE_NAME)
        print(f"[REDIS] Cleared main queue '{REDIS_QUEUE_NAME}' (deleted: {deleted_main})")
        
        # Clear room-specific queue for test room if provided
        if room_id:
            room_queue_name = f"{REDIS_QUEUE_NAME}:{room_id}"
            deleted_room = client.delete(room_queue_name)
            if deleted_room:
                print(f"[REDIS] Cleared room-specific queue '{room_queue_name}' (deleted: {deleted_room})")
        
        client.close()
    except Exception as e:
        print(f"[REDIS] Error clearing queue: {e}")


def print_queue_messages(room_id: str):
    """
    Print all messages in the queue for a given room ID.
    
    Args:
        room_id: The room ID (video ID) to query
    """
    try:
        client = get_redis_client()
        room_queue_name = f"{REDIS_QUEUE_NAME}:{room_id}"
        
        print("=" * 60)
        print(f"Queue Messages for Room ID: {room_id}")
        print("=" * 60)
        print(f"Queue Name: {room_queue_name}")
        print(f"Redis: {REDIS_HOST}:{REDIS_PORT} (DB: {REDIS_DB})")
        print("=" * 60)
        
        # Get queue length
        queue_len = client.llen(room_queue_name)
        print(f"\nTotal messages in queue: {queue_len}")
        
        if queue_len == 0:
            print("\n[INFO] Queue is empty. No messages found.")
            client.close()
            return
        
        print(f"\nFetching all messages from queue...\n")
        
        # Get all messages from the queue (without removing them)
        # LRANGE gets elements from the list without popping
        messages = client.lrange(room_queue_name, 0, -1)
        
        for i, message_json in enumerate(messages, 1):
            try:
                message_data = json.loads(message_json)
                print(f"Message {i}/{queue_len}:")
                print(json.dumps(message_data, indent=2))
                print("-" * 60)
            except json.JSONDecodeError as e:
                print(f"Message {i}/{queue_len}: [ERROR - Invalid JSON]")
                print(f"Raw content: {message_json[:100]}...")
                print(f"Error: {e}")
                print("-" * 60)
        
        client.close()
        print(f"\n[INFO] Displayed {len(messages)} message(s) from queue '{room_queue_name}'")
        
    except redis.ConnectionError as e:
        print(f"\n[ERROR] Redis connection failed: {e}")
        print(f"        Make sure Redis is running at {REDIS_HOST}:{REDIS_PORT}")
        if not REDIS_PASSWORD:
            print(f"        WARNING: REDIS_PASSWORD is not set. Redis may require authentication.")
        else:
            print(f"        Check that REDIS_PASSWORD is correct in your .env file.")
    except redis.AuthenticationError as e:
        print(f"\n[ERROR] Redis authentication failed: {e}")
        print(f"        Check that REDIS_PASSWORD is correct in your .env file.")
    except Exception as e:
        print(f"\n[ERROR] Error reading queue: {e}")
        import traceback
        traceback.print_exc()


async def run_tests(room_id=None):
    """
    Run all tests.
    
    Args:
        room_id: Room ID to use for testing. If None, generates a random one.
    """
    if room_id is None:
        room_id = generate_random_room_id()
    
    print("\n" + "=" * 60)
    print("  REDIS -> WEBSOCKET INTEGRATION TEST SUITE")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  REDIS_HOST: {REDIS_HOST}")
    print(f"  REDIS_PORT: {REDIS_PORT}")
    print(f"  REDIS_DB: {REDIS_DB}")
    print(f"  REDIS_PASSWORD: {'***' if REDIS_PASSWORD else '(not set)'}")
    print(f"  REDIS_QUEUE_NAME: {REDIS_QUEUE_NAME}")
    print(f"  WEBSOCKET_HOST: {WEBSOCKET_HOST}")
    print(f"  WEBSOCKET_PORT: {WEBSOCKET_PORT}")
    print(f"  ROOM_ID: {room_id}")
    print(f"\nTo customize, set environment variables:")
    print(f"  export REDIS_HOST=localhost")
    print(f"  export REDIS_PORT=26379")
    print(f"  export REDIS_PASSWORD=your_password")
    print(f"  export WEBSOCKET_HOST=localhost")
    print(f"  export WEBSOCKET_PORT=22081")
    
    results = {}
    
    # Test 1: Redis connection
    results["redis_connection"] = test_redis_connection()
    if not results["redis_connection"]:
        print("\n[FATAL] Cannot proceed without Redis connection!")
        return False
    
    # Optional: Clear the queue before testing
    print("\n[SETUP] Clearing Redis queue for clean test...")
    clear_redis_queue(room_id=room_id)
    
    # Test 2: Single message delivery
    results["single_message"] = await test_redis_to_websocket(room_id=room_id)
    
    # Clear room-specific queue before multiple messages test to avoid duplicates
    # (the WebSocket connection sends all existing messages from Redis on connect)
    if results["single_message"]:
        print("\n[SETUP] Clearing room-specific queue before multiple messages test...")
        clear_redis_queue(room_id=room_id)
    
    # Test 3: Multiple messages
    if results["single_message"]:
        results["multiple_messages"] = await test_multiple_messages(room_id=room_id)
    else:
        results["multiple_messages"] = False
        print("\n[SKIP] Skipping multiple messages test due to single message failure")
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {test_name}: {status}")
    
    all_passed = all(results.values())
    print("=" * 60)
    if all_passed:
        print("ALL TESTS PASSED! ✓")
    else:
        print("SOME TESTS FAILED! ✗")
    print("=" * 60)
    
    return all_passed


@click.group()
def cli():
    """Redis WebSocket Integration Test CLI."""
    pass


@cli.command()
@click.option('--room-id', '-r', default=None, help='Room ID to test (if not provided, uses a random room ID)')
def test(room_id):
    """Run the Redis -> WebSocket integration test suite."""
    success = asyncio.run(run_tests(room_id=room_id))
    sys.exit(0 if success else 1)


@cli.command()
@click.option('--room-id', '-r', default=None, help='Room ID to test (if not provided, uses a random room ID)')
def print_queue(room_id):
    """Print all messages in the queue for a given room ID (video ID)."""
    print_queue_messages(room_id)


if __name__ == "__main__":
    cli()

