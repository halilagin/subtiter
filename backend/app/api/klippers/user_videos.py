
# flake8: noqa: E501
from ast import Pass
import asyncio
import datetime
import shutil
import subprocess
import logging
from fastapi import WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException, Form, BackgroundTasks, Path, Request
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
from app.schemas.schema_klippers import SchemaUserSegmentVideoList, SchemaUserSegmentVideo, SchemaUserVideoCard, VideoAspectRatio, SchemaPaginatedUserVideoCards
from typing import List, Optional
import math
# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Ensure the logger has a handler if none exist
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler) 

router = APIRouter(prefix="/user-videos", tags=["user_videos"])



#/api/v1/user-videos/video-info/${video_id}


@router.get("/video-download/{video_id}/{segment_number}", response_class=FileResponse)
async def download_video(
    video_id: str,
    segment_number: int,
    request: Request,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    user_id = request.state.user_id
    user_video = db.query(UserVideo).filter( UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")

    video_filename = f"segment_{segment_number}_with_subtitles.mp4"
    video_path = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR) / str(user_id) / str(video_id) / "videos-cropped-stacked" / video_filename

    if not video_path.exists():
        raise HTTPException(status_code=404, detail=f"Video segment not found at {video_path}")

    return FileResponse(video_path, media_type="video/mp4", filename=f"{video_id}___segment_{segment_number}.mp4")




@router.get("/video-download-original/{video_id}", response_class=FileResponse)
async def download_video(
    video_id: str,
    request: Request,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    user_id = request.state.user_id
    user_video = db.query(UserVideo).filter( UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")

    video_filename = "original.mp4"
    video_path = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR) / str(user_id) / str(video_id) / video_filename

    if not video_path.exists():
        raise HTTPException(status_code=404, detail=f"Video segment not found at {video_path}")

    return FileResponse(video_path, media_type="video/mp4", filename=f"{video_id}___original.mp4")

@router.get("/video-info/{video_id}", response_model=SchemaUserVideoCard)
async def get_video_info(
    video_id: str,
    request: Request,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    user_id = request.state.user_id
    user_video = db.query(UserVideo).filter( UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")
    return SchemaUserVideoCard(
        video_duration=user_video.video_duration or 40*60, # 40 minutes
        video_aspect_ratio=VideoAspectRatio.SIXTEEN_BY_NINE,
        video_title="",
        video_id=user_video.video_id,
        video_thumbnail_url=thumbnail_url(user_id, user_video.video_id),
        video_url="",
        created_at=user_video.created_at,
        updated_at=user_video.processing_completed_at or user_video.created_at or datetime.datetime.now(),
        status=user_video.status or "uploaded",
    )



def thumbnail_url(user_id: str, video_id: str):
    thumbnail_path = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR) / str(user_id) / str(video_id) / "thumbnail.png"
    print(f"thumbnail_url: {thumbnail_path}, exists: {thumbnail_path.exists()}")
    if thumbnail_path.exists():
        return f"/api/v1/user-videos/video-thumbnail/{user_id}/{video_id}"
    else:
        return "/public/video-thumbnail.png"

@router.get("/processed-videos-info", response_model=SchemaPaginatedUserVideoCards)
async def get_processed_videos_info(
    request: Request,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    # user_id is now read from request.state (set by middleware from JWT token)
    user_id = request.state.user_id
    
    # Get total count
    total = db.query(UserVideo).filter(UserVideo.user_id == user_id).count()
    
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Get paginated results
    user_videos = db.query(
        UserVideo.video_id, 
        UserVideo.status, 
        UserVideo.created_at, 
        UserVideo.video_duration, 
        UserVideo.applied_application
    ).filter(UserVideo.user_id == user_id).order_by(UserVideo.created_at.desc()).offset(offset).limit(page_size).all()

    user_video_cards = [SchemaUserVideoCard(
        video_id=user_video[0],
        video_duration=int(user_video[3] or 40*60), # 40 minutes
        video_aspect_ratio=VideoAspectRatio.SIXTEEN_BY_NINE,
        video_title="",
        video_thumbnail_url=thumbnail_url(user_id, user_video[0]),
        video_url="",
        created_at=user_video[2] or datetime.datetime.now(),
        updated_at=user_video[2] or datetime.datetime.now(),
        status=user_video[1] or "uploaded",
        applied_application=(user_video[4].upper() if user_video[4] else VideoProcessingApplication.GENERATE_SHORTS.value),
        ) for user_video in user_videos]
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return SchemaPaginatedUserVideoCards(
        items=user_video_cards,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )



@router.get("/processed-videos-info-by-application/{application}", response_model=List[SchemaUserVideoCard])
async def get_processed_videos_info_by_application(
    application: VideoProcessingApplication,
    request: Request,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    # user_id is now read from request.state (set by middleware from JWT token)
    user_id = request.state.user_id
    user_videos = db.query(UserVideo.video_id, UserVideo.status, UserVideo.created_at, UserVideo.video_duration, UserVideo.applied_application).filter(UserVideo.user_id == user_id, UserVideo.applied_application == application).all()



    user_video_cards = [SchemaUserVideoCard(
        video_id=user_video[0],
        video_duration=int(user_video[3] or 40*60), # 40 minutes
        video_aspect_ratio=VideoAspectRatio.SIXTEEN_BY_NINE,
        video_title="",
        video_thumbnail_url=thumbnail_url(user_id, user_video[0]),
        video_url="",
        created_at=user_video[2] or datetime.datetime.now(),
        updated_at=user_video[2] or datetime.datetime.now(),
        status=user_video[1] or "uploaded",
        applied_application=(user_video[4].upper() if user_video[4] else VideoProcessingApplication.GENERATE_SHORTS.value),
        ) for user_video in user_videos]
    return user_video_cards



@router.get("/video_ids")
async def get_video_ids(
    request: Request,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    # user_id is now read from request.state (set by middleware from JWT token)
    user_id = request.state.user_id
    video_ids = db.query(UserVideo.video_id).filter(UserVideo.user_id == user_id).all()
    return [video_id[0] for video_id in video_ids]




# localhost:4080/user-videos/video-thumbnail/a0d30dd3-8f30-4e57-be0f-93b6bf8f5fca

@router.get("/video-thumbnail/{user_id}/{video_id}")
async def get_video_thumbnail(
    user_id: str,
    video_id: str,
    request: Request
):
    # user_id is now read from request.state (set by middleware from JWT token)
    thumbnail_path = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR) / str(user_id) / str(video_id) / "thumbnail.png"

    if not thumbnail_path.exists():
        default_thumbnail_path = FilePath("app/public/video-thumbnail.png")
        return FileResponse(default_thumbnail_path, media_type="image/png")
    
    return FileResponse(thumbnail_path, media_type="image/png")



@router.get("/delete-video/{video_id}")
async def delete_video(
    video_id: str,
    request: Request,
    db: Session = Depends(get_db) # Option to use async subprocess
):
    user_id = request.state.user_id

    try:
        video_path = FilePath(settings.VIDEO_WAREHOUSE_ROOT_DIR) / str(user_id) / str(video_id)
        if video_path.exists():
            shutil.rmtree(video_path)
    except Exception as e:
        Pass

    user_video = db.query(UserVideo).filter(UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
    if not user_video:
        raise HTTPException(status_code=404, detail="User video not found")
    db.delete(user_video)
    db.commit()
    return {"message": "User video deleted successfully"}

