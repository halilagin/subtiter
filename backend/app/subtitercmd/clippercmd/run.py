import click
import os
import random
import string
from datetime import datetime
from .extract_audio import extract_audio_command
from .transcribe import transcribe_audio_file_command
from .convert_srt_to_txt import convert_srt_to_txt_command
from .important_segments import important_segments_command
from .extract_video_segments import extract_video_segments_command


@click.command('run')
@click.option(
    '--input-video',
    required=True,
    default="podcast.mp4",
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the long video file."
)
@click.option(
    '--segment-count',
    default=10,
    show_default=True,
    help="Target segment duration in minutes."
)
@click.pass_context
def run_all_steps(ctx, input_video, segment_count):
    """Runs all steps of the clipper process."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_string = ''.join(
        random.choices(string.ascii_letters + string.digits, k=12)
    )
    root_dir = f"podcast-output-{timestamp}-{random_string}"

    # Create the root directory
    os.makedirs(root_dir, exist_ok=True)

    audio_file = f"{root_dir}/{os.path.basename(input_video)}.m4a"
    srt_file = f"{root_dir}/{os.path.basename(input_video)}.srt"
    txt_file = f"{root_dir}/{os.path.basename(input_video)}.txt"
    important_segments_video_dir = f"{root_dir}/important-segment-videos"
    important_segments_json_file = (
        f"{root_dir}/important_segments_videos.json"
    )

    click.echo(f"Running all steps in {root_dir}")

    click.echo("========== Extract audio ==========")
    ctx.invoke(
        extract_audio_command, video_file=input_video, audio_file=audio_file
    )

    click.echo("========== Transcribe ==========")
    ctx.invoke(
        transcribe_audio_file_command, audio_file=audio_file, output_srt_file=srt_file
    )

    click.echo("========== Convert SRT to TXT ==========")
    ctx.invoke(
        convert_srt_to_txt_command, srt_file=srt_file, txt_file=txt_file
    )

    click.echo("========== Important segments ==========")
    ctx.invoke(
        important_segments_command,
        input_srt=srt_file,
        output_file=important_segments_json_file,
        segment_count=segment_count,
    )

    click.echo("========== Process ==========")
    ctx.invoke(
        extract_video_segments_command,
        input_video=input_video,
        important_segments_file_json=important_segments_json_file,
        output_dir=important_segments_video_dir,
    )
