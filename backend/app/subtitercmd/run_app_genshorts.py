#!/usr/bin/env python
# -*- coding: utf-8 -*-
# flake8: noqa: E501
import os
import sys
from pathlib import Path
import json
import time
import logging
from datetime import datetime
import click
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor



from clippercmd.chat_cli import _send_message
from clippercmd.extract_audio import _extract_audio
from clippercmd.transcribe import _transcribe_audio_file
from clippercmd.convert_srt_to_txt import _convert_srt_to_txt
from clippercmd.important_segments import _important_segments
from clippercmd.extract_video_segments import _extract_video_segments
from clippercmd.crop_and_stack import _crop_and_stack
from clippercmd.transcribe_word_level_ass import _transcribe_word_level_ass
from clippercmd.embed_subtitles import _embed_subtitles
from clippercmd.generate_segment_info_json import _generate_segment_info_json
from config import settings, get_shorts_config
from clippercmd.model.short_config_model import SubtiterShortsConfig

from config import settings

import boto3


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
    
    

def process_segment(segment_number, config: SubtiterShortsConfig):
    run_step(_crop_and_stack, f"Cropping and stacking segment {segment_number}", segment_number=segment_number)
    
    videos_cropped_stacked_dir = Path(config.get_videos_cropped_stacked_dir_path())
    video_file = videos_cropped_stacked_dir / f"segment_{segment_number}.mp4"
    audio_file_for_subs = videos_cropped_stacked_dir / f"segment_{segment_number}.mp4_clips" / "extracted_audio.m4a" # Path from shell script
    ass_file = videos_cropped_stacked_dir / f"segment_{segment_number}.ass"

    run_step(_transcribe_word_level_ass, f"Transcribing word-level ASS for segment {segment_number}", str(audio_file_for_subs), str(ass_file), 4, config.config_json.subtitle_application.subtitle_configuration[0])
    run_step(_embed_subtitles, f"Embedding subtitles for segment {segment_number}", segment_number, config)
    run_step(_generate_segment_info_json, f"Generating segment info for segment {segment_number}", str(video_file))



# not used now
def make_files_local():
    config: SubtiterShortsConfig = get_shorts_config() 
    s3_client = boto3.client('s3')
    s3_warehouse_prefix = os.getenv("S3_WAREHOUSE_PREFIX")
    if not s3_warehouse_prefix:
        raise ValueError("S3_WAREHOUSE_PREFIX environment variable not set")

    remote_video_path = f"{s3_warehouse_prefix}/{config.get_user_id()}/{config.get_video_id()}/original.mp4"
    remote_shorts_config_path = f"{s3_warehouse_prefix}/{config.get_user_id()}/{config.get_video_id()}/shorts_config.json"
    remote_thumbnail_path = f"{s3_warehouse_prefix}/{config.get_user_id()}/{config.get_video_id()}/thumbnail.png"
    
    s3_client.download_file(config.get_s3_bucket_name(), remote_video_path, config.get_input_video_path())
    s3_client.download_file(config.get_s3_bucket_name(), remote_shorts_config_path, config.get_shorts_config_path())
    s3_client.download_file(config.get_s3_bucket_name(), remote_thumbnail_path, config.get_thumbnail_path())
     

def run_video_processing_wholistic():
    # Add the parent directory to the python path to allow imports from clippercmd
    # sys.path.append(str(Path(__file__).parent))
    config: SubtiterShortsConfig = get_shorts_config()  # type: ignore  
    
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

    
    # # Extract audio
    run_step(_extract_audio, "Extracting audio", str(config.get_input_video_path()), str(config.get_audio_file_path()), chat_message="1___Extracting audio", db_status="extracted-audio")

    # # # # # # Transcribe
    run_step(_transcribe_audio_file, "Transcripting audio", str(config.get_audio_file_path()), str(config.get_srt_file_path()), settings, chat_message="2___Transcripting audio", db_status="transcribed")

    # # # # Convert SRT to TXT
    run_step(_convert_srt_to_txt, "Working on subtitles", str(config.get_srt_file_path()), str(config.get_txt_file_path()), chat_message="3___Working on subtitles", db_status="converted-srt-to-txt")
    
    # # # # Important segments
    run_step(_important_segments, "Working on important parts in the video", str(config.get_srt_file_path()), str(config.get_important_segments_json_file_path()), config.get_segment_count(), config.get_target_short_video_length(), settings, chat_message="4___Working on important parts in the video", db_status="important-segments-extracted")
    
    # # # # # Extract Video Segments
    run_step(_extract_video_segments, "Working on video segments", str(config.get_input_video_path()), str(config.get_important_segments_json_file_path()),  str(config.get_srt_file_path()), str(config.get_important_segments_video_dir_path()), chat_message="5___Working on video segments", db_status="video-segments-extracted")

    # # # # # Crop and Stack Videos
    
    _send_message(message="6___Preparing the short videos", room_id=config.get_chat_room_id(), client_id=f"bot-{config.get_user_video_id()}", url=webapp_api_url, is_testing=False, conversation_id=None, verbose=False)

    # Use ProcessPoolExecutor for CPU-bound tasks. Limit workers to a reasonable number.
    max_workers = config.get_segment_count()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        executor.map(lambda seg_num: process_segment(seg_num, config), range(1, config.get_segment_count() + 1))


    # process_segment(1, config)
    



    if config.env["RUN_SUBTITERCMD_ON"] == "local":
        _send_message(message="7___Video processing completed", room_id=config.get_chat_room_id(), client_id=f"bot-{config.get_user_video_id()}", url=webapp_api_url, is_testing=False, conversation_id=None, verbose=False)
    
    
    end_time = time.time()
    logging.info("=== Finished video processing script ===")
    logging.info(f"Script completed at: {datetime.now()}")
    logging.info(f"Script took: {end_time - start_time:.2f} seconds")




def run_video_processing_parent():
    # Add the parent directory to the python path to allow imports from clippercmd
    # sys.path.append(str(Path(__file__).parent))
    config: SubtiterShortsConfig = get_shorts_config()  # type: ignore  
    
    # print(config)

    start_time = time.time()
    logging.info("=== Starting video processing script (PARENT) ===")
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

    
    # Extract audio
    run_step(_extract_audio, "Extracting audio", str(config.get_input_video_path()), str(config.get_audio_file_path()), chat_message="1___Extracting audio", db_status="extracted-audio")

    # # Transcribe
    run_step(_transcribe_audio_file, "Transcripting audio", str(config.get_audio_file_path()), str(config.get_srt_file_path()), settings, chat_message="2___Transcripting audio", db_status="transcribed")

    # # Convert SRT to TXT
    run_step(_convert_srt_to_txt, "Working on subtitles", str(config.get_srt_file_path()), str(config.get_txt_file_path()), chat_message="3___Working on subtitles", db_status="converted-srt-to-txt")
    
    # Important segments
    run_step(_important_segments, "Working on important parts in the video", str(config.get_srt_file_path()), str(config.get_important_segments_json_file_path()), config.get_segment_count(), config.get_target_short_video_length(), settings, chat_message="4___Working on important parts in the video", db_status="important-segments-extracted")
    
    # Extract Video Segments
    run_step(_extract_video_segments, "Working on video segments", str(config.get_input_video_path()), str(config.get_important_segments_json_file_path()),  str(config.get_srt_file_path()), str(config.get_important_segments_video_dir_path()), chat_message="5___Working on video segments", db_status="video-segments-extracted")

    # Crop and Stack Videos
    
    _send_message(message="6___Preparing the short videos", room_id=config.get_chat_room_id(), client_id=f"bot-{config.get_user_video_id()}", url=webapp_api_url, is_testing=False, conversation_id=None, verbose=False)

    
    
    end_time = time.time()
    logging.info("=== Finished video processing script ===")
    logging.info(f"Script completed at: {datetime.now()}")
    logging.info(f"Script took: {end_time - start_time:.2f} seconds")




def run_video_processing_child():
    # Add the parent directory to the python path to allow imports from clippercmd
    # sys.path.append(str(Path(__file__).parent))
    config: SubtiterShortsConfig = get_shorts_config()  # type: ignore  
    
    # print(config)

    start_time = time.time()
    logging.info("=== Starting video processing script (CHILD) ===")
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
     

    
    # Get segment number from environment variable
    segment_number_str = os.environ.get("SEGMENT_NUMBER")
    if not segment_number_str:
        logging.error("SEGMENT_NUMBER environment variable not set")
        sys.exit(1)
    
    try:
        segment_number = int(segment_number_str)
    except ValueError:
        logging.error(f"SEGMENT_NUMBER must be an integer, got: {segment_number_str}")
        sys.exit(1)
    
    logging.info(f"Processing segment number: {segment_number}")
    
    process_segment(segment_number, config)





    
    end_time = time.time()
    logging.info("=== Finished video processing script ===")
    logging.info(f"Script completed at: {datetime.now()}")
    logging.info(f"Script took: {end_time - start_time:.2f} seconds")




def run_video_processing():
    config: SubtiterShortsConfig = get_shorts_config()  # type: ignore  

    fargate_execution_role = os.environ.get("FARGATE_EXECUTION_ROLE", "wholistic")
    print("fargate_execution_role:", fargate_execution_role)
    if fargate_execution_role == "wholistic":
        run_video_processing_wholistic()
    elif fargate_execution_role == "parent":
        run_video_processing_parent()
    elif fargate_execution_role == "child":
        run_video_processing_child()
    










def print_config(config: SubtiterShortsConfig):
    print("input_video_path", config.get_input_video_path())
    print("audio_file_path", config.get_audio_file_path())
    print("srt_file_path", config.get_srt_file_path())
    print("txt_file_path", config.get_txt_file_path())
    print("important_segments_json_file_path", config.get_important_segments_json_file_path())
    print("important_segments_video_dir_path", config.get_important_segments_video_dir_path())
    print("videos_cropped_stacked_dir_path", config.get_videos_cropped_stacked_dir_path())
    print("segment_count", config.get_segment_count())
    print("target_short_video_length", config.get_target_short_video_length())
    print("segment_count", config.get_segment_count())
    print("language_code", config.config_json.video_language_code)
    print("video_aspect_ratio", config.config_json.video_aspect_ratio)
    print("video_type", config.config_json.video_type)
    print("video_format", config.config_json.video_format)
    print("video_resolution", config.config_json.video_resolution)
    print("dissaminate_on_social_media", config.config_json.dissaminate_on_social_media)
    print("dissaminate_on_social_media_platforms", config.config_json.dissaminate_on_social_media_platforms)
    print("cropping_reference_image_time_interval", config.config_json.cropping_reference_image_time_interval)
    print("manual_cropping", config.config_json.manual_cropping)
    print("is_fargate_task", config.config_json.is_fargate_task)
    print("s3_bucket_name", config.get_s3_bucket_name())

def main():
    print("main")
    config: SubtiterShortsConfig = get_shorts_config()  # type: ignore  
    print_config(config)
    run_video_processing()


if __name__ == "__main__":
    try:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        main()
    except Exception:
        logging.error("An unhandled exception occurred", exc_info=True)
        sys.exit(1)
