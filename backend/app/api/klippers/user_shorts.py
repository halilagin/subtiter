
# flake8: noqa: E501
import asyncio
import subprocess
import logging
from fastapi import Body, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException, Form, BackgroundTasks, Path, Request
from fastapi.responses import FileResponse, StreamingResponse
import json
import uuid
import aiofiles
import os
from pathlib import Path as FilePath
from fastapi import APIRouter
from app.config import settings
from app.db.model_document import UserVideo, UserVideoStatus, VideoProcessingApplication
from app.db.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
import mimetypes
from app.schemas.schema_klippers import SchemaUserSegmentVideoList, SchemaUserSegmentVideo, SchemaUserVideoCard, VideoAspectRatio
from typing import List
from app.db_polling.user_videos_polling import process_user_video
from app.service.klippers.subscription_plan_guard import __is_user_allowed_to_generate_shorts
from app.klipperscmd.clippercmd.model.short_config_model import ShortConfigJson, KlippersShortsConfig
from app.klipperscmd.filesystem_wrapper.filesystem_wrapper import make_file_remote
# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Ensure the logger has a handler if none exist
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler) 

router = APIRouter(prefix="/user-shorts", tags=["user_shorts"])




def _get_generated_short_videos_info(user_id: str, video_id: str) -> SchemaUserSegmentVideoList:
    """
    Constructs the path to a user's video directory or file.
    
    Args:
        user_id: The user identifier
        video_id: The video identifier  
        subfolder: Optional subfolder within the video directory
        
    Returns:
        FilePath object pointing to the video location
    """
    user_video_list = SchemaUserSegmentVideoList(
        video_id=video_id,
        user_segment_videos=[],

    )

    print("=== _get_generated_short_videos_info: user_id: %s, video_id: %s ===", user_id, video_id)
    warehouse_dir = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR)
    video_path = warehouse_dir / user_id / video_id / "videos-cropped-stacked"
    
    # If configured path doesn't exist, try relative path for local development
    if not video_path.exists():
        logger.info("=== USER_VIDEOS DEBUG: configured video_path does not exist: %s ===", video_path)
        warehouse_dir = FilePath("app/klippers_warehouse")
        video_path = warehouse_dir / user_id / video_id / "videos-cropped-stacked"
        logger.info("=== USER_VIDEOS DEBUG: trying relative path: %s ===", video_path)
    
    if not video_path.exists():
        logger.info("=== USER_VIDEOS DEBUG: video_path does not exist: %s ===", video_path)
        return user_video_list 
    
    info_files = list(video_path.glob('segment_*.info.json'))
    logger.info("=== USER_VIDEOS DEBUG: info_files: %s ===", info_files)
    # create SchemaUserSegmentVideo object from the json content
    if info_files:
        file_pointers = [open(f, 'r') for f in info_files]
        json_contents = [json.load(fp) for fp in file_pointers]
        json_contents = [
            {
                **json_content,
                "video_url": f"/user-shorts/serve/{user_id}/{video_id}/{index+1}",
                "thumbnail_url": f"/user-shorts/thumbnail/{video_id}/{index+1}",
            }
            for index, json_content in enumerate(json_contents)
        ]
        user_segment_videos = [SchemaUserSegmentVideo.model_validate(json_content) for json_content in json_contents]
        # Close file pointers
        for fp in file_pointers:
            fp.close()
    else:
        user_segment_videos = []
    user_video_list.user_segment_videos = user_segment_videos
    return user_video_list




@router.post("/generate-shorts/shorts-config-sample", response_model=ShortConfigJson)
async def generate_shorts_config_sample(
    short_config_json: ShortConfigJson = Body(...),
):
    """
    Generate shorts config sample.
    """
    print("short config:", short_config_json)
    return short_config_json

@router.post("/generate-shorts/{video_id}")
async def generate_shorts(
    video_id: str,
    request: Request,
    config_json: dict = Body(...),
    db: Session = Depends(get_db) # Option to use async subprocess
):
    """
    Generate shorts from a video.
    """
    user_id = request.state.user_id

    # print(f"=== GENERATE SHORT USER_VIDEOS DEBUG: GENERATE_SHORTS: user_id: {user_id}, video_id: {video_id}===")
    is_user_allowed_to_generate_shorts = __is_user_allowed_to_generate_shorts(db, user_id, 30)
    if not is_user_allowed_to_generate_shorts:
        raise HTTPException(status_code=551, detail="User is not allowed to upload video. The reason is that the user has reached the maximum number of videos or the maximum duration of videos.")

    user_video = db.query(UserVideo).filter( UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")
    if user_video.status != UserVideoStatus.UPLOADED.value:
        raise HTTPException(status_code=400, detail="User video is not uploaded")
    

    config_json["config_json"]["original_video_duration_in_seconds"] = user_video.video_duration
    config_json["config_json"]["applied_application"] = VideoProcessingApplication.GENERATE_SHORTS.value
    user_video.config_json = config_json
    user_video.applied_application = VideoProcessingApplication.GENERATE_SHORTS.value
    user_video.status = UserVideoStatus.PROCESSING.value
    db.commit()
    db.refresh(user_video)
    process_user_video(user_video)
    return {
        "message": f"Shorts generation started",
        "video_id": video_id,
    }


@router.post("/generate-shorts-task/{video_id}")
async def generate_shorts_fargate(
    video_id: str,
    request: Request,
    config_json: dict = Body(...),
    db: Session = Depends(get_db) # Option to use async subprocess
):
    """
    Generate shorts from a video.
    """
    user_id = request.state.user_id

    

    # print(f"=== GENERATE SHORT USER_VIDEOS DEBUG: GENERATE_SHORTS: user_id: {user_id}, video_id: {video_id}===")
    is_user_allowed_to_generate_shorts = __is_user_allowed_to_generate_shorts(db, user_id, 30)
    if not is_user_allowed_to_generate_shorts:
        raise HTTPException(status_code=551, detail="User is not allowed to upload video. The reason is that the user has reached the maximum number of videos or the maximum duration of videos.")

    user_video = db.query(UserVideo).filter( UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")
    if user_video.status != UserVideoStatus.UPLOADED.value:
        raise HTTPException(status_code=400, detail="User video is not uploaded")
    

    config_json["config_json"]["original_video_duration_in_seconds"] = user_video.video_duration
    user_video.config_json = config_json
    user_video.status = UserVideoStatus.PROCESSING.value
    user_video.applied_application = VideoProcessingApplication.GENERATE_SHORTS.value
    db.commit()
    db.refresh(user_video)
    process_user_video(user_video)
    return {
        "message": f"Shorts generation started",
        "video_id": video_id,
    }


@router.post("/simulate/generate-shorts/{video_id}")
async def generate_shorts_simulate( 
    request: Request,
    video_id: str,
    config_json: dict = Body(...),
    db: Session = Depends(get_db) # Option to use async subprocess
):
    """
    Generate shorts from a video.
    """

    user_id = request.state.user_id
    video_id = "fe80098a-f9b8-4a4a-8177-e657799bb59b"
    print(f"=== USER_VIDEOS DEBUG: generate_shorts_simulate: %s ===", video_id)
    user_video = db.query(UserVideo).filter(UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")

    user_video.config_json = config_json
    db.commit()
    db.refresh(user_video)
    process_user_video(user_video, simulate=True)
    return {
        "message": f"Shorts generation started",
        "video_id": video_id,
    }

@router.get("/simulate/generated-shorts-info/{video_id}", response_model=SchemaUserSegmentVideoList)
async def simulate_get_generated_shorts_info(
    request: Request,
    video_id: str = Path(..., description="ID of the video"),
    db: Session = Depends(get_db)
     # Option to use async subprocess
):
    # user_id is now read from request.state (set by middleware from JWT token)
    logger.info("=== USER_VIDEOS DEBUG: request.state.__dict__: %s ===", request.state.__dict__)
    # return SchemaUserSegmentVideoList(video_id=video_id, user_segment_videos=[])
    user_id = "f1f3106a-2a75-4ba6-8c31-2c13d0773721" # request.state.user_id
    video_id = "fe80098a-f9b8-4a4a-8177-e657799bb59b"
    video_filenames = _get_generated_short_videos_info(user_id, video_id)

    return video_filenames


@router.get("/generated-shorts-info/{video_id}", response_model=SchemaUserSegmentVideoList)
async def get_generated_shorts_info(
    request: Request,
    video_id: str = Path(..., description="ID of the video"),
    db: Session = Depends(get_db)
     # Option to use async subprocess
):
    # user_id is now read from request.state (set by middleware from JWT token)
    logger.info("=== USER_VIDEOS DEBUG: request.state.__dict__: %s ===", request.state.__dict__)
    # return SchemaUserSegmentVideoList(video_id=video_id, user_segment_videos=[])
    user_id = request.state.user_id
    video_filenames = _get_generated_short_videos_info(user_id, video_id)
    return video_filenames


@router.get("/serve/{user_id}/{video_id}/{index}")
async def serve_short_video_file(
    request: Request,
    index: str = Path(..., description="video segment index"),
    video_id: str = Path(..., description="ID of the video"),
    user_id: str = Path(..., description="ID of the user"),
    db: Session = Depends(get_db)
):
    """
    Serves a video file for video player consumption.
    Supports proper MIME types, range requests, and file streaming for video playback.
    """
    try:
        # user_id is now read from request.state (set by middleware from JWT token)
        # user_id = request.state.user_id
        # user_id = "f1f3106a-2a75-4ba6-8c31-2c13d0773721"

        print(f"=== USER_VIDEOS DEBUG: serve_short_video_file: %s ===", user_id, video_id, index)

        
        # Get the short filename from the index
        short_filename = f"segment_{index}_with_subtitles.mp4"

        # Construct full file path using helper function
        warehouse_dir = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR)
        full_file_path = warehouse_dir / user_id / video_id / "videos-cropped-stacked" / short_filename
        logger.info("=== USER_VIDEOS DEBUG: full_file_path: %s ===", full_file_path)
        # Security check: ensure path is within warehouse directory
        if not str(full_file_path.resolve()).startswith(str(warehouse_dir.resolve())):
            logger.info("=== USER_VIDEOS DEBUG: Access denied: %s ===", full_file_path)
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check if file exists
        
        if not full_file_path.exists() or not full_file_path.is_file():
            logger.info("=== USER_VIDEOS DEBUG: Video file not found: %s ===", full_file_path)
            raise HTTPException(status_code=404, detail="Video file not found")
        
        # Get MIME type for the video file
        # mime_type, _ = mimetypes.guess_type(str(full_file_path))
        # if not mime_type or not mime_type.startswith('video/'):
        mime_type = 'video/mp4'  # Default to mp4 if can't determine
        
        # Get file size
        file_size = full_file_path.stat().st_size
        
        # Handle range requests for video seeking
        range_header = request.headers.get('Range')
        if range_header:
            # Parse range header (e.g., "bytes=0-1023")
            try:
                ranges = range_header.replace('bytes=', '').split('-')
                start = int(ranges[0]) if ranges[0] else 0
                end = int(ranges[1]) if ranges[1] else file_size - 1
                
                # Validate range
                if start >= file_size or end >= file_size or start > end:
                    raise HTTPException(status_code=416, detail="Range not satisfiable")
                
                # Create streaming response for range request
                def iter_file_range():
                    with open(full_file_path, 'rb') as file:
                        file.seek(start)
                        remaining = end - start + 1
                        chunk_size = 8192
                        while remaining > 0:
                            chunk = file.read(min(chunk_size, remaining))
                            if not chunk:
                                break
                            remaining -= len(chunk)
                            yield chunk
                
                headers = {
                    "Content-Range": f"bytes {start}-{end}/{file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(end - start + 1),
                    "Cache-Control": "no-cache",
                }
                
                return StreamingResponse(
                    iter_file_range(),
                    status_code=206,  # Partial Content
                    media_type=mime_type,
                    headers=headers
                )
            except (ValueError, IndexError):
                # Invalid range header, fall back to full file
                pass
        
        # Return full file if no range request or invalid range
        return FileResponse(
            path=str(full_file_path),
            media_type=mime_type,
            filename=full_file_path.name,
            headers={
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache",
                "Content-Length": str(file_size),
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving video file: {str(e)}")


