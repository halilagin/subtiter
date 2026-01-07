
# flake8: noqa: E501
import asyncio
import datetime
import time
import boto3
from botocore.exceptions import ClientError
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
import json
from contextlib import closing
from typing import List
import redis
from app.redis.redis_utils import get_redis_client
from app.actors.actor_chat import ActorChat, ActorRedisMessageListener
from app.db.model_document import UserPromotionCode, VideoProcessingApplication
from app.klipperscmd.clippercmd.model.short_config_model import KlippersShortsConfig
from app.schemas.schema_chat import ChatMessage
from fastapi import APIRouter
from app.schemas.schema_chat import WSConnection
import os
import traceback
from app.service.klippers.update_video_status_in_db import _update_video_status_in_db
from app.db.database import get_db, SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends
from app.config import get_shorts_config, settings

router = APIRouter(prefix="/chat", tags=["chat"])

# Actors will be initialized after Ray starts
actor_chat = None
actor_redis_listener = None
redis_listener_task = None


def initialize_actor():
    """Initialize the Ray actor after Ray is started."""
    global actor_chat
    if actor_chat is not None:
        print("ActorChat already initialized, skipping.")
        return
    
    try:
        print("Attempting to create ActorChat remote instance...")
        actor_chat = ActorChat.remote()
        print("✓ ActorChat remote instance created successfully.")
    except Exception as e:
        traceback.print_exc()
        print(f"✗ Failed to create ActorChat remote instance: {e}")


def initialize_redis_listener():
    """Initialize the Redis listener Ray actor after Ray is started."""
    global actor_redis_listener
    if actor_redis_listener is not None:
        print("ActorRedisMessageListener already initialized, skipping.")
        return
    
    try:
        print("Attempting to create ActorRedisMessageListener remote instance...")
        actor_redis_listener = ActorRedisMessageListener.remote()
        print("✓ ActorRedisMessageListener remote instance created successfully.")
    except Exception as e:
        traceback.print_exc()
        print(f"✗ Failed to create ActorRedisMessageListener remote instance: {e}")


async def process_lambda_completion_message(message_data: dict, room_id: str, ws_conn: WSConnection, client_id: str):
    """
    Process lambda completion message by downloading video files from S3 in a thread pool
    and then queuing the message to the WebSocket connection.
    
    Args:
        message_data: The message data dictionary
        room_id: The room ID
        ws_conn: The WebSocket connection object
        client_id: The client ID for logging
    """
    try:
        user_id = message_data.get("clientId").replace("bot-", "").replace("-"+room_id, "")
        
        # Run the blocking download operation in a thread pool
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, download_video_files_from_s3, user_id, room_id)
        
        message_json = json.dumps({
            "kind": "video-process-message",
            "clientId": message_data.get("clientId"),
            "message": message_data.get("message"),
            "timestamp": message_data.get("timestamp"),
            "roomId": room_id
        })
        await ws_conn.queue.put(message_json)
        print(f"Redis dispatcher: Message queued for client {client_id} in room {room_id}", flush=True)
    except Exception as e:
        print(f"Redis dispatcher: Failed to process completion message for client {client_id}: {e}", flush=True)
        traceback.print_exc()


async def redis_message_dispatcher():
    """
    Background task that continuously polls the Redis listener actor for messages
    and dispatches them to the appropriate WebSocket connections based on roomId.
    
    This runs in the FastAPI event loop but doesn't block because:
    1. The Ray actor's listen_for_message() runs in a separate process
    2. We use asyncio-compatible ray.get() with short timeouts
    
    Args:
        db_session_factory: Database session factory (default: SessionLocal).
                           Creates a new session for each database operation.
    """
    global actor_redis_listener
    
    print("Redis message dispatcher started.", flush=True)
    
    loop_count = 0
    while True:
        try:
            loop_count += 1
            
            # Ensure the actor is initialized
            if actor_redis_listener is None:
                print(f"Redis dispatcher: Actor not initialized, attempting to initialize...", flush=True)
                if os.environ.get("RAY_AVAILABLE", "true") != "false":
                    initialize_redis_listener()
                if actor_redis_listener is None:
                    print(f"Redis dispatcher: Failed to initialize actor, waiting 5s...", flush=True)
                    await asyncio.sleep(5)  # Wait before retrying
                    continue
                else:
                    print(f"Redis dispatcher: Actor initialized successfully!", flush=True)
            
            # Log every 10 iterations to show the dispatcher is running
            if loop_count % 10 == 1:
                print(f"Redis dispatcher: Polling iteration {loop_count}, active rooms: {list(active_connections.keys())}", flush=True)
            
            # Poll for messages from the Redis queue via the Ray actor
            # This is non-blocking because ray.get() with timeout releases the GIL
            try:
                import ray
                # Use run_in_executor to avoid blocking the event loop
                message_data = await asyncio.get_running_loop().run_in_executor(
                    None,
                    lambda: ray.get(actor_redis_listener.listen_for_message.remote(timeout=1))
                )
            except Exception as e:
                import ray.exceptions
                if isinstance(e, ray.exceptions.ActorDiedError):
                    print(f"✗ ActorRedisMessageListener died, attempting to reinitialize...", flush=True)
                    actor_redis_listener = None
                    continue
                else:
                    print(f"Redis dispatcher: Error getting message from actor: {e}", flush=True)
                    traceback.print_exc()
                    await asyncio.sleep(1)
                    continue
            
            if message_data is None:
                # No message received within timeout, continue polling
                continue
            
            # Extract roomId from the message
            room_id = message_data.get("roomId")
            print(f"[DISPATCHER] ✓ Received message from main queue '{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}' for roomId: '{room_id}'", flush=True)
            print(f"[DISPATCHER] Message data: {message_data}", flush=True)
            if not room_id:
                print(f"Redis dispatcher: Message missing roomId, skipping: {message_data}", flush=True)
                continue
            
            # Call the update_video_status endpoint internally
            # Use FastAPI's dependency injection system (get_db) for proper session management
            try:
                # Convert message_data dict to ChatMessage object
                chat_message = ChatMessage(**message_data)
                # Use get_db() generator via dependency injection system
                # contextlib.closing ensures the generator is properly closed, triggering the finally block
                with closing(get_db()) as db_gen:
                    db = next(db_gen)
                    # Call the endpoint handler function directly with injected db
                    await update_video_status(chat_message=chat_message, db=db)
            except Exception as e:
                print(f"Redis dispatcher: Error updating video status: {e}", flush=True)
                traceback.print_exc()
            # Check if there are active connections for this roomId
            if room_id not in active_connections:
                print(f"Redis dispatcher: No active connections for roomId '{room_id}'", flush=True)
                print(f"Redis dispatcher: Message dropped: room id:{room_id} ", flush=True)
                continue
            
            # Prepare the message JSON to send via WebSocket
            message_json = json.dumps({
                "kind": message_data.get("kind", "video-process-message"),
                "clientId": message_data.get("clientId", ""),
                "message": message_data.get("message", ""),
                "timestamp": message_data.get("timestamp", ""),
                "roomId": room_id
            })
            
            # Send the message to all WebSocket connections in the room
            print(f"Redis dispatcher: Forwarding message to room {room_id}: {message_data}", flush=True)
            for client_id, ws_conn in active_connections[room_id].items():
                try:
                    if message_data.get("message").startswith("7___lambda___"):
                        # the completion message received from lambda, 
                        # so first we need to download the video files from s3 
                        # then we need to send it to the client
                        await process_lambda_completion_message(message_data, room_id, ws_conn, client_id)
                    else:
                        await ws_conn.queue.put(message_json)
                        print(f"Redis dispatcher: Message queued for client {client_id} in room {room_id}", flush=True)
                except Exception as e:
                    print(f"Redis dispatcher: Failed to queue message for client {client_id}: {e}", flush=True)
                    traceback.print_exc()
                    
        except asyncio.CancelledError:
            print("Redis message dispatcher cancelled.", flush=True)
            break
        except Exception as e:
            print(f"Redis dispatcher: Unexpected error: {e}", flush=True)
            traceback.print_exc()
            await asyncio.sleep(1)  # Prevent tight loop on errors
    
    print("Redis message dispatcher stopped.", flush=True)


async def start_redis_listener_task():
    """Start the background Redis listener task if not already running."""
    global redis_listener_task
    
    if redis_listener_task is not None and not redis_listener_task.done():
        print("Redis listener task already running.")
        return
    
    if os.environ.get("RAY_AVAILABLE", "true") == "false":
        print("Ray not available, skipping Redis listener task.")
        return
    
    try:
        redis_listener_task = asyncio.create_task(redis_message_dispatcher())
        print("✓ Redis listener background task started.")
    except RuntimeError as e:
        # No event loop running yet, will be started later
        print(f"Failed to start Redis listener task: {e}")


def stop_redis_listener_task():
    """Stop the background Redis listener task."""
    global redis_listener_task, actor_redis_listener
    
    if redis_listener_task is not None:
        redis_listener_task.cancel()
        redis_listener_task = None
        print("Redis listener task cancelled.")
    
    if actor_redis_listener is not None:
        try:
            import ray
            ray.get(actor_redis_listener.stop.remote())
        except Exception as e:
            print(f"Error stopping Redis listener actor: {e}")


# Dictionary to hold active WebSocket connections, keyed by clientId.
# This is used for sending messages directly to a specific client.
# ws_connection = active_connections[roomId][clientId]
active_connections: dict[str, dict[str, WSConnection]] = {}





def _update_video_status(db: Session, chat_message: ChatMessage):
    """
    Update video status in database for a specific user and video
    """
    video_id = chat_message.roomId
    user_id = chat_message.clientId.replace("-"+video_id, "").replace("bot-", "")
    presess_sequence_number = int(chat_message.message.split("___")[0])
    status = "processing"
    processing_started_at = None
    processing_completed_at = None
    if presess_sequence_number == 1:
        processing_started_at = datetime.datetime.now().isoformat()
        status = "processing"
    elif presess_sequence_number == 7:
        processing_completed_at = datetime.datetime.now().isoformat()
        status = "completed"
    else:
        status = "processing"
    _update_video_status_in_db(db, user_id, video_id, status, processing_started_at, processing_completed_at)
    if status == "completed":
        pass
        # update promotion code video count allowance
        user_promotion_code = db.query(UserPromotionCode).filter(
            UserPromotionCode.user_id == user_id,
            UserPromotionCode.created_at >= datetime.datetime.now() - datetime.timedelta(days=30)
        ).first()
        if user_promotion_code:
            user_promotion_code.video_count_allowance += 1
            db.commit()
            
    return {"status": "video status updated"}



@router.post("/message/fetch_all_progress_messages/{roomId}", response_model=List[ChatMessage])
async def fetch_all_progress_messages(
    roomId: str, db: Session = Depends(get_db)):
    """
    Handles fetching all progress messages for a specific room.
    Fetches all messages from Redis queue that match the roomId,
    similar to the print-queue command in the test script.
    Returns a list of ChatMessage objects.
    """
    try:
        # Connect to Redis
        redis_client = get_redis_client()
        
        # Get all messages from the room-specific queue without removing them
        # This matches the behavior of print_queue_messages in the test script
        room_queue_name = f"{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}:{roomId}"
        
        # Get all messages from the queue (without removing them)
        # LRANGE gets elements from the list without popping (same as test command)
        message_strings = redis_client.lrange(room_queue_name, 0, -1)
        
        redis_client.close()
        
        # Parse JSON strings and convert to ChatMessage objects
        chat_messages: List[ChatMessage] = []
        for message_str in message_strings:
            try:
                message_data = json.loads(message_str)
                chat_message = ChatMessage(**message_data)
                chat_messages.append(chat_message)
            except (json.JSONDecodeError, ValueError, TypeError) as e:
                # Skip invalid messages (invalid JSON or invalid ChatMessage structure)
                print(f"Failed to parse message or create ChatMessage: {e}", flush=True)
                continue
        
        # Sort messages by timestamp in ascending order (smallest to largest)
        # Handle None timestamps by putting them at the end using a sentinel value
        # ISO format strings are lexicographically sortable, so string comparison works
        sorted_chat_messages = sorted(
            chat_messages, 
            key=lambda x: (x.timestamp is None, x.timestamp or ""), 
            reverse=False
        )
        return sorted_chat_messages
    except redis.ConnectionError as e:
        print(f"Redis connection error while fetching messages: {e}", flush=True)
        traceback.print_exc()
        raise HTTPException(
            status_code=503,
            detail=f"Redis connection failed: {str(e)}. Make sure Redis is running at {settings.REDIS_HOST}:{settings.REDIS_PORT}"
        )
    except redis.RedisError as e:
        print(f"Redis error while fetching messages: {e}", flush=True)
        traceback.print_exc()
        raise HTTPException(
            status_code=503,
            detail=f"Redis error: {str(e)}"
        )
    except Exception as e:
        print(f"Unexpected error while fetching messages: {e}", flush=True)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
    

@router.post("/message/update_video_status")
async def update_video_status(
    chat_message: ChatMessage, db: Session = Depends(get_db)):
    """
    Handles updating the video status in the database.
    """
    _update_video_status(db, chat_message)
    return {"status": "video status updated"}

@router.post("/message/{roomId}/{clientId}")
async def post_message(
    chat_message: ChatMessage, roomId: str, clientId: str, db: Session = Depends(get_db)):
    """
    Handles posting of a new message to the chat via REST API.
    The message is sent to an LLM and the reply is broadcasted back to the chat room.
    """
    import os
    global actor_chat
    print(f"Received from {chat_message.clientId}:", chat_message)
    
    # Check if Ray is available
    if os.environ.get("RAY_AVAILABLE", "true") != "false":
        if actor_chat is None:
            initialize_actor()
        
        if actor_chat is not None:
            print(f"Received from {chat_message.clientId}:", chat_message)
            # First, add the user's own message to the chat history and broadcast it.
            try:
                user_message_to_broadcast = await actor_chat.add_message.remote(roomId, clientId, chat_message)
                user_message_json = json.dumps({
                    "kind": "video-process-message",
                    "clientId": user_message_to_broadcast.clientId,
                    "message": user_message_to_broadcast.message,
                    "timestamp": user_message_to_broadcast.timestamp,
                    "roomId": user_message_to_broadcast.roomId
                })
                if roomId in active_connections:
                    for ws_conn in active_connections[roomId].values():
                        await ws_conn.queue.put(user_message_json)
            except Exception as e:
                import ray.exceptions
                if isinstance(e, ray.exceptions.ActorDiedError):
                    print(f"✗ ActorChat died, attempting to reinitialize...")
                    actor_chat = None
                    initialize_actor()
                    if actor_chat is not None:
                        # Retry once
                        try:
                            user_message_to_broadcast = await actor_chat.add_message.remote(roomId, clientId, chat_message)
                            user_message_json = json.dumps({
                                "kind": "video-process-message",
                                "clientId": user_message_to_broadcast.clientId,
                                "message": user_message_to_broadcast.message,
                                "timestamp": user_message_to_broadcast.timestamp,
                                "roomId": user_message_to_broadcast.roomId
                            })
                            if roomId in active_connections:
                                for ws_conn in active_connections[roomId].values():
                                    await ws_conn.queue.put(user_message_json)
                        except Exception as e2:
                            print(f"✗ Failed to reinitialize and use ActorChat: {e2}")
                            raise
                else:
                    raise
        else:
            return {"status": "error", "message": "Ray actor not available"}
    else:
        # Fallback when Ray is not available - simple message handling
        import datetime
        chat_message.timestamp = str(datetime.datetime.now().isoformat())
        user_message_json = json.dumps({
            "kind": "video-process-message",
            "clientId": chat_message.clientId,
            "message": chat_message.message,
            "timestamp": chat_message.timestamp,
            "roomId": roomId
        })
        if roomId in active_connections:
            for ws_conn in active_connections[roomId].values():
                await ws_conn.queue.put(user_message_json)




    _update_video_status(db, chat_message)
    
    return {"status": "message sent"}







def create_local_directory(directory_path: str):
    """Create local directory if it doesn't exist."""
    os.makedirs(directory_path, exist_ok=True)


def download_from_s3_to_local(s3_client: boto3.client, remote_path: str, local_path: str) -> bool:
    """
    Download a file from S3 to local storage.
    
    Returns:
        bool: True if download was successful, False otherwise
    """
    try:
        print(f"Downloading from S3 to local: {remote_path} to {local_path}")
        s3_client.download_file(settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME, remote_path, local_path)
        print(f"✓ Successfully downloaded: {remote_path}")
        return True
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', '')
        if error_code == '404' or error_code == 'NoSuchKey':
            print(f"⚠ File not found in S3 (skipping): {remote_path}")
            return False
        else:
            print(f"✗ Error downloading from S3: {remote_path}")
            print(f"  Error: {e}")
            traceback.print_exc()
            return False
    except Exception as e:
        print(f"✗ Error downloading from S3: {remote_path}")
        print(f"  Error: {e}")
        traceback.print_exc()
        return False



def download_video_files_from_s3(user_id: str, video_id: str):
    pass

    json_file_path = f"{settings.VIDEO_WAREHOUSE_ROOT_DIR}/{user_id}/{video_id}/shorts_config.json"
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    shorts_config = KlippersShortsConfig.model_validate(data)
    s3_client = boto3.client('s3')
    if shorts_config.config_json.applied_application == VideoProcessingApplication.GENERATE_SHORTS:
        download_genshorts_files_from_s3(s3_client, shorts_config, user_id, video_id)
    elif shorts_config.config_json.applied_application == VideoProcessingApplication.GENERATE_SUBTITLING:
        download_subtitling_files_from_s3(s3_client, shorts_config, user_id, video_id)
    elif shorts_config.config_json.applied_application == VideoProcessingApplication.APPLY_TRIM:
        download_trimming_files_from_s3(s3_client, shorts_config, user_id, video_id)
    else:
        raise ValueError(f"Invalid application type: {shorts_config.config_json.applied_application}")




def download_trimming_files_from_s3(s3_client: boto3.client, shorts_config: KlippersShortsConfig, user_id: str, video_id: str):
    pass
    file_names = [
        
    ]


    subtitle_configuration_count = len(shorts_config.config_json.trim_application.trim_configurations) + 1
    video_trimmed = [
        f"videos-cropped-stacked/segment_{i}.trimmed.mp4" for i in range(1, subtitle_configuration_count )
    ]
    video_trimmed_jsons = [
        f"videos-cropped-stacked/segment_{i}.trimmed.json" for i in range(1, subtitle_configuration_count )
    ]

    all_files = file_names + video_trimmed + video_trimmed_jsons

    create_local_directory(settings.VIDEO_WAREHOUSE_ROOT_DIR + "/" + user_id + "/" + video_id+"/videos-cropped-stacked")
    warehouse_base_name = settings.VIDEO_WAREHOUSE_ROOT_DIR.split("/")[-1]
    for file in all_files:
        local_path = settings.VIDEO_WAREHOUSE_ROOT_DIR + "/" + user_id + "/" + video_id + "/" + file
        remote_prefix = warehouse_base_name + "/" + user_id + "/" + video_id + "/" + file
        download_from_s3_to_local(s3_client, remote_prefix, local_path)
    return {"status": "success", "message": "All files downloaded successfully"}


def download_subtitling_files_from_s3(s3_client: boto3.client, shorts_config: KlippersShortsConfig, user_id: str, video_id: str):
    pass
    file_names = [
        "ai_cost_total.json"
    ]


    subtitle_configuration_count = len(shorts_config.config_json.subtitle_application.subtitle_configuration) + 1
    video_with_subtitles = [
        f"videos-cropped-stacked/segment_{i}_with_subtitles.mp4" for i in range(1, subtitle_configuration_count )
    ]
    ass_files = [
        f"videos-cropped-stacked/segment_{i}.ass" for i in range(1, subtitle_configuration_count )
    ]
    ass_styled_files = [
        f"videos-cropped-stacked/segment_{i}.ass.styled.ass" for i in range(1, subtitle_configuration_count )
    ]
    subtitle_jsons = [
        f"videos-cropped-stacked/segment_{i}.subtitle.json" for i in range(1, subtitle_configuration_count )
    ]
    
    dialogue_files = [
        f"videos-cropped-stacked/segment_{i}_dialogue.txt" for i in range(1, subtitle_configuration_count )
    ]

    all_files = file_names + video_with_subtitles + ass_files + ass_styled_files + subtitle_jsons + dialogue_files

    create_local_directory(settings.VIDEO_WAREHOUSE_ROOT_DIR + "/" + user_id + "/" + video_id+"/videos-cropped-stacked")
    warehouse_base_name = settings.VIDEO_WAREHOUSE_ROOT_DIR.split("/")[-1]
    for file in all_files:
        local_path = settings.VIDEO_WAREHOUSE_ROOT_DIR + "/" + user_id + "/" + video_id + "/" + file
        remote_prefix = warehouse_base_name + "/" + user_id + "/" + video_id + "/" + file
        download_from_s3_to_local(s3_client, remote_prefix, local_path)
    return {"status": "success", "message": "All files downloaded successfully"}


def download_genshorts_files_from_s3(s3_client: boto3.client, shorts_config: KlippersShortsConfig, user_id: str, video_id: str):
    """
    Download all video-related files from S3 to local storage.
    
    Args:
        s3_client: The S3 client
        shorts_config: The shorts configuration
        user_id: The user ID
        video_id: The video ID
        
    Returns:
        dict: Status response with success or error message
    """
    
    
    file_names = [
        "important_segments_videos.json",
        "ai_cost_total.json",
        "klippers.stderr",
        "klippers.stdout",
    ]
    video_with_subtitles = [
        f"videos-cropped-stacked/segment_{i}_with_subtitles.mp4" for i in range(1, shorts_config.get_segment_count() + 1)
    ]
    video_infos = [
        f"videos-cropped-stacked/segment_{i}.info.json" for i in range(1, shorts_config.get_segment_count() + 1)
    ]
    video_dialogues = [
        f"videos-cropped-stacked/segment_{i}_dialogue.txt" for i in range(1, shorts_config.get_segment_count() + 1)
    ]
    create_local_directory(settings.VIDEO_WAREHOUSE_ROOT_DIR + "/" + user_id + "/" + video_id+"/videos-cropped-stacked")
    warehouse_base_name = settings.VIDEO_WAREHOUSE_ROOT_DIR.split("/")[-1]
    all_files = file_names + video_with_subtitles + video_infos + video_dialogues
    for file in all_files:
        local_path = settings.VIDEO_WAREHOUSE_ROOT_DIR + "/" + user_id + "/" + video_id + "/" + file
        remote_prefix = warehouse_base_name + "/" + user_id + "/" + video_id + "/" + file
        download_from_s3_to_local(s3_client, remote_prefix, local_path)

    return {"status": "success", "message": "All files downloaded successfully"}

@router.post("/message/frgt/{roomId}/{clientId}/{token}")
async def post_message_fargate(
    chat_message: ChatMessage, roomId: str, clientId: str, token: str, db: Session = Depends(get_db)):
    """
    Handles posting of a new message to the chat via REST API.
    The message is sent to an LLM and the reply is broadcasted back to the chat room.
    """

    print ("post_message_fargate:token:", token)
    print ("post_message_fargate:chat_message:", chat_message)

    if token != settings.FARGATE_TOKEN:
        return {"status": "error", "message": "Invalid token"}

    if chat_message.message.startswith("7___"):
        video_id = roomId
        user_id = chat_message.clientId.replace("-"+video_id, "").replace("bot-", "")
        time.sleep(2)
        download_video_files_from_s3(user_id, video_id)
    received_message = await post_message(chat_message, roomId, clientId, db)
    return received_message



async def send_existing_last_message_to_websocket(roomId: str, ws_conn: WSConnection):
    """
    Fetches the most recent message from Redis for the given roomId and sends it
    to the websocket connection by queuing it in the connection's message queue.
    
    Args:
        roomId: The room ID to fetch the message for
        ws_conn: The WebSocket connection object with a queue to send messages to
    """
    try:
        # Connect to Redis
        redis_client = get_redis_client()
        
        # Get the room-specific queue name
        room_queue_name = f"{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}:{roomId}"
        
        # Get the last message from the queue (index -1 gets the most recent)
        # LINDEX gets an element from the list without popping
        message_str = redis_client.lindex(room_queue_name, -1)
        
        redis_client.close()
        
        if not message_str:
            print(f"No existing messages found in Redis for roomId '{roomId}'", flush=True)
            return
        
        print(f"Found most recent message in Redis for roomId '{roomId}', sending to websocket client", flush=True)
        
        # Parse JSON string and convert to message dict, then queue it
        try:
            message_data = json.loads(message_str)
            
            # Format the message in the same way as redis_message_dispatcher does
            message_json = json.dumps({
                "kind": message_data.get("kind", "video-process-message"),
                "clientId": message_data.get("clientId", ""),
                "message": message_data.get("message", ""),
                "timestamp": message_data.get("timestamp", ""),
                "roomId": message_data.get("roomId", roomId)
            })
            
            # Queue the message to be sent to the websocket client
            await ws_conn.queue.put(message_json)
            print(f"Queued most recent message for client {ws_conn.clientId} in room {roomId}: {message_data.get('message', '')[:50]}...", flush=True)
            
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            # Skip invalid messages (invalid JSON or invalid message structure)
            print(f"Failed to parse existing message or create message dict: {e}", flush=True)
            return
        
        print(f"Finished sending most recent message to websocket client {ws_conn.clientId}", flush=True)
        
    except redis.ConnectionError as e:
        print(f"Redis connection error while fetching most recent message: {e}", flush=True)
        traceback.print_exc()
        # Don't raise - just log the error and continue with websocket connection
    except redis.RedisError as e:
        print(f"Redis error while fetching most recent message: {e}", flush=True)
        traceback.print_exc()
        # Don't raise - just log the error and continue with websocket connection
    except Exception as e:
        print(f"Unexpected error while fetching most recent message: {e}", flush=True)
        traceback.print_exc()
        # Don't raise - just log the error and continue with websocket connection



async def send_existing_messages_to_websocket(roomId: str, ws_conn: WSConnection):
    """
    Fetches all existing messages from Redis for the given roomId and sends them
    to the websocket connection by queuing them in the connection's message queue.
    
    Args:
        roomId: The room ID to fetch messages for
        ws_conn: The WebSocket connection object with a queue to send messages to
    """
    try:
        # Connect to Redis
        redis_client = get_redis_client()
        
        # Get all messages from the room-specific queue without removing them
        room_queue_name = f"{settings.REDIS_VIDEO_PROCESS_QUEUE_NAME}:{roomId}"
        
        # Get all messages from the queue (without removing them)
        # LRANGE gets elements from the list without popping
        message_strings = redis_client.lrange(room_queue_name, 0, -1)
        
        redis_client.close()
        
        if not message_strings:
            print(f"No existing messages found in Redis for roomId '{roomId}'", flush=True)
            return
        
        print(f"Found {len(message_strings)} existing messages in Redis for roomId '{roomId}', sending to websocket client", flush=True)
        
        # Parse JSON strings and convert to message dicts, then queue them
        for message_str in message_strings:
            try:
                message_data = json.loads(message_str)
                
                # Format the message in the same way as redis_message_dispatcher does
                message_json = json.dumps({
                    "kind": message_data.get("kind", "video-process-message"),
                    "clientId": message_data.get("clientId", ""),
                    "message": message_data.get("message", ""),
                    "timestamp": message_data.get("timestamp", ""),
                    "roomId": message_data.get("roomId", roomId)
                })
                
                # Queue the message to be sent to the websocket client
                await ws_conn.queue.put(message_json)
                print(f"Queued existing message for client {ws_conn.clientId} in room {roomId}: {message_data.get('message', '')[:50]}...", flush=True)
                
            except (json.JSONDecodeError, ValueError, TypeError) as e:
                # Skip invalid messages (invalid JSON or invalid message structure)
                print(f"Failed to parse existing message or create message dict: {e}", flush=True)
                continue
        
        print(f"Finished sending {len(message_strings)} existing messages to websocket client {ws_conn.clientId}", flush=True)
        
    except redis.ConnectionError as e:
        print(f"Redis connection error while fetching existing messages: {e}", flush=True)
        traceback.print_exc()
        # Don't raise - just log the error and continue with websocket connection
    except redis.RedisError as e:
        print(f"Redis error while fetching existing messages: {e}", flush=True)
        traceback.print_exc()
        # Don't raise - just log the error and continue with websocket connection
    except Exception as e:
        print(f"Unexpected error while fetching existing messages: {e}", flush=True)
        traceback.print_exc()
        # Don't raise - just log the error and continue with websocket connection


@router.websocket("/ws/{roomId}/{clientId}")
async def websocket_endpoint(websocket: WebSocket, roomId: str, clientId: str):
    """
    Handles WebSocket connections for the chat room.

    Upon connection, it assigns a unique ID, sends chat history, and then
    concurrently manages receiving messages from the client and sending
    messages back to the client via its dedicated message queue.
    """
    print("halil:debug:websocket_endpoint:", roomId, clientId)
    await websocket.accept()
    if roomId not in active_connections:
        active_connections[roomId] = {}

    ws_conn = WSConnection(websocket=websocket, queue=asyncio.Queue(), clientId=clientId, roomId=roomId)
    active_connections[roomId][clientId] = ws_conn
    print(f"Client {clientId} connected to room {roomId}.")
    
    # Fetch and send existing messages from Redis to the new websocket connection
    # await send_existing_messages_to_websocket(roomId, ws_conn)
    await send_existing_last_message_to_websocket(roomId, ws_conn)

    # Connection state management
    connection_active = True
    connection_lock = asyncio.Lock()

    def is_connection_active_sync():
        """Check if connection flag is active (synchronous check)."""
        return connection_active

    async def check_websocket_alive():
        """Check if the WebSocket is still alive by attempting a ping."""
        try:
            await websocket.send_json({"kind": "ping"})
            return True
        except Exception:
            return False

    async def send_messages():
        """Task to send messages from the queue to the client."""
        try:
            while True:
                # Check connection state before waiting for message
                if not is_connection_active_sync():
                    print(f"Send task: Connection not active for client {clientId}, exiting")
                    break

                try:
                    # Use timeout to avoid hanging indefinitely
                    message_to_send = await asyncio.wait_for(ws_conn.queue.get(), timeout=5.0)
                except asyncio.TimeoutError:
                    continue  # Check connection again

                if type(message_to_send) == str:
                    message_to_send = json.loads(message_to_send)

                # Send the message
                try:
                    await websocket.send_json(message_to_send)
                except Exception as e:
                    print(f"Send task: Failed to send message to client {clientId}: {e}")
                    break

        except WebSocketDisconnect:
            print(f"Send task: Client {clientId} disconnected from room {roomId}.")
        except asyncio.CancelledError:
            print(f"Send task: Cancelled for client {clientId}")
            raise
        except Exception as e:
            print(f"Send task error for client {clientId}: {e}")
        finally:
            # Mark connection as inactive
            async with connection_lock:
                nonlocal connection_active
                connection_active = False

    async def receive_messages():
        """Task to receive messages from the client."""
        try:
            while True:
                # Check connection state before receiving
                if not is_connection_active_sync():
                    print(f"Receive task: Connection not active for client {clientId}, exiting")
                    break

                try:
                    # Receive message from client - this will block until message arrives or disconnect
                    data = await websocket.receive_json()
                    print(f"Received message from client {clientId}: {data}")
                    # You can process incoming messages here if needed
                except asyncio.TimeoutError:
                    continue  # This is normal, just check connection again

        except WebSocketDisconnect as e:
            print(f"Receive task: Client {clientId} disconnected from room {roomId}. Reason: {e}")
        except asyncio.CancelledError:
            print(f"Receive task: Cancelled for client {clientId}")
            raise
        except Exception as e:
            print(f"Receive task error for client {clientId}: {e}")
        finally:
            # Mark connection as inactive
            async with connection_lock:
                nonlocal connection_active
                connection_active = False

    async def heartbeat():
        """Task to send periodic heartbeat to keep connection alive."""
        try:
            while True:
                # Check connection state before sleeping
                if not is_connection_active_sync():
                    print(f"Heartbeat task: Connection not active for client {clientId}, exiting")
                    break

                await asyncio.sleep(30)  # Send heartbeat every 30 seconds

                # Check connection again before sending heartbeat
                if is_connection_active_sync():
                    try:
                        await websocket.send_json({"kind": "heartbeat", "timestamp": str(asyncio.get_event_loop().time())})
                    except Exception as e:
                        print(f"Heartbeat task: Failed to send heartbeat to client {clientId}: {e}")
                        break
                else:
                    print(f"Heartbeat task: Connection inactive for client {clientId}, stopping heartbeat")
                    break

        except WebSocketDisconnect as e:
            print(f"Heartbeat task: Client {clientId} disconnected from room {roomId}. Reason: {e}")
        except asyncio.CancelledError:
            print(f"Heartbeat task: Cancelled for client {clientId}")
            raise
        except Exception as e:
            print(f"Heartbeat task error for client {clientId}: {e}")
        finally:
            # Mark connection as inactive
            async with connection_lock:
                nonlocal connection_active
                connection_active = False

    # Create tasks
    send_task = asyncio.create_task(send_messages())
    receive_task = asyncio.create_task(receive_messages())
    heartbeat_task = asyncio.create_task(heartbeat())

    try:
        # Wait for any task to complete (which will happen when connection is lost)
        done, pending = await asyncio.wait(
            [send_task, receive_task, heartbeat_task],
            return_when=asyncio.FIRST_COMPLETED
        )

        # Log which task completed first for debugging
        for task in done:
            task_name = "unknown"
            if task == send_task:
                task_name = "send_task"
            elif task == receive_task:
                task_name = "receive_task"
            elif task == heartbeat_task:
                task_name = "heartbeat_task"
            print(f"First completed task for client {clientId}: {task_name}")

        # Cancel remaining tasks
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        # Check for exceptions in completed tasks
        for task in done:
            try:
                await task
            except Exception as e:
                print(f"Task completed with exception for client {clientId}: {e}")

    except Exception as e:
        print(f"An error occurred with client {clientId}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean up connection
        if roomId in active_connections and clientId in active_connections[roomId]:
            del active_connections[roomId][clientId]
            if not active_connections[roomId]:
                del active_connections[roomId]
        print(f"Resources for client {clientId} in room {roomId} cleaned up.")
