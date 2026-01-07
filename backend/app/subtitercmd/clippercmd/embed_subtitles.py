# flake8: noqa: E501
# clipper/clippercmd/embed_subtitles.py
from pathlib import Path
import click
import os
import shutil

from .model.default_subtitle_configuration import default_subtitle_configuration
from .utils import _run_ffmpeg
from .apply_subs_on_ass_file import apply_subs_on_ass_file
from .convert_ass_to_txt import _convert_ass_to_txt
from .model.short_config_model import SubtiterShortsConfig, SubtitleConfiguration
import logging


def _validate_files(video_file, srt_file):
    """Validate that input files exist and are readable."""
    if not os.path.exists(video_file):
        raise click.ClickException(f"Video file does not exist: {video_file}")
    
    if not os.path.exists(srt_file):
        raise click.ClickException(f"SRT file does not exist: {srt_file}")
    
    # Check if SRT file has content
    try:
        with open(srt_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                raise click.ClickException(f"SRT file is empty: {srt_file}")
            print(f"Debug: SRT file has {len(content)} characters")
            # Show first few lines for debugging
            lines = content.split('\n')[:6]
            print(f"Debug: First few lines of SRT file:")
            for i, line in enumerate(lines):
                print(f"  {i+1}: {repr(line)}")
    except Exception as e:
        raise click.ClickException(f"Cannot read SRT file {srt_file}: {e}")


def _subtitle_app_embed_subtitles( segment_number: int, subtitle_configuration: SubtitleConfiguration, config: SubtiterShortsConfig):
    """Embeds (hardcodes) subtitles into a video."""
    video_file = config.get_input_video_path()
    output_file = config.get_input_video_path()+".with_subtitles.mp4"
    dialogue_file = config.get_input_video_path()+".dialogue.txt"
    ass_file = config.get_input_video_path()+".ass"
    styled_ass_file_path = config.get_input_video_path()+".ass.styled.ass"

    _embed_subtitles_to_video(video_file, output_file, ass_file, styled_ass_file_path, dialogue_file, config)
    logging.info(f"--- Running _subtitle_app_embed_subtitles for subtitle_configuration {subtitle_configuration} ---")
    videos_cropped_stacked_dir = Path(config.get_videos_cropped_stacked_dir_path())
    video_file = videos_cropped_stacked_dir / f"segment_{segment_number}.mp4"
    output_file = videos_cropped_stacked_dir / f"segment_{segment_number}_with_subtitles.mp4"
    dialogue_file = videos_cropped_stacked_dir / f"segment_{segment_number}_dialogue.txt"
    ass_file = videos_cropped_stacked_dir / f"segment_{segment_number}.ass"
    styled_ass_file_path = f"{str(ass_file)}.styled.ass"
    _embed_subtitles_to_video(video_file, output_file, ass_file, styled_ass_file_path, dialogue_file, config)


def _embed_subtitles(segment_number, config: SubtiterShortsConfig):
    """Embeds (hardcodes) subtitles into a video."""
    logging.info(f"--- Running _embed_subtitles for segment {segment_number} ---")
    videos_cropped_stacked_dir = Path(config.get_videos_cropped_stacked_dir_path())
    video_file = videos_cropped_stacked_dir / f"segment_{segment_number}.mp4"
    output_file = videos_cropped_stacked_dir / f"segment_{segment_number}_with_subtitles.mp4"
    _embed_subtitles_to_video(segment_number, video_file, output_file, config, config.config_json.subtitle_application.subtitle_configuration[0])


def _embed_subtitles_to_video(segment_number, video_file, output_file, config: SubtiterShortsConfig, subtitle_configuration: SubtitleConfiguration=None):
    if subtitle_configuration is None:
        subtitle_configuration = default_subtitle_configuration
    videos_cropped_stacked_dir = Path(config.get_videos_cropped_stacked_dir_path())
    dialogue_file = videos_cropped_stacked_dir / f"segment_{segment_number}_dialogue.txt"
    ass_file = videos_cropped_stacked_dir / f"segment_{segment_number}.ass"
    styled_ass_file_path = f"{str(ass_file)}.styled.ass"

    logging.info(f"video_file: {video_file}")
    logging.info(f"output_file: {output_file}")
    logging.info(f"dialogue_file: {dialogue_file}")
    logging.info(f"ass_file: {ass_file}")
    logging.info(f"styled_ass_file_path: {styled_ass_file_path}")
    logging.info(f"subtitle_configuration: {subtitle_configuration}")
    
    
    _convert_ass_to_txt( str(ass_file), str(dialogue_file))

    subtitle_style = subtitle_configuration.subtitle_style
    if subtitle_style is None:
        subtitle_style = "default"

    
    apply_subs_on_ass_file(
        ass_file=str(ass_file),
        output_file=str(styled_ass_file_path),
        input_video=str(video_file),
        config=config,
        subtitle_configuration=subtitle_configuration
    )

    subtitle_filter = f"ass='{str(styled_ass_file_path)}'"
    ffmpeg_print_string = f"Embedding subtitles from {styled_ass_file_path} into {video_file}"
        
    ffmpeg_cmd = [
        'ffmpeg', '-i', str(video_file), '-y', '-vf', subtitle_filter,
        '-c:v', 'libx264', 
        '-c:a', 'copy'
    ]
    
    # For pure ASS files, add parameters that improve ASS rendering
    ffmpeg_cmd.extend(['-vsync', '1', '-r', '30'])  # Consistent frame rate for smooth karaoke
    ffmpeg_cmd.append(str(output_file))
    print(f"Debug: Full FFmpeg command: {' '.join(ffmpeg_cmd)}")
    _run_ffmpeg(ffmpeg_cmd, ffmpeg_print_string)
    logging.info(f"--- Finished _embed_subtitles for segment {video_file} ---")


def _embed_subtitles_to_video_by_subtitle_style(segment_number, input_video, output_video, config: SubtiterShortsConfig, subtitle_configuration: SubtitleConfiguration=None):
    if subtitle_configuration is None:
        subtitle_configuration = default_subtitle_configuration
    _embed_subtitles_to_video(segment_number, input_video, output_video, config, subtitle_configuration)
    

@click.command('embed-subtitles')
@click.option(
    '--video-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input video segment."
)
@click.option(
    '--srt-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="SRT or ASS subtitle file."
)
@click.option(
    '--output-file',
    required=True,
    type=click.Path(),
    help="Output video file with hardcoded subtitles."
)

@click.option(
    '--position-middle',
    is_flag=True,
    default=False,
    help="Position subtitles in the middle of the video (for stacked videos)."
)
@click.option(
    '--test-basic',
    is_flag=True,
    default=False,
    help="Test with basic subtitles (no positioning) for debugging."
)
def embed_subtitles_command(video_file, srt_file, output_file,  position_middle, test_basic):
    _embed_subtitles_command(video_file, srt_file, output_file,  position_middle, test_basic)

def _embed_subtitles_command(video_file, srt_file, output_file,  position_middle, test_basic):
    """Embeds (hardcodes) subtitles from an SRT or ASS file into a video. ASS files support word-level highlighting."""
    if test_basic:
        print("Debug: Running in basic test mode (no positioning)")
        _embed_subtitles(video_file, srt_file, output_file,  position_middle=False)
    else:
        _embed_subtitles(video_file, srt_file, output_file,  position_middle) 