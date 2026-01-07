# flake8: noqa: E501
import click
import os
from .utils import _run_ffmpeg
from config import Settings

def _extract_audio(video_file, audio_file, copy_audio=False):
    """Extracts audio from a video file to M4A format.
    
    Args:
        video_file: Input video file path
        audio_file: Output audio file path
        copy_audio: If True, copies audio stream without re-encoding (MUCH faster, ~1-2 seconds).
                   If False (default), re-encodes to AAC 32k mono for smaller files suitable for transcription.
    """
    if copy_audio:
        # Fast extraction - just copy the audio stream without re-encoding (~1-2 seconds)
        ffmpeg_cmd = [
            'ffmpeg', '-i', video_file, '-y', '-vn',
            '-acodec', 'copy',  # Copy audio stream without re-encoding
            audio_file
        ]
    else:
        # Optimized for transcription - small file size, fast upload to APIs
        ffmpeg_cmd = [
            'ffmpeg', '-i', video_file, '-y', '-vn',
            '-acodec', 'aac', '-b:a', '32k',  # Lower quality AAC at 32kbps for smaller files
            '-ac', '1',  # Mono audio (reduces size by ~50% for speech content)
            '-threads', '0',  # Use all available CPU cores for faster encoding
            audio_file
        ]
    _run_ffmpeg(
        ffmpeg_cmd, f"Extracting audio from {video_file} to {audio_file}"
    )






@click.command('extract-audio')
@click.option(
    '--video-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input video file."
)
@click.option(
    '--audio-file',
    required=True,
    type=click.Path(),
    help="Output audio file (M4A)."
)
def extract_audio_command(video_file, audio_file):
    """Extracts audio from a video file into a lower quality M4A."""
    _extract_audio(video_file, audio_file)
