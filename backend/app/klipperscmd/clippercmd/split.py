import click
from datetime import timedelta
from .utils import _run_ffmpeg


def _split_video_fixed(
    input_video, output_file, start_time_seconds, end_time_seconds
):
    """Splits a single video segment of a fixed duration from a start time."""
    # Use input seeking for better performance and accuracy
    # Add -avoid_negative_ts to handle timestamp issues
    ffmpeg_cmd = [
        'ffmpeg', '-ss', str(timedelta(seconds=start_time_seconds)),
        '-i', input_video,
        '-t', str(timedelta(seconds=end_time_seconds - start_time_seconds)),
        '-avoid_negative_ts', 'make_zero',
        '-c', 'copy', 
        '-y',  # Overwrite output file if it exists
        output_file
    ]
    
    _run_ffmpeg(
        ffmpeg_cmd,
        f"Splitting from {start_time_seconds:.2f}s to {end_time_seconds:.2f}s "
        f"into {output_file}"
    )
    return output_file


def _split_video_reencode(
    input_video, output_file, start_time_seconds, end_time_seconds
):
    """Splits a video segment with re-encoding for perfect accuracy.
    
    This is slower but eliminates black frames.
    """
    ffmpeg_cmd = [
        'ffmpeg', '-ss', str(timedelta(seconds=start_time_seconds)),
        '-i', input_video,
        '-t', str(timedelta(seconds=end_time_seconds - start_time_seconds)),
        '-c:v', 'libx264', '-crf', '23',  # Good quality re-encoding
        '-c:a', 'aac', '-b:a', '128k',    # Audio re-encoding
        '-avoid_negative_ts', 'make_zero',
        '-y',
        output_file
    ]
    
    _run_ffmpeg(
        ffmpeg_cmd,
        f"Re-encoding split from {start_time_seconds:.2f}s to "
        f"{end_time_seconds:.2f}s into {output_file}"
    )
    return output_file


@click.command('split')
@click.option(
    '--input-video',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the video file to split."
)
@click.option(
    '--output-file',
    required=True,
    type=click.Path(),
    help="Path for the output segment file."
)
@click.option(
    '--start-time',
    default=0,
    show_default=True,
    help="Start time in seconds for the segment."
)
@click.option(
    '--end-time',
    required=True,
    help="End time in seconds for the segment."
)
def split_command(input_video, output_file, start_time, end_time):
    """Splits a single video segment using ffmpeg."""
    _split_video_fixed(input_video, output_file, start_time, end_time)
    click.echo("\nVideo splitting complete.") 