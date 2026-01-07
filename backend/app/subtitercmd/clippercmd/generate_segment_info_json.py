# flake8: noqa: E501
import click
from .utils import _run_ffmpeg
import os
import json
import re
from config import get_shorts_config


def _get_video_duration(video_file):
    """gets the video file duration"""
    ffmpeg_cmd = [
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', video_file
    ]
    return _run_ffmpeg(ffmpeg_cmd, f"Getting the video file duration for {video_file}")


def _get_segment_details(segment_number, important_segments_videos_json_filepath):
    """
    segment_number is the number of the segment
    """
    # get the segment details from the important_segments_videos.json file
    
    f = open(important_segments_videos_json_filepath, 'r')
    important_segments_videos = json.load(f)
    return important_segments_videos[segment_number-1] # 0 based index
    
    


def _read_segment_dialog_file(segment_dialog_path):
    """
    reads the segment dialogue file
    """
    f = open(segment_dialog_path, 'r')
    segment_dialog_content = f.read()
    return segment_dialog_content


def _generate_segment_info_json(video_file):
    """generates a segment info json file with the following format by collecting the information from the video file and the srt file
    {
    "segment_details": {
        "start": "00:00:00,000",
        "end": "00:02:30,160",
        "score": 92,
        "why": "The introduction of Patrick, his personality, interests, and the deep connection he feels towards growth and personal improvement. This segment sets a compelling narrative about his journey and motivations."
    },
    "name": "segment_1_with_subtitles.mp4",
    "parent_video_id": "a0d30dd3-8f30-4e57-be0f-93b6bf8f5fca",
    "video_duration": 150,
    "video_aspect_ratio": "16:9",
    "video_type": "video",
    "video_format": "mp4",
    "video_resolution": "1920x1080",
    "dissaminate_on_social_media_json": ["facebook", "instagram", "twitter"],
    "short_description": "This is a short description of the segment",
    "long_description": "This is a long description of the segment",
    "tags": ["patrick", "growth", "personal improvement"],
    "thumbnail_url": "https://example.com/thumbnail.jpg",
    "video_url": "https://example.com/video.mp4",
    "created_at": "2021-01-01T00:00:00Z",
    "updated_at": "2021-01-01T00:00:00Z"
}
    """
    shorts_config = get_shorts_config()

    
    
    segment_number = int( re.search(r'segment_(\d+)\.mp4', video_file).group(1) )
    
    
    segment_dialog_path = os.path.join(shorts_config.get_videos_cropped_stacked_dir_path(), f"segment_{segment_number}_dialogue.txt")
    segment_dialog_content = _read_segment_dialog_file(segment_dialog_path)
    

    json_data = {}
    json_data['segment_details'] = _get_segment_details(segment_number, shorts_config.get_important_segments_json_file_path())
    json_data['name'] = f"segment_{segment_number}_with_subtitles.mp4"
    json_data['parent_video_id'] = shorts_config.get_video_id()
    json_data['video_duration'] = _get_video_duration(video_file)
    json_data['video_aspect_ratio'] = shorts_config.config_json.video_aspect_ratio
    json_data['video_type'] = shorts_config.config_json.video_type
    json_data['video_format'] = shorts_config.config_json.video_format
    json_data['video_resolution'] = shorts_config.config_json.video_resolution
    json_data['dissaminate_on_social_media_platforms'] = shorts_config.config_json.dissaminate_on_social_media_platforms
    json_data['short_description'] = 'short_description'
    json_data['long_description'] = segment_dialog_content
    json_data['tags'] = 'tags'
    json_data['thumbnail_url'] = 'thumbnail_url'
    json_data['video_url'] = 'video_url'
    json_data['created_at'] = 'created_at'
    json_data['updated_at'] = 'updated_at'

    # write the json data to a file
    info_json_path = os.path.join(shorts_config.get_videos_cropped_stacked_dir_path(), f"segment_{segment_number}.info.json")
    with open(info_json_path, "w") as f:
        json.dump(json_data, f)




@click.command('generate-segment-info-json')
@click.option(
    '--video-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input video file."
)
def generate_segment_info_json_command(video_file):
    """Generates a segment info json file."""
    _generate_segment_info_json(video_file)
