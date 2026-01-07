# flake8: noqa: E501
from config import Settings
import click
import os
import json
import re
from .utils import (
    _get_video_duration

)
from .split import _split_video_fixed
from .timestamp_to_seconds import _srt_time_to_seconds


def _extract_srt_segment(srt_content, start_seconds, end_seconds):
    """
    Extract SRT content for a specific time segment.

    Args:
        srt_content: Full SRT file content as string
        start_seconds: Segment start time in seconds
        end_seconds: Segment end time in seconds

    Returns:
        String containing SRT content for the specified time range
    """
    # Parse SRT blocks
    srt_blocks = srt_content.strip().split('\n\n')
    segment_subtitles = []
    subtitle_counter = 1

    for block in srt_blocks:
        if not block.strip():
            continue
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue

        # Extract timestamp line (format: HH:MM:SS,ms --> HH:MM:SS,ms)
        timestamp_line = lines[1]
        timestamp_match = re.match(r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})', timestamp_line)

        if timestamp_match:
            subtitle_start_str = timestamp_match.group(1)
            subtitle_end_str = timestamp_match.group(2)
            subtitle_start_seconds = _srt_time_to_seconds(subtitle_start_str)
            subtitle_end_seconds = _srt_time_to_seconds(subtitle_end_str)

            # Check if subtitle overlaps with our segment
            if (subtitle_start_seconds < end_seconds and subtitle_end_seconds > start_seconds):
                # Extract text (lines 2 and beyond)
                text_lines = lines[2:]
                text = '\n'.join(text_lines)

                # Adjust timestamps relative to segment start
                adjusted_start_seconds = max(0, subtitle_start_seconds - start_seconds)
                adjusted_end_seconds = min(end_seconds - start_seconds, subtitle_end_seconds - start_seconds)

                # Convert back to SRT format
                def seconds_to_srt_time(seconds):
                    hours = int(seconds // 3600)
                    minutes = int((seconds % 3600) // 60)
                    secs = int(seconds % 60)
                    milliseconds = int((seconds % 1) * 1000)
                    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

                adjusted_start_str = seconds_to_srt_time(adjusted_start_seconds)
                adjusted_end_str = seconds_to_srt_time(adjusted_end_seconds)

                # Create SRT block for this subtitle
                srt_block = f"{subtitle_counter}\n{adjusted_start_str} --> {adjusted_end_str}\n{text}"
                segment_subtitles.append(srt_block)
                subtitle_counter += 1

    return '\n\n'.join(segment_subtitles) + '\n' if segment_subtitles else ""


def _extract_video_segments(input_video, important_segments_file_json, srt_file, output_dir):
    """Processes segments from a JSON file and splits the input video. Optionally generates SRT chunks."""
    os.makedirs(output_dir, exist_ok=True)
    total_duration = _get_video_duration(input_video)

    # Load segments from JSON file (required)
    try:
        with open(important_segments_file_json, 'r', encoding='utf-8') as f:
            segments_data = json.load(f)
    except FileNotFoundError:
        click.secho(
            "Error: Input JSON file not found at "
            f"{important_segments_file_json}",
            fg="red"
        )
        raise click.Abort()
    except json.JSONDecodeError:
        click.secho(
            "Error: Could not decode JSON from "
            f"{important_segments_file_json}",
            fg="red",
        )
        raise click.Abort()

    processing_message = (
        f"Processing {len(segments_data)} segments from "
        f"{important_segments_file_json}..."
    )
    click.echo(processing_message)

    # Load SRT content if provided
    srt_content = None
    if srt_file:
        try:
            with open(srt_file, 'r', encoding='utf-8') as f:
                srt_content = f.read()
            click.echo(f"Will also generate SRT chunks from: {srt_file}")
        except FileNotFoundError:
            click.secho(f"Warning: SRT file not found at {srt_file}. Skipping SRT generation.", fg="yellow")
        except Exception as e:
            click.secho(f"Warning: Error reading SRT file: {e}. Skipping SRT generation.", fg="yellow")

    for i, segment in enumerate(segments_data):
        start_time_str = segment.get('start')
        end_time_str = segment.get('end')

        if not start_time_str or not end_time_str:
            click.secho(
                f"Skipping segment {i+1} due to missing 'start' or 'end'.",
                fg="yellow"
            )
            continue

        try:
            start_seconds = _srt_time_to_seconds(start_time_str)
            end_seconds = _srt_time_to_seconds(end_time_str)
            print(f"segment {i+1}: start_time: {start_time_str}, "
                  f"end_time: {end_time_str}, "
                  f"start_seconds: {start_seconds}, "
                  f"end_seconds: {end_seconds}, "
                  f"total_duration: {total_duration}")
            if start_seconds >= end_seconds:
                click.secho(
                    f"Skipping segment {i+1} because start time "
                    f"({start_seconds}) is after end time ({end_seconds}).",
                    fg="yellow",
                )
                continue

            duration_seconds = end_seconds - start_seconds

            if duration_seconds <= 0:
                click.secho(
                    f"Skipping segment {i+1} due to invalid duration.",
                    fg="yellow"
                )
                continue
        except (ValueError, IndexError):
            click.secho(
                f"Skipping segment {i+1} due to invalid time format.",
                fg="yellow"
            )
            continue

        score = segment.get('score', 'noscore')
        filename = f"segment_{i+1}.mp4"
        output_filename = os.path.join(output_dir, filename)

        _split_video_fixed(
            input_video,
            output_filename,
            start_seconds,
            end_seconds
        )

        # Generate corresponding SRT file if SRT content is available
        if srt_content:
            srt_filename = f"segment_{i+1}.srt"
            output_srt_filename = os.path.join(output_dir, srt_filename)

            # Extract SRT content for this segment
            segment_srt_content = _extract_srt_segment(
                srt_content, 
                start_seconds, 
                end_seconds
            )

            # Write SRT file
            with open(output_srt_filename, 'w', encoding='utf-8') as f:
                f.write(segment_srt_content)

            if segment_srt_content.strip():
                click.echo(f"Generated SRT: {output_srt_filename}")
            else:
                click.echo(f"No subtitles found for segment {i+1}, created empty SRT: {output_srt_filename}")

    success_message = (
        f"\nSuccessfully processed all segments. "
        f"Output files are in {output_dir}"
    )
    if srt_content:
        success_message += "\nGenerated both video segments and corresponding SRT files."
    click.secho(success_message, fg="green")


@click.command('extract-video-segments')
@click.option(
    '--input-video',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the long video file."
)
@click.option(
    '--important-segments-file-json',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to JSON file with important segments."
)
@click.option(
    '--srt-file',
    required=False,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to SRT file. When provided, corresponding SRT chunks will be generated for each video segment."
)
@click.option(
    '--output-dir',
    default='processed_podcast',
    show_default=True,
    type=click.Path(),
    help="Directory to save all processed files."
)
def extract_video_segments_command(
    input_video,
    important_segments_file_json,
    srt_file,
    output_dir,
):
    """
    Reads a JSON file with segment data and splits the input video.

    The JSON file must contain a list of objects, each with 'start' and
    'end' timestamps in SRT format (HH:MM:SS,ms).

    If --srt-file is provided, corresponding SRT chunks will be generated
    for each video segment using the same timing from the JSON file.
    """
    _extract_video_segments(input_video, important_segments_file_json, srt_file, output_dir)
