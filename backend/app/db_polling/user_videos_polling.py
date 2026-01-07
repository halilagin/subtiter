# from datetime import time
# flake8: noqa: E501
from datetime import datetime
import time
import uuid
import os
import logging
# import app.config as appConfig
from app.db.database import SessionLocal
from app.config import settings
from app.db.model_document import UserVideo, UserVideoStatus
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import subprocess
import json

# --- Configure Logging for the Email Thread ---
log_file_name = 'user_videos_polling.log'
logger = logging.getLogger('UserVideosPollingLogger')
logger.setLevel(logging.INFO)  # Set the minimum level to log

# Prevent adding multiple handlers if this module is reloaded somehow
if not logger.hasHandlers():
    # Create a file handler to write logs to a file
    file_handler = logging.FileHandler(log_file_name)

    # Create a formatter for the log messages
    formatter = logging.Formatter('%(asctime)s - [PID:%(process)d] - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    file_handler.setFormatter(formatter)

    # Add the handler to the logger
    logger.addHandler(file_handler)
# --- End Logging Configuration ---




def run_cmd_process_video(user_video: UserVideo, simulate: bool = False):
    """
    Spawns a new shell process and executes the video processing script
    Uses proper process management to prevent defunct processes
    """
    try:
        os.makedirs(f"{os.getenv('VIDEO_WAREHOUSE_ROOT_DIR')}/{user_video.user_id}/{user_video.video_id}", exist_ok=True)

        # Use appropriate script based on RUN_SUBTITERCMD_ON setting
        # Local: uses SUBTITER_RUN_SCRIPT (e.g., run_on_uploaded.sh.prod.sh for local execution)
        # Fargate: uses SUBTITER_RUN_SCRIPT_FARGATE (e.g., run_state_machine.sh for AWS execution)
        print(f"RUN_SUBTITERCMD_ON: {settings.RUN_SUBTITERCMD_ON}")
        if settings.RUN_SUBTITERCMD_ON == "fargate":
            cmd_client_path = settings.SUBTITER_RUN_SCRIPT_FARGATE
        else:
            cmd_client_path = settings.SUBTITER_RUN_SCRIPT
        
        command = ["/bin/bash", cmd_client_path]
        
        input_env = os.environ.copy()
        input_env["MOCK_PROCESS"] = "true" if simulate else "false"
        input_env["USER_ID"] = user_video.user_id
        input_env["VIDEO_ID"] = user_video.video_id
        input_env["CHAT_ROOM_ID"] = input_env.get("VIDEO_ID","room-1")
        
        # Create file paths for stdout/stderr
        stdout_path = f"{os.getenv('VIDEO_WAREHOUSE_ROOT_DIR')}/{user_video.user_id}/{user_video.video_id}/subtiter.stdout"
        stderr_path = f"{os.getenv('VIDEO_WAREHOUSE_ROOT_DIR')}/{user_video.user_id}/{user_video.video_id}/subtiter.stderr"
        
        print(f"Running command: {command}")
        
        
        # Determine working directory - use script directory as cwd
        working_dir = os.path.dirname(cmd_client_path)
        logger.info(f"Using working directory: {working_dir}")
        
        # Execute the command in the background - open files and start process immediately
        config_json = user_video.config_json
        config_json["env"] = input_env 
        config_json = estimate_short_number_and_durations(config_json)

        save_config_json(user_video.user_id, user_video.video_id, config_json)



        process = subprocess.Popen(
            command,
            text=True,
            cwd=working_dir,
            env=input_env,
            start_new_session=True,  # Start in new session to prevent signal propagation
            # preexec_fn=os.setsid if hasattr(os, 'setsid') else None  # Create new process group
        )
        logger.info(f"Process started in background with PID: {process.pid}")
        logger.info(f"Process stdout: {stdout_path}")
        logger.info(f"Process stderr: {stderr_path}")
        
        return True
    except Exception as e:
        logger.error(f"Error running command: {e}")
        return False




def assign_video_duration_category(original_video_duration_in_seconds: float) -> str:
    """
    Assigns a video duration category based on the video length in seconds.
    
    Args:
        original_video_duration_in_seconds: Duration of the video in seconds
        
    Returns:
        Category name as string (e.g., "0-10-minutes", "10-20-minutes", etc.)
    """
    # Define video duration categories with upper bounds in seconds
    video_duration_category_list = [
        ("0-10-minutes", 600),
        ("10-20-minutes", 1200),
        ("20-30-minutes", 1800),
        ("30-40-minutes", 2400),
        ("40+-minutes", float('inf'))  # For videos longer than 40 minutes
    ]
    
    # Assign category based on video duration
    video_duration_category = "0-10-minutes"  # Default for very short videos
    for category_name, max_duration in video_duration_category_list:
        if original_video_duration_in_seconds <= max_duration:
            video_duration_category = category_name
            break
    
    return video_duration_category



def ai_detect_segment_count(video_duration_category: str, config_json: dict) -> dict:
    """
    Detects the number of segments for the video using AI.
    """
    # config_json["video_duration_category"] = video_duration_category
    pass

def ai_detect_target_short_video_duration( video_duration_category: str, config_json: dict) -> dict:
    pass

def find_target_short_duration_category(original_video_duration_in_seconds: float, segment_count: int) -> int:
    """
    Finds the appropriate short video duration category based on the average duration per segment.
    
    Args:
        original_video_duration_in_seconds: Total duration of the original video in seconds
        segment_count: Number of segments to divide the video into
        
    Returns:
        The target short video duration in seconds (30, 60, 120, or 150), or None if no suitable category is found
    """
    short_duration_categories_in_seconds = [30, 60, 120, 150]
    short_duration = original_video_duration_in_seconds // segment_count
    found_category = 150
    for idx, short_duration_in_seconds in enumerate(short_duration_categories_in_seconds):
        if short_duration_in_seconds > short_duration:
            if idx == 0:
                found_category = short_duration_categories_in_seconds[0]
                break
            found_category = short_duration_categories_in_seconds[idx-1]
            break
    
    return found_category

def estimate_short_number_and_durations(config_json: dict) -> dict:
    segment_count = config_json["config_json"]["segment_count"] # -1 for auto-detection
    target_short_video_duration_in_seconds = config_json["config_json"]["target_short_video_duration_in_seconds"] # 0.5, 1, 2, 2.5 minutes, -1 for auto-detection
    original_video_duration_in_seconds = config_json["config_json"]["original_video_duration_in_seconds"]

    # Assign video duration category
    video_duration_category = assign_video_duration_category(original_video_duration_in_seconds)
    config_json["config_json"]["video_duration_category"] = video_duration_category

    if segment_count == -1 and target_short_video_duration_in_seconds == -1:
        # make both with ai
        if video_duration_category == "0-10-minutes":
            config_json["config_json"]["target_short_video_duration_in_seconds"] = 60
            short_limit =original_video_duration_in_seconds // 60
            short_limit = min(short_limit, 5)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "10-20-minutes":
            config_json["config_json"]["target_short_video_duration_in_seconds"] = 60
            short_limit =original_video_duration_in_seconds // 60
            short_limit = min(short_limit, 5)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "20-30-minutes":
            config_json["config_json"]["target_short_video_duration_in_seconds"] = 60
            short_limit =original_video_duration_in_seconds // 60
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "30-40-minutes":
            config_json["config_json"]["target_short_video_duration_in_seconds"] = 60
            short_limit =original_video_duration_in_seconds // 60
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "40+-minutes":
            config_json["config_json"]["target_short_video_duration_in_seconds"] = 60
            short_limit =original_video_duration_in_seconds // 60
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        else:
            config_json["config_json"]["target_short_video_duration_in_seconds"] = 60
            short_limit =original_video_duration_in_seconds // 60
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        

    if segment_count == -1 and target_short_video_duration_in_seconds != -1:
        # ai detects the segment count: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
        if video_duration_category == "0-10-minutes":
            short_limit =original_video_duration_in_seconds // target_short_video_duration_in_seconds
            short_limit = min(short_limit, 5)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "10-20-minutes":
            short_limit =original_video_duration_in_seconds // target_short_video_duration_in_seconds
            short_limit = min(short_limit, 5)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "20-30-minutes":
            
            short_limit =original_video_duration_in_seconds // target_short_video_duration_in_seconds
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "30-40-minutes":
            
            short_limit =original_video_duration_in_seconds // target_short_video_duration_in_seconds
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        elif video_duration_category == "40+-minutes":
            short_limit =original_video_duration_in_seconds // target_short_video_duration_in_seconds
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        else:
            short_limit =original_video_duration_in_seconds // target_short_video_duration_in_seconds
            short_limit = min(short_limit, 10)
            config_json["config_json"]["segment_count"] = short_limit
        

    if segment_count != -1 and target_short_video_duration_in_seconds == -1:
        # ai detects the target short video duration: 0.5, 1, 2, 2.5 minutes
        found_category = find_target_short_duration_category(original_video_duration_in_seconds, segment_count)
        config_json["config_json"]["target_short_video_duration_in_seconds"] = found_category
            
            
        

    if segment_count == -1 and target_short_video_duration_in_seconds != -1:
        # no need of ai
        pass




    
    return config_json


def save_config_json(user_id:str, video_id:str, config_json: dict):


    if config_json is not None:
        config_json_path = f"{os.getenv('VIDEO_WAREHOUSE_ROOT_DIR')}/{user_id}/{video_id}/shorts_config.json"
        os.makedirs(os.path.dirname(config_json_path), exist_ok=True)
        logger.info(f"Saving config json to {config_json_path}")
        with open(config_json_path, "w") as f:
            json.dump(config_json, f)
        logger.info(f"Saved config json to {config_json_path}")

def process_user_video(user_video: UserVideo, simulate: bool = False):
    """
    Record stripe metered usage for a document

    Args:
        db: Database session
        document_id: ID of the document
        user_email: Email of the user
        quantity: Number of units to record (default 1)
    """
    
    run_cmd_process_video(user_video, simulate=simulate)




def process_user_videos_in_batches(db: Session=None):
    """
    Send emails to signers in batches with explicit DB session
    """
    logger.info(f"Process {os.getpid()} - Attempting to sign the pdfs...")
    # Create a new DB session explicitly
    if db is None:
        db = SessionLocal()
    try:
        # Set the session on DocumentDAO
        
        unprocessed_user_videos = db.query(UserVideo).filter(UserVideo.status == UserVideoStatus.UPLOADED.value).all()
        logger.info(f"Found {len(unprocessed_user_videos)} user videos to process.")
        for index, user_video in enumerate(unprocessed_user_videos):
            if index == 0:
                logger.info(f" Process {os.getpid()} - Attempting to process the user video for user_id: {user_video.user_id} and video_id: {user_video.video_id}...")
            try:
                process_user_video(user_video)
            except Exception as e:
                logger.error(f"An unexpected error occurred in stripe document meter loop: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"An unexpected error occurred in user videos polling loop: {e}", exc_info=True)
    finally:
        # Always close the DB session

        db.close()


def poll_user_videos_loop(interval_seconds: int):
    """
    Periodically sends a test email using credentials from environment variables.
    Logs output to the 'EmailThreadLogger'.
    """
    process_id = os.getpid()
    while True:
        logger.info(f"Process {process_id} checking for documents to send email for view of signed document...")
        process_user_videos_in_batches()
        time.sleep(interval_seconds)

# Example Usage (Update credentials for Gmail)
if __name__ == "__main__":
    load_dotenv()
    logger.info(f"Starting user videos polling batch process...")
    process_user_videos_in_batches()
    logger.info(f"User videos polling batch process finished.")