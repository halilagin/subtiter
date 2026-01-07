# flake8: noqa: E501
# clippercmd/chat_cli.py

"""
Command line tool to post chat messages to the Klippers chat API endpoint.
"""

import click
import requests
import json
from datetime import datetime
import uuid
import os
from config import settings
import redis
from .redis_utils import get_redis_client


@click.command()
@click.option('--message', '-m', required=True, help='The message to send')
@click.option('--room-id', '-r', default='room-1', help='Room ID for the chat (default: room-1)')
@click.option('--client-id', '-c', help='Client ID (default: auto-generated)')
@click.option('--url', '-u', default='http://localhost:22081', help='Base URL of the API (default: http://localhost:22081)')
@click.option('--is-testing', is_flag=True, help='Mark the message as a test message')
@click.option('--conversation-id', help='Optional conversation ID')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def send_message(message, room_id, client_id, url, is_testing, conversation_id, verbose):
    """
    Send a chat message to the Klippers chat API endpoint.
    """
    _send_message(message, room_id, client_id, url, is_testing, conversation_id, verbose)



def _send_message(message, room_id, client_id, url, is_testing, conversation_id, verbose):
    # _send_message_to_rest_api(message, room_id, client_id, url, is_testing, conversation_id, verbose)
    _send_message_to_redis(message, room_id, client_id, url, is_testing, conversation_id, verbose)


def _send_message_to_rest_api(message, room_id, client_id, url, is_testing, conversation_id, verbose):
    """
    Send a chat message to the Klippers chat API endpoint.
    
    Examples:
    
        # Send a simple message
        python chat_cli.py -m "Hello, world!"
        
        # Send with custom room and client ID
        python chat_cli.py -m "Test message" -r "room-2" -c "user-123"
        
        # Send to different server
        python chat_cli.py -m "Hello" -u "https://api.example.com"
        
        # Send a test message with additional metadata
        python chat_cli.py -m "Test" --is-testing --company-id "comp-1" --verbose
    """
    try:
        # Generate client ID if not provided
        if not client_id:
            client_id = f"user-{str(uuid.uuid4())[:8]}"
        
        # Generate timestamp
        timestamp = datetime.now().isoformat() + "Z"
        
        
        # Prepare the message payload
        payload = {
            "message": message,
            "clientId": client_id,
            "timestamp": timestamp,
            "roomId": room_id,
            "isTesting": is_testing
        }
        
        if conversation_id:
            payload["conversationId"] = conversation_id
        

        print(f"settings.RUN_KLIPPERSCMD_ON: {settings.RUN_KLIPPERSCMD_ON}")
        # Construct the API endpoint URL
        if settings.RUN_KLIPPERSCMD_ON != "fargate":
            endpoint = f"{url.rstrip('/')}/api/v1/chat/message/{room_id}/{client_id}"
        else:
            # task_input_json = os.environ.get('TASK_INPUT')
            # task_input_data = json.loads(task_input_json)
            # fargate_cli_room_id = task_input_data.get("CHAT_ROOM_ID", "room-1")
            
            payload = {
                "message": message,
                "clientId": client_id,
                "timestamp": timestamp,
                "roomId": room_id,
                "isTesting": is_testing
            }
            endpoint = f"https://{settings.WEBAPP_API_HOST_FARGATE}/api/v1/chat/message/frgt/{room_id}/{client_id}/{settings.FARGATE_TOKEN}"
        
        print(f"send_message:endpoint: {endpoint}")
        if verbose:
            click.echo(f"Sending message to: {endpoint}")
            click.echo(f"Payload: {json.dumps(payload, indent=2)}")
        
        
        # Send the HTTP POST request
        response = requests.post(
            endpoint,
            json=payload,
            headers={
                "Content-Type": "application/json"
            },
            timeout=30
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Display the response
        click.echo(f"✅ Message sent successfully!")
        if verbose:
            click.echo(f"Response status: {response.status_code}")
            click.echo(f"Response body: {response.text}")
        
        # Display message details
        click.echo(f"Room ID: {room_id}")
        click.echo(f"Client ID: {client_id}")
        click.echo(f"Message: {message}")
        
    except requests.exceptions.ConnectionError as e:
        click.echo(f"❌ Error: Could not connect to {url}")
        click.echo("Make sure the server is running and the URL is correct.")
        
    except requests.exceptions.Timeout as e:
        click.echo("❌ Error: Request timed out")
        
    except requests.exceptions.HTTPError as e:
        click.echo(f"❌ HTTP Error: {e}")
        if verbose and response:
            click.echo(f"Response body: {response.text}")
        
    except Exception as e:
        click.echo(f"❌ Unexpected error: {e}")
        


def _send_message_to_redis(message, room_id, client_id, url, is_testing, conversation_id, verbose):
    """
    Send a chat message to Redis queue for WebSocket delivery.
    
    This function publishes messages to a Redis queue that is consumed by the
    ActorRedisMessageListener, which then forwards messages to connected WebSocket clients.
    
    Examples:
    
        # Send a simple message
        python chat_cli.py -m "Hello, world!"
        
        # Send with custom room and client ID
        python chat_cli.py -m "Test message" -r "room-2" -c "user-123"
        
        # Send a test message with additional metadata
        python chat_cli.py -m "Test" --is-testing --verbose
    """
    try:
        # Generate client ID if not provided
        if not client_id:
            client_id = f"user-{str(uuid.uuid4())[:8]}"
        
        # Generate timestamp
        timestamp = datetime.now().isoformat() + "Z"
        
        # Prepare the message payload for Redis
        payload = {
            "kind": "video-process-message",
            "message": message,
            "clientId": client_id,
            "timestamp": timestamp,
            "roomId": room_id,
            "isTesting": is_testing
        }
        
        if conversation_id:
            payload["conversationId"] = conversation_id
        
        if verbose:
            click.echo(f"[REDIS] Connecting to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT} DB={settings.REDIS_DB}")
            click.echo(f"[REDIS] Queue: {settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}")
            click.echo(f"[REDIS] Payload: {json.dumps(payload, indent=2)}")
        
        # Create Redis client and send message
        redis_client = get_redis_client()
        
        # For room-specific queue: Use RPUSH to add to the right (tail)
        # This ensures LRANGE returns messages in chronological order (oldest first)
        # For main queue: Use LPUSH to add to the left (head)
        # The listener uses BRPOP which pops from the right (tail)
        # This creates a FIFO queue for consumption
        message_json = json.dumps(payload)
        # Push to room-specific queue for querying by roomId (RPUSH for chronological order)
        room_queue_name = f"{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}:{room_id}"
        redis_client.rpush(room_queue_name, message_json)
        # Also push to main queue for the listener (LPUSH for FIFO consumption with BRPOP)
        redis_client.lpush(settings.REDIS_VIDEO_PROCESS_QUEUE_NAME, message_json)
        redis_client.close()
        
        # Display success
        click.echo(f"✅ [REDIS] Message sent to queue '{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}'!")
        if verbose:
            click.echo(f"Room ID: {room_id}")
            click.echo(f"Client ID: {client_id}")
            click.echo(f"Message: {message}")
        
    except redis.exceptions.ConnectionError as e:
        click.echo(f"❌ [REDIS] Error: Could not connect to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        click.echo("Make sure Redis is running and accessible.")
        if verbose:
            click.echo(f"Details: {e}")
        
    except redis.exceptions.TimeoutError as e:
        click.echo("❌ [REDIS] Error: Redis connection timed out")
        if verbose:
            click.echo(f"Details: {e}")
        
    except Exception as e:
        click.echo(f"❌ [REDIS] Unexpected error: {e}")
        



@click.command()
@click.option('--room-id', '-r', default='room-1', help='Room ID to test (default: room-1)')
@click.option('--url', '-u', default='http://localhost:22081', help='Base URL of the API (default: http://localhost:22081)')
@click.option('--count', '-n', default=3, help='Number of test messages to send (default: 3)')
@click.option('--delay', '-d', default=0.1, help='Delay between messages in seconds (default: 1.0)')
def test_chat(room_id, url, count, delay):
    _test_chat(room_id, url, count, delay)

def _test_chat(room_id, url, count, delay):
    """
    Send multiple test messages to verify the chat API is working.
    """
    import time
    
    click.echo(f"🧪 Testing chat API with {count} messages...")
    click.echo(f"Room ID: {room_id}")
    click.echo(f"API URL: {url}")
    click.echo("=" * 50)
    
    for i in range(1, count + 1):
        client_id = f"test-user-{i}"
        message = f"Test message #{i} from CLI"
        
        click.echo(f"Sending message {i}/{count}...")
        
        # Use the existing send_message function logic
        timestamp = datetime.now().isoformat() + "Z"
        payload = {
            "message": message,
            "clientId": client_id,
            "timestamp": timestamp,
            "roomId": room_id,
            "isTesting": True
        }
        
        endpoint = f"{url.rstrip('/')}/api/v1/chat/message/{room_id}/{client_id}"
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            response.raise_for_status()
            click.echo(f"  ✅ Message {i} sent successfully")
        except Exception as e:
            click.echo(f"  ❌ Message {i} failed: {e}")
        
        # Add delay between messages (except for the last one)
        if i < count:
            time.sleep(delay)
    
    click.echo("=" * 50)
    click.echo("🎉 Test completed!")


@click.group("chat")
def chat_cli():
    """Klippers Chat CLI Tool - Send messages to the chat API"""
    pass


# Add commands to the group
chat_cli.add_command(send_message, name='send')
chat_cli.add_command(test_chat, name='test')


if __name__ == '__main__':
    chat_cli()
