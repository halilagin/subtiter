from __future__ import annotations
from pydantic import BaseModel
from typing import List, Optional, Union, Dict
from datetime import datetime
from app.subtitercmd.clippercmd.model.short_config_model import VideoAspectRatio, VideoType, VideoFormat, SocialMediaPlatform
from app.db.model_document import VideoProcessingApplication


class SchemaUserVideoDetails(BaseModel):
    start: str
    end: str
    score: int
    why: str
    title: str
    tags: List[str]

class SchemaUserSegmentVideo(BaseModel):
    segment_details: SchemaUserVideoDetails
    parent_video_id: str
    name: str
    video_duration: Optional[int]
    video_aspect_ratio: VideoAspectRatio
    video_type: VideoType
    video_format: VideoFormat
    video_resolution: str
    dissaminate_on_social_media_platforms: Union[List[SocialMediaPlatform], Dict[str, bool]]
    short_description: str
    long_description: str
    tags: Union[List[str], str]
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]

class SchemaUserSegmentVideoList(BaseModel):
    video_id: str
    user_segment_videos: List[SchemaUserSegmentVideo]


class SchemaUserVideoCard(BaseModel):
    video_duration: int
    video_aspect_ratio: VideoAspectRatio
    video_title: str
    video_id: str
    video_thumbnail_url: str
    video_url: str
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]
    status: str
    applied_application: VideoProcessingApplication = VideoProcessingApplication.GENERATE_SHORTS


class SchemaPaginatedUserVideoCards(BaseModel):
    items: List[SchemaUserVideoCard]
    total: int
    page: int
    page_size: int
    total_pages: int
