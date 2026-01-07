import json
import redis
import traceback
from datetime import datetime

def lambda_handler(event, context):
    """
    Lambda handler to send completion message to Redis queue.
    Sends message payload to Redis queue with room_id.
    """
    try:
        # Extract task input from event
        task_input = event.get('task_input', {})
        
        # Get required parameters from task_input
        room_id = task_input.get('CHAT_ROOM_ID', 'room-1')
        user_id = task_input.get('user_id', 'unknown')
        video_id = task_input.get('video_id', 'unknown')
        
        # Message details
        message = "7___lambda___Video processing completed"
        client_id = f"bot-{user_id}-{video_id}"
        timestamp = datetime.now().isoformat() + "Z"

        # Connect to Redis
        redis_client = redis.Redis(
            host="subtiter.ai",
            port=27379,
            password="token_234_asdf_234_s24v!_$+_234_asdf_324!_sdf",
            db=0,
            decode_responses=True
        )
        
        # Prepare the message payload
        payload = {
            "kind": "video-process-message",
            "message": message,
            "clientId": client_id,
            "timestamp": timestamp,
            "roomId": room_id,
            "isTesting": False
        }

        # Send message to Redis queue
        redis_client.rpush(f"subtiter_video_process:{room_id}", json.dumps(payload))
        redis_client.lpush("subtiter_video_process", json.dumps(payload))
        redis_client.close()
        
        print(f"✅ Message sent successfully to Redis queue!")
        print(f"Room ID: {room_id}")
        print(f"Payload: {json.dumps(payload)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Message sent successfully to Redis queue',
                'room_id': room_id,
                'client_id': client_id
            })
        }
        
    except redis.exceptions.ConnectionError as e:
        print(f"❌ Redis Connection Error: Could not connect to Redis")
        print(f"Details: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Redis connection error: {str(e)}'
            })
        }
    except redis.exceptions.TimeoutError as e:
        print(f"❌ Redis Timeout Error: Connection timed out")
        print(f"Details: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Redis timeout error: {str(e)}'
            })
        }
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Unexpected error: {str(e)}'
            })
        }

