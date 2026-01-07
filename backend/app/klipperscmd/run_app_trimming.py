#!/usr/bin/env python
# -*- coding: utf-8 -*-
# flake8: noqa: E501
import json
import os
import subprocess
import sys
import time
import logging
from datetime import datetime



from clippercmd.chat_cli import _send_message
from config import settings, get_shorts_config
from clippercmd.model.short_config_model import KlippersShortsConfig, TrimConfiguration
from config import settings
from clippercmd.utils import _run_ffmpeg

webapp_api_url = f'http://{settings.WEBAPP_API_HOST}:{settings.WEBAPP_API_PORT}'


def run_step(func, message, *args, **kwargs):
    config = get_shorts_config()
    logging.info(message)
    if config.get_send_chat() and "chat_message" in kwargs:
        try:
            _send_message(
                message=kwargs["chat_message"],
                room_id=config.get_chat_room_id(),
                client_id=f"bot-{config.get_user_video_id()}",
                url=webapp_api_url,
                is_testing=False,
                conversation_id=None,
                verbose=False
            )
        except Exception as e:
            logging.error(f"Failed to send chat message: {e}")
    
    chat_message = kwargs.pop("chat_message", None)
    db_status = kwargs.pop("db_status", None)

    if config.get_mock_process():
        time.sleep(1)
        logging.info(f"Mocking step: {func.__name__}")
    else:
        try:
            func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Error in step {func.__name__}: {e}", exc_info=True)
            sys.exit(1)
    
    

def _run_ffmpeg_command(input_video_path: str, segment_number: int, trim_configuration: TrimConfiguration):
    print(f"Running ffmpeg command for segment {segment_number} with configuration {trim_configuration}")
    config = get_shorts_config()
    output_video_path = config.get_videos_cropped_stacked_dir_path()+"/"+f"segment_{segment_number}.trimmed.mp4"
    output_json_path = config.get_videos_cropped_stacked_dir_path()+"/"+f"segment_{segment_number}.trimmed.json"
    ffmpeg_command = [
        "ffmpeg",
        "-i", input_video_path,
        "-ss", str(trim_configuration.trim_start_in_seconds),
        "-to", str(trim_configuration.trim_end_in_seconds),
        output_video_path
    ]
    _run_ffmpeg(ffmpeg_command, f"Trimming video for segment {segment_number} with configuration {trim_configuration}")
    with open(output_json_path, "w") as f:
        json.dump(trim_configuration.model_dump(), f)



def _trim_video(segment_number: int, input_video_path: str, output_video_path: str, config: KlippersShortsConfig, trim_configuration: TrimConfiguration):
    print(f"Trimming video for segment {segment_number} with configuration {trim_configuration}")
    _run_ffmpeg_command(input_video_path, segment_number, trim_configuration)


def run_video_processing_wholistic():
    # Add the parent directory to the python path to allow imports from clippercmd
    # sys.path.append(str(Path(__file__).parent))
    config: KlippersShortsConfig = get_shorts_config()  # type: ignore  
    
    # print(config)

    start_time = time.time()
    logging.info("=== Starting video processing script ===")
    logging.info(f"Script started at: {start_time}")
    logging.info(f"Working directory: {os.getcwd()}")
    logging.info(f"Script path: {__file__}")
    logging.info("=== Configuration ===")
    logging.info(f"USER_ID: {config.get_user_id()}")
    logging.info(f"VIDEO_ID: {config.get_video_id()}")
    logging.info(f"USER_VIDEO_ID: {config.get_user_video_id()}")
    logging.info(f"VIDEO_WAREHOUSE_ROOT_DIR: {config.get_root_dir()}")
    logging.info(f"INPUT_VIDEO: {config.get_input_video_path()}")
    logging.info(f"CHAT_ROOM_ID: {config.get_chat_room_id()}")
    logging.info(f"SEGMENT_COUNT: {config.get_segment_count()}")
    logging.info(f"IS_FARGATE_TASK: {config.config_json.is_fargate_task}")
    logging.info(f"S3_BUCKET_NAME: {config.get_s3_bucket_name()}")
     

    

    # --- Processing Steps ---

    
    # Create output directory if it doesn't exist
    output_dir = config.get_videos_cropped_stacked_dir_path()
    os.makedirs(output_dir, exist_ok=True)
    
    _send_message(message="3___Trimming video", room_id=config.get_chat_room_id(), client_id=f"bot-{config.get_user_video_id()}", url=webapp_api_url, is_testing=False, conversation_id=None, verbose=False)

    for idx,trim_configuration in enumerate(config.config_json.trim_application.trim_configurations    ):
        output_file = config.get_videos_cropped_stacked_dir_path()+"/"+f"segment_{idx+1}.trimmed.mp4"
        _trim_video(idx+1, config.get_input_video_path(), output_file, config, trim_configuration)
    

    # send chat message if running locally
    if config.env["RUN_KLIPPERSCMD_ON"] == "local":
        _send_message(message="7___Video processing completed", room_id=config.get_chat_room_id(), client_id=f"bot-{config.get_user_video_id()}", url=webapp_api_url, is_testing=False, conversation_id=None, verbose=False)
    
    end_time = time.time()
    logging.info("=== Finished video processing script ===")
    logging.info(f"Script completed at: {datetime.now()}")
    logging.info(f"Script took: {end_time - start_time:.2f} seconds")








def run_video_processing():
    run_video_processing_wholistic()
    



def print_config(config: KlippersShortsConfig):
    print("input_video_path", config.get_input_video_path())
    print("videos_cropped_stacked_dir_path", config.get_videos_cropped_stacked_dir_path())
    print("segment_count", config.get_segment_count())
    print("is_fargate_task", config.config_json.is_fargate_task)
    print("s3_bucket_name", config.get_s3_bucket_name())

def main():
    # print("main")
    # config: KlippersShortsConfig = get_shorts_config()  # type: ignore  
    # print_config(config)
    run_video_processing()


if __name__ == "__main__":
    try:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        main()
    except Exception:
        logging.error("An unhandled exception occurred", exc_info=True)
        sys.exit(1)
