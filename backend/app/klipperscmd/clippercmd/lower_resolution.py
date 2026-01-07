# flake8: noqa: E501
from app.config import Settings
import click
from .utils import _run_ffmpeg


def _lower_resolution(video_file, output_file, scale=None, width=None,
                      height=None):
    """Reduces the resolution of a video file using ffmpeg."""

    # Build the filter argument based on the provided parameters
    if scale:
        # Use scale factor (e.g., 0.5 for half size)
        filter_arg = f"scale=iw*{scale}:ih*{scale}"
    elif width and height:
        # Use specific width and height
        filter_arg = f"scale={width}:{height}"
    elif width:
        # Use specific width, maintain aspect ratio
        filter_arg = f"scale={width}:-1"
    elif height:
        # Use specific height, maintain aspect ratio
        filter_arg = f"scale=-1:{height}"
    else:
        # Default to 720p if no parameters specified
        filter_arg = "scale=-1:720"

    ffmpeg_cmd = [
        'ffmpeg', '-i', video_file, '-y',
        '-vf', filter_arg,
        '-c:a', 'copy',  # Copy audio stream without re-encoding
        output_file
    ]

    description = f"Lowering resolution of {video_file} to {output_file}"
    if scale:
        description += f" (scale factor: {scale})"
    elif width and height:
        description += f" ({width}x{height})"
    elif width:
        description += f" (width: {width}px, maintaining aspect ratio)"
    elif height:
        description += f" (height: {height}px, maintaining aspect ratio)"
    else:
        description += " (720p)"

    _run_ffmpeg(ffmpeg_cmd, description)


@click.command('lower-resolution')
@click.option(
    '--video-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input video file."
)
@click.option(
    '--output-file',
    required=True,
    type=click.Path(),
    help="Output video file with lower resolution."
)
@click.option(
    '--scale',
    type=float,
    help="Scale factor (e.g., 0.5 for half, 0.75 for 75%)."
)
@click.option(
    '--width',
    type=int,
    help="Target width in pixels. Maintains aspect ratio if height not set."
)
@click.option(
    '--height',
    type=int,
    help="Target height in pixels. Maintains aspect ratio if width not set."
)
def lower_resolution_command(video_file, output_file, scale, width, height):
    """Reduces the resolution of a video file.

    You can specify the output resolution in several ways:
    - Use --scale to resize by a factor (e.g., 0.5 for half size)
    - Use --width and --height for specific dimensions
    - Use --width only to set width while maintaining aspect ratio
    - Use --height only to set height while maintaining aspect ratio
    - If no options are provided, defaults to 720p height

    Examples:
    \b
        # Scale to 50% of original size
    clipper lower-resolution --video-file input.mp4 --output-file output.mp4 \\
        --scale 0.5

    # Set specific dimensions
    clipper lower-resolution --video-file input.mp4 --output-file output.mp4 \\
        --width 1280 --height 720

    # Set width, maintain aspect ratio
    clipper lower-resolution --video-file input.mp4 --output-file output.mp4 \\
        --width 1280

    # Default to 720p
    clipper lower-resolution --video-file input.mp4 --output-file output.mp4
    """

    # Validate that conflicting options aren't used together
    if scale and (width or height):
        raise click.UsageError(
            "Cannot use --scale with --width or --height. Choose one approach."
        )

    _lower_resolution(video_file, output_file, scale, width, height)
