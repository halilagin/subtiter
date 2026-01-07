
# flake8: noqa: E501
import asyncio
import subprocess
from fastapi import WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException, Form, BackgroundTasks, Body
import json
import uuid
import aiofiles
import os
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings
from app.db.model_document import UserVideo, UserVideoStatus
from app.db.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.db.seed import sample_config_json
from fastapi import Request
from app.service.klippers.subscription_plan_guard import __is_user_allowed_to_upload_video
from app.klipperscmd.clippercmd.extract_n_frames_from_video import _extract_thumbnail_from_video, _get_video_duration


router = APIRouter(prefix="/videoupload", tags=["video_upload"])


@router.get("/status/{user_video_id}")
async def get_status( user_video_id: str,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    """
    Get shorts from a video.
    """
    user_video = db.query(UserVideo).filter(UserVideo.id == user_video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")
    if user_video.status != UserVideoStatus.UPLOADED.value:
        raise HTTPException(status_code=400, detail="User video is not uploaded")
    
    video_dir = Path(settings.VIDEO_WAREHOUSE_ROOT_DIR) / user_video.user_id / user_video.video_id
    video_dir.mkdir(parents=True, exist_ok=True)
    
    # Determine file extension from original filename
    video_file_path = video_dir / f"shorts_config.json"
    
    # Save uploaded file in chunks to handle large files
    with open(video_file_path, 'w') as f:
        json.dump(user_video.config_json, f)



class CheckUserAllowanceForUploadResponse(BaseModel):
    result: bool



@router.post("/check-user-allowance-for-upload", response_model=CheckUserAllowanceForUploadResponse)
async def check_user_allowance_for_uplaod(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = request.state.user_id

    is_user_allowed_to_upload_video =   __is_user_allowed_to_upload_video(db, user_id, 30)
    return {
        "result": is_user_allowed_to_upload_video
    }



@router.post("/upload")
async def upload_video(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Handles uploading of large video files (60-100MB).
    Saves the file and then triggers video processing.
    """

    user_id = request.state.user_id
    
    # Check if user is allowed to upload video
    is_user_allowed_to_upload_video = __is_user_allowed_to_upload_video(db, user_id, 30)
    if not is_user_allowed_to_upload_video:
        raise HTTPException(status_code=551, detail="User is not allowed to upload video. The reason is that the user has reached the maximum number of videos or the maximum duration of videos.")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")


    # Generate unique video ID
    video_id = str(uuid.uuid4())
    
    try:
        # Create directory structure
        video_dir = Path(settings.VIDEO_WAREHOUSE_ROOT_DIR) / user_id / video_id
        video_dir.mkdir(parents=True, exist_ok=True)
        
        # Determine file extension from original filename
        file_extension = Path(file.filename).suffix if file.filename else '.mp4'
        video_file_path = video_dir / f"original{file_extension}"
        
        # Save uploaded file in chunks to handle large files
        chunk_size = 8192  # 8KB chunks
        async with aiofiles.open(video_file_path, 'wb') as f:
            while chunk := await file.read(chunk_size):
                await f.write(chunk)
        
        print(f"Video uploaded successfully: {video_file_path}")
        print(f"File size: {video_file_path.stat().st_size} bytes")

        
        # Extract thumbnail from video
        _extract_thumbnail_from_video(str(video_file_path), str(video_dir / "thumbnail.png"), 20)
        video_duration = _get_video_duration(str(video_file_path))
        # Save video to database
        user_video = UserVideo(
            user_id=user_id,
            video_id=video_id,
            status=UserVideoStatus.UPLOADED.value,
            config_json=sample_config_json,
            video_duration=int(video_duration or 40*60), # 40 minutes
            meta_data={}, 
        )
        db.add(user_video)
        db.commit()
        
        return {
            "message": f"Video uploaded successfully",
            "user_id": user_id,
            "user_video_id": user_video.id,
            "video_id": video_id,
            "status_endpoint": f"/videoupload/status/{user_id}/{video_id}",
            "thumbnail_url": f"/api/v1/user-videos/video-thumbnail/{user_id}/{video_id}"  

        }
        
    except Exception as e:
        print(f"Error during video upload: {e}")
        # Clean up partial file if it exists
        raise HTTPException(status_code=500, detail=f"Video upload failed")
    
    finally:
        # Close the uploaded file
        await file.close()


