from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from typing import Dict, List, Optional, Any
from .klippers_model import BoxRel, CroppingOperator
import os

class VideoPeopleContext(str, Enum):
    PODCAST = "podcast"
    SOLO = "solo"
    VLOG = "vlog"
    INTERVIEW = "interview"
    PRESENTATION = "presentation"

class LanguageCode(str, Enum):
    AUTO_DETECT = "auto-detect"
    EN = "en"
    TR = "tr"
    ES = "es"
    FR = "fr"
    DE = "de"
    IT = "it"
    PT = "pt"
    RU = "ru"
    JA = "ja"
    KO = "ko"

class SocialMediaPlatform(str, Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    PINTEREST = "pinterest"
    REDDIT = "reddit"
    SNAPCHAT = "snapchat"
    TELEGRAM = "telegram"

class VideoAspectRatio(str, Enum):
    SIXTEEN_BY_NINE = "16:9"
    NINE_BY_SIXTEEN = "9:16"
    ONE_BY_ONE = "1:1"
    FOUR_BY_FIVE = "4:5"
    TWO_BY_THREE = "2:3"

class ResolutionMode(str, Enum):
    EIGHT_K = "8k"
    FOUR_K = "4k"
    FULL_HD = "full_hd"
    HD = "hd"
    HD_720P = "hd_720p"
    SD_480P = "sd_480p"
    SD_360P = "sd_360p"
    SD_240P = "sd_240p"
    SD_180P = "sd_180p"
    SD_144P = "sd_144p"
    SD_120P = "sd_120p"
    SD_108P = "sd_108p"
    SD_96P = "sd_96p"

class VideoType(str, Enum):
    VIDEO = "video"
    IMAGE = "image"
    GIF = "gif"


class VideoFormat(str, Enum):
    MP4 = "mp4"
    MOV = "mov"
    AVI = "avi"


class SubtitleStyle(str, Enum):
    DeepDiver = "deep_diver"
    Karaoke = "karaoke"
    Beasty = "beasty"
    Default = "default"
    RoundedBox = "rounded_box"
    MessageBox = "message_box"
    RectanglePerWordPopup = "rectangle_per_word_popup"
    KaraokePopupRectangle = "karaoke_popup_rectangle"
    Regular = "regular"
    RectanglePerWord = "rectangle_per_word"
    MessageBubble = "message_bubble"

    



class FaceFinalPosition(str, Enum):
    TOP_OF_TWO = "top_of_two"
    BOTTOM_OF_TWO = "bottom_of_two"
    ##########################################################
    FULL_SCREEN = "full_screen"
    ##########################################################
    LEFT_OF_TWO = "left_of_two"
    RIGHT_OF_TWO = "right_of_two"
    ##########################################################
    TOP_OF_THREE = "top_of_three"
    BOTTOM_OF_THREE = "bottom_of_three"
    VERTICAL_MIDDLE_OF_THREE = "vertical_middle_of_three"
    ##########################################################
    LEFT_OF_THREE = "top_of_three"
    RIGHT_OF_THREE = "bottom_of_three"
    HORIZONTAL_MIDDLE_OF_THREE = "horizontal_middle_of_three"
    ##########################################################
    LEFT_TOP_OF_FOUR = "left_top_of_four"
    RIGHT_TOP_OF_FOUR = "right_top_of_four"
    LEFT_BOTTOM_OF_FOUR = "left_bottom_of_four"
    RIGHT_BOTTOM_OF_FOUR = "right_bottom_of_four"


class FaceCropping(BaseModel):
    cropping_bbox: Optional[BoxRel] = None
    final_position: Optional[FaceFinalPosition] = None
    face_index: int

class ManualCropping(BaseModel):
    local_face_directory_name: Optional[str] = "reference_faces"
    face_cropping: Optional[List[FaceCropping]] = None



class SubtitleCapitalizationMethod(str, Enum):
    DEFAULT = "default"
    UPPERCASE = "uppercase"
    LOWERCASE = "lowercase"
    CAPITALIZE_FIRST_CHAR_IN_WORDS = "capitalize_first_char_in_words"

class SubtitlePosition(str, Enum):
    TOP = "top"
    BOTTOM = "bottom"
    MIDDLE = "middle"
    LEFT = "left"
    RIGHT = "right"
    CENTER = "center"
    TOP_LEFT = "top_left"
    TOP_RIGHT = "top_right"
    BOTTOM_LEFT = "bottom_left"
    BOTTOM_RIGHT = "bottom_right"
    TOP_LEFT_OF_TWO = "top_left_of_two"
    TOP_RIGHT_OF_TWO = "top_right_of_two"
    BOTTOM_LEFT_OF_TWO = "bottom_left_of_two"
    BOTTOM_RIGHT_OF_TWO = "bottom_right_of_two"
    TOP_LEFT_OF_THREE = "top_left_of_three"
    TOP_RIGHT_OF_THREE = "top_right_of_three"
    BOTTOM_LEFT_OF_THREE = "bottom_left_of_three"
    BOTTOM_RIGHT_OF_THREE = "bottom_right_of_three"
    TOP_LEFT_OF_FOUR = "top_left_of_four"
    TOP_RIGHT_OF_FOUR = "top_right_of_four"
    BOTTOM_LEFT_OF_FOUR = "bottom_left_of_four"
    BOTTOM_RIGHT_OF_FOUR = "bottom_right_of_four"
    TOP_LEFT_OF_FIVE = "top_left_of_five"
    TOP_RIGHT_OF_FIVE = "top_right_of_five"
    BOTTOM_LEFT_OF_FIVE = "bottom_left_of_five"
    BOTTOM_RIGHT_OF_FIVE = "bottom_right_of_five"   


class VideoProcessingApplication(str, Enum):
    GENERATE_SHORTS = "GENERATE_SHORTS"
    GENERATE_SUBTITLING = "GENERATE_SUBTITLING"
    APPLY_TRIM = "APPLY_TRIM"
    APPLY_VOICE_OVER = "APPLY_VOICE_OVER"
    APPLY_VLOG = "APPLY_VLOG"
    APPLY_PODCAST_TEMPLATE = "APPLY_PODCAST_TEMPLATE"



class SubtitleConfigurationUI(BaseModel):
    subtitle_configuration: Optional[SubtitleConfiguration] = Field(default=None)
    video_url: str = Field(default="", description="Video url.")
    thumbnail_url: str = Field(default="", description="Thumbnail url.")

class TrimConfigurationUI(BaseModel):
    trim_configuration: TrimConfiguration = Field(default=None)
    video_url: str = Field(default="", description="Video url.")
    thumbnail_url: str = Field(default="", description="Thumbnail url.")



class SubtitleConfiguration(BaseModel):
    id: str = Field(default="", description="ID of the subtitle configuration.")
    kind: str = Field(default="regular", description="Kind of the subtitle configuration.")
    name: str = Field(default="", description="Name of the subtitle configuration.")
    animation: str = Field(default="", description="Name of the animation.")
    color: str = Field(default="&H00FFFFFF", description="Color of the subtitles.")
    size: int = Field(default=48, description="Size of the subtitles.")
    font: str = Field(default="Arial", description="Font of the subtitles.")
    subtitle_style: SubtitleStyle = Field(default=SubtitleStyle.Default, description="Style of the subtitles, e.g., 'middle', 'bottom', 'top'.")
    subtitle_capitalization_method: SubtitleCapitalizationMethod = Field(default=SubtitleCapitalizationMethod.DEFAULT)
    subtitle_position: SubtitlePosition = Field(default=SubtitlePosition.TOP)
    subtitle_box_font_color: str = Field(default="&H00FFFFFF", description="Background color for the subtitles.")
    subtitle_box_transparency: int = Field(default=255, description="Transparency for the subtitles.")
    subtitle_box_background_color: Optional[str] = Field(default="&H00EBCE87", description="Background color for the subtitles.")
    subtitle_inactive_color: str = Field(default="&H00B469FF", description="Color for the inactive part of the subtitles.")
    subtitle_active_color: str = Field(default="&H00FFFFFF", description="Color for the active (highlighted) part of the subtitles.")    
    subtitle_box_corner_radius: int = Field(default=15, description="Corner radius for the subtitles.")
    subtitle_box_width_compensation: float = Field(default=1.1, description="Compensation factor for word width.")
    subtitle_box_border_thickness: int = Field(default=25, description="Border thickness for the subtitles.")
    subtitle_font_size: int = Field(default=48, description="Font size for the subtitles.")
    subtitle_font_name: str = Field(default="Arial", description="Font name for the subtitles.")
    subtitle_font_bold: bool = Field(default=True, description="Whether to use bold font for the subtitles.")
    subtitle_font_italic: bool = Field(default=False, description="Whether to use italic font for the subtitles.")
    subtitle_font_underline: bool = Field(default=False, description="Whether to use underline font for the subtitles.")
    subtitle_language_code: Optional[LanguageCode] = None

    @field_validator('size', mode='before')
    @classmethod
    def convert_size_to_int(cls, v):
        """Convert string size values (Small, Medium, Large) to integers."""
        if isinstance(v, str):
            size_map = {
                'small': 36,
                'medium': 48,
                'large': 60,
                'extra large': 72,
                'xl': 72,
            }
            return size_map.get(v.lower(), 48)  # Default to 48 if unknown
        return v

    @field_validator('subtitle_box_background_color', mode='before')
    @classmethod
    def handle_null_background_color(cls, v):
        """Handle null values for subtitle_box_background_color."""
        if v is None:
            return "&H00EBCE87"  # Return default color
        return v

class SubtitleApplication(BaseModel):
    subtitle_configuration: List[SubtitleConfiguration] = Field(default=[])



class TrimConfiguration(BaseModel):
    id: str = Field(default="", description="ID of the trim configuration.")
    trim_start_in_seconds: int = Field(default=0, description="Trim start in seconds.")
    trim_end_in_seconds: int = Field(default=60, description="Trim end in seconds.")


class TrimApplication(BaseModel):
    trim_configurations: List[TrimConfiguration] = Field(default=[])

class ShortConfigJson(BaseModel):
    """
    Settings for Klippers video processing.
    """
    video_id: str = Field(default="", description="ID of the video.")
    user_id: str = Field(default="", description="ID of the user.")
    video_people_context: VideoPeopleContext = Field(default=VideoPeopleContext.PODCAST, description="Context of the video, e.g., podcast, solo, vlog, interview, presentation.")
    original_video_thumbnail_url: str = Field(default="", description="Original video thumbnail url.")
    original_video_duration_in_seconds: int = Field(default=60, description="Original video duration in seconds.")
    target_short_video_duration_in_seconds: int = Field(default=60, description="Target length for short videos in seconds. Use -1 for auto-detection.")
    target_video_trim_start_in_seconds: int = Field(default=0, description="Original video trim start in seconds.")
    target_video_trim_end_in_seconds: int = Field(default=60, description="Original video trim end in seconds.")
    how_many_people_in_video: int = Field(default=1)
    dissaminate_on_social_media: bool = Field(default=True)
    segment_count: int = Field(default=3, description="Number of segments to extract from the video.")
    video_language_code: LanguageCode = Field(default=LanguageCode.EN, description="Language code for transcription, e.g., 'en', 'tr'. 'auto-detect' is also an option.")
    video_aspect_ratio: VideoAspectRatio = Field(default=VideoAspectRatio.SIXTEEN_BY_NINE, description="e.g., 16:9, 9:16, 1:1.")
    generate_engaging_captions: bool = Field(default=True)
    use_emojis_in_ass_words: bool = Field(default=True)
    video_type: VideoType = Field(default=VideoType.VIDEO, description="Type of the video, e.g., video, image, gif.")
    video_format: VideoFormat = Field(default=VideoFormat.MP4, description="Format of the video, e.g., mp4, mov, avi.")
    video_resolution: str = Field(default="1920x1080", description="Resolution of the video in pixels. Use -1 for auto-detection.")
    dissaminate_on_social_media_platforms: List[SocialMediaPlatform] = Field(default=[], description="List of social media platforms to dissaminate on.")
    cropping_reference_image_time_interval: int = Field(default=16, description="Time interval for reference images in seconds.")
    cropping_operator: CroppingOperator = Field(default=CroppingOperator.AI, description="Operator for cropping the video.")
    manual_cropping: Optional[ManualCropping] = None
    ffmpeg_thread_count: int = Field(default=10, description="Number of threads to use for ffmpeg.")
    ffmpeg_preset: str = Field(default="ultrafast", description="Preset for ffmpeg.")
    ffmpeg_crf: int = Field(default=30, description="CRF for ffmpeg.")
    video_duration_category: str = Field(default="0-10-minutes", description="Video duration category, e.g., '0-10-minutes', '10-20-minutes', '20-30-minutes', '30-40-minutes', '40+-minutes'.")
    is_fargate_task: bool = Field(default=False, description="Whether the task is running on a fargate task.")
    s3_bucket_name: str = Field(default="", description="S3 bucket name.")
    FARGATE_EXECUTION_ROLE: str = Field(default="", description="Fargate execution role.")
    target_resolution_mode: ResolutionMode = Field(default=ResolutionMode.HD_720P, description="Target resolution mode.")
    applied_application: VideoProcessingApplication = Field(default=VideoProcessingApplication.GENERATE_SHORTS, description="Applied application.")
    subtitle_application: SubtitleApplication = Field(default=SubtitleApplication(subtitle_configuration=[SubtitleConfiguration()]), description="Subtitle application.")
    trim_application: TrimApplication = Field(default=TrimApplication(trim_start_in_seconds=0, trim_end_in_seconds=60), description="Trim application.")

class KlippersShortsConfig(BaseModel):
    config_json: ShortConfigJson = Field(default_factory=ShortConfigJson)
    env: Dict[str, Any] = Field(default_factory=dict)

    def __init__(self, **kwargs):
        # Set env from os.environ if not provided
        if 'env' not in kwargs:
            kwargs['env'] = {k: v for k, v in os.environ.items()}
        super().__init__(**kwargs)

    def _get_env(self, key: str, default: str = "") -> str:
        """Get environment variable, prioritizing os.environ over stored self.env"""
        return os.environ.get(key, self.env.get(key, default))

    def get_root_dir(self) -> str:
        return os.path.join(
            self._get_env("VIDEO_WAREHOUSE_ROOT_DIR", "/tmp/klippers_warehouse"),
            self._get_env("USER_ID", "user123"),
            self._get_env("VIDEO_ID", "video123")
        )

    def get_s3_bucket_name(self) -> str:
        return self.config_json.s3_bucket_name

    def get_do_db_operation(self) -> bool:
        return self._get_env("DO_DB_OPERATION", "true").lower() == "true"

    def get_send_chat(self) -> bool:
        return self._get_env("SEND_CHAT", "true").lower() == "true"

    def get_mock_process(self) -> bool:
        return self._get_env("MOCK_PROCESS", "false").lower() == "true"

    def get_user_id(self) -> str:
        return self._get_env("USER_ID", "user123")

    def get_video_id(self) -> str:
        return self._get_env("VIDEO_ID", "video123")

    def get_user_video_id(self) -> str:
        return f"{self._get_env('USER_ID', 'user123')}-{self._get_env('VIDEO_ID', 'video123')}"

    def get_shorts_config_path(self) -> str:
        return os.path.join(self.get_root_dir(), "shorts_config.json")

    def get_thumbnail_path(self) -> str:
        return os.path.join(self.get_root_dir(), "thumbnail.png")

    def get_chat_room_id(self) -> str:
        return self._get_env("VIDEO_ID", "room-1")

    def get_input_video_path(self) -> str:
        return os.path.join(self.get_root_dir(), "original.mp4")

    def get_audio_file_path(self) -> str:
        return os.path.join(self.get_root_dir(), "original.m4a")

    def get_srt_file_path(self) -> str:
        return os.path.join(self.get_root_dir(), "original.srt")

    def get_txt_file_path(self) -> str:
        return os.path.join(self.get_root_dir(), "original.txt")

    def get_important_segments_video_dir_path(self) -> str:
        return os.path.join(self.get_root_dir(), "important-segment-videos")

    def get_important_segments_json_file_path(self) -> str:
        return os.path.join(self.get_root_dir(), "important_segments_videos.json")

    def get_videos_cropped_stacked_dir_path(self) -> str:
        return os.path.join(self.get_root_dir(), "videos-cropped-stacked")

    def get_segment_count(self) -> int:
        return self.config_json.segment_count

    def get_target_short_video_length(self) -> int:
        return self.config_json.target_short_video_duration_in_seconds