# flake8: noqa: E501
# clipper/clippercmd/utils.py

import os
import re
import subprocess
import click
import openai
from datetime import datetime, timedelta
from pydub import AudioSegment
import json
from .ai_provider_cost_manager import _record_ai_provider_cost
from config import get_shorts_config


def get_video_info(video_path):
    """Gets video duration and dimensions using ffprobe."""
    duration = _get_video_duration(video_path)
    width, height = _get_video_dimensions(video_path)
    return {"duration": duration, "width": width, "height": height}


def _get_audio_duration_fast(audio_file):
    """Get audio duration in minutes without loading entire file into memory.
    
    This is much faster than using AudioSegment.from_file() which loads the entire
    audio file into memory. Uses ffprobe to read metadata only.
    
    Args:
        audio_file: Path to audio file
        
    Returns:
        Duration in minutes (float)
    """
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
             '-of', 'default=noprint_wrappers=1:nokey=1', audio_file],
            capture_output=True, text=True, check=True
        )
        duration_seconds = float(result.stdout.strip())
        return duration_seconds / 60.0  # Convert to minutes
    except (subprocess.CalledProcessError, ValueError) as e:
        click.secho(f"Warning: Could not get audio duration: {e}", fg="yellow")
        # Fallback to pydub if ffprobe fails
        audio = AudioSegment.from_file(audio_file)
        return len(audio) / 1000.0 / 60.0


def _run_ffmpeg(cmd, description):
    """Runs an ffmpeg command and reports status."""
    click.echo(f"{description}...")

    # Check if this is an audio extraction command (-vn flag removes video)
    is_audio_extraction = '-vn' in cmd

    if not is_audio_extraction:
        # Only add video encoding params for video operations
        addition_params = ['-preset', 'ultrafast', '-crf', '30', '-threads', '10']
        # Insert video encoding params before the output file (last element)
        cmd = cmd[:-1] + addition_params + [cmd[-1]]
    try:
        print("command:"," ".join(cmd))
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        click.secho("Success!", fg="green")
    except subprocess.CalledProcessError as e:
        click.secho(f"Error during: {description}.", fg="red")
        click.secho(f"ffmpeg stdout: {e.stdout}", fg="yellow")
        click.secho(f"ffmpeg stderr: {e.stderr}", fg="red")
        raise click.Abort()


def _combine_srt_files(srt_files, output_path):
    """Combines multiple SRT files into one, adjusting timestamps."""
    click.echo(f"Combining {len(srt_files)} SRT files into {output_path}...")
    combined_srt_content = ""
    time_offset_ms = 0
    subtitle_index = 1

    for i, srt_file in enumerate(srt_files):
        with open(srt_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the last timestamp in the current SRT file to calculate the
        # offset for the next one.
        last_timestamp_match = re.findall(r'\d{2}:\d{2}:\d{2},\d{3}', content)
        if not last_timestamp_match:
            continue

        max_time_ms = 0
        for ts in last_timestamp_match:
            h, m, s, ms = map(int, re.split('[:,]', ts))
            total_ms = ((h * 3600) + (m * 60) + s) * 1000 + ms
            if total_ms > max_time_ms:
                max_time_ms = total_ms

        def adjust_timestamp(match):
            h, m, s, ms = map(int, re.split('[:,]', match.group(0)))
            total_ms = ((h * 3600) + (m * 60) + s) * 1000 + ms
            new_total_ms = total_ms + time_offset_ms

            new_h, rem = divmod(new_total_ms, 3600000)
            new_m, rem = divmod(rem, 60000)
            new_s, new_ms = divmod(rem, 1000)

            return f"{new_h:02d}:{new_m:02d}:{new_s:02d},{new_ms:03d}"

        # Adjust timestamps for the current file
        adjusted_content = re.sub(
            r'\d{2}:\d{2}:\d{2},\d{3}', adjust_timestamp, content
        )

        # Adjust subtitle indices
        def adjust_index(match):
            nonlocal subtitle_index
            new_index = subtitle_index
            subtitle_index += 1
            return str(new_index)

        # We only adjust index for the numbered lines
        adjusted_content = re.sub(
            r'^\d+\s*$', adjust_index, adjusted_content, flags=re.MULTILINE
        )

        combined_srt_content += adjusted_content.strip() + "\n\n"

        # Update the offset for the next file.
        # Use the original max time from this file.
        time_offset_ms += max_time_ms

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(combined_srt_content.strip())

    click.secho(
        f"Successfully combined SRT files into {output_path}", fg="green"
    )


def _split_audio_for_transcription(
    audio_file, temp_dir, chunk_size_mb=20
):
    """Splits an audio file into chunks smaller than the target size."""
    click.echo(f"Splitting {audio_file} into chunks...")
    audio = AudioSegment.from_file(audio_file)
    chunk_size_bytes = chunk_size_mb * 1024 * 1024
    duration_ms = len(audio)
    file_size_bytes = os.path.getsize(audio_file)

    # Estimate chunk duration based on file size
    if file_size_bytes > chunk_size_bytes:
        num_chunks = int(file_size_bytes / chunk_size_bytes) + 1
        chunk_duration_ms = duration_ms // num_chunks
    else:
        # If file is smaller than chunk size, no need to split
        chunk_files = [audio_file]
        click.echo(
            "Audio file is smaller than chunk size, no splitting needed."
        )
        return chunk_files

    chunk_files = []
    for i in range(num_chunks):
        start_ms = i * chunk_duration_ms
        end_ms = (i + 1) * chunk_duration_ms
        if end_ms > duration_ms:
            end_ms = duration_ms

        chunk = audio[start_ms:end_ms]
        chunk_file_path = os.path.join(temp_dir, f"chunk_{i}.m4a")
        chunk.export(chunk_file_path, format="m4a")
        chunk_files.append(chunk_file_path)
        click.echo(
            f"Exported chunk {i+1}/{num_chunks}: {chunk_file_path}"
        )

    return chunk_files

def _get_video_duration(video_path):
    """Gets the duration of a video in seconds using ffprobe."""
    ffmpeg_cmd = [
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', video_path
    ]
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
    return float(result.stdout.strip())

def _get_video_dimensions(video_path) -> tuple[int, int]:
    """Gets the dimensions of a video using ffprobe."""
    ffmpeg_cmd = [
        'ffprobe', '-v', 'error', '-show_entries', 'stream=width,height',
        '-of', 'default=noprint_wrappers=1:nokey=1', video_path
    ]
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
    return int(result.stdout.strip().split('\n')[0]), int(result.stdout.strip().split('\n')[1])


def _convert_segments_to_srt(segments):
    """Converts transcript segments to SRT format.
    
    Args:
        segments: List of segment dictionaries with 'start', 'end', and 'text' keys
        
    Returns:
        String in SRT format
    """
    
    
    

    def convert_seconds_to_srt_time(seconds):
        """Converts a time in seconds to the SRT time format (HH:MM:SS,mmm)."""
        # Use timedelta for easy time calculation
        td = timedelta(seconds=seconds)
        total_seconds = td.total_seconds()
        hours, remainder = divmod(total_seconds, 3600)
        minutes, remainder = divmod(remainder, 60)
        seconds, milliseconds = divmod(remainder, 1)
        # Format to SRT standard: HH:MM:SS,mmm
        return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02},{int(milliseconds*1000):03}"


        # 2. Process the results into SRT format
    srt_content = ""
    for i, segment in enumerate(segments):
        # Format for each SRT block:
        # Subtitle number
        # Start time --> End time
        # Text
        start_time = convert_seconds_to_srt_time(segment['start'])
        end_time = convert_seconds_to_srt_time(segment['end'])
        text = segment['text'].strip()

        srt_content += f"{i + 1}\n"
        srt_content += f"{start_time} --> {end_time}\n"
        # Optional: Print word-level timestamps in the console for verification
        # print(f"Segment words: {[word['word'] for word in segment['words']]}") 
        srt_content += f"{text}\n\n"
    
    with open("/tmp/segments.srt", "w", encoding="utf-8") as f:
        f.write(srt_content)
    
    return srt_content


def _transcribe_and_generate_srt(audio_file, output_srt_file,  client):
    """Transcribes audio and generates an SRT file using OpenAI GPT-4o-transcribe API."""
    click.echo(f"Transcribing {audio_file} with OpenAI GPT-4o-transcribe API...")
    try:
        # Calculate audio duration for cost tracking (fast method using ffprobe)
        duration_minutes = _get_audio_duration_fast(audio_file)
        
        with open(audio_file, "rb") as af:
            transcript = client.audio.transcriptions.create(
                model="gpt-4o-transcribe",
                file=af,
                response_format="verbose_json",
                timestamp_granularities=["segment", "word"]
            )
        
        # Convert the verbose_json response to SRT format
        srt_content = _convert_segments_to_srt(transcript.segments)
        
        with open(output_srt_file, "w", encoding="utf-8") as f:
            f.write(srt_content)
        click.secho(f"Generated SRT: {output_srt_file}", fg="green")
        
        # Calculate cost: $0.006 per minute (verify current pricing for gpt-4o-transcribe)
        cost = duration_minutes * 0.006
        
        # Record the cost
        try:
            config = get_shorts_config()
            user_id = config.get_user_id()
            video_id = config.get_video_id()
            _record_ai_provider_cost(
                user_id=user_id,
                video_id=video_id,
                cost=f"{cost:.6f}",
                operation_name="transcription_srt",
                provider="openai",
                model="gpt-4o-transcribe",
                usage=f"{duration_minutes:.2f} minutes",
                timestamp=datetime.utcnow().isoformat()
            )
        except Exception as e:
            click.secho(f"Warning: Failed to record AI cost: {e}", fg="yellow")
            
    except openai.APIError as e:
        click.secho(f"An error occurred with the OpenAI API: {e}", fg="red")
        raise click.Abort()



try:
    from numba import jit
    NUMBA_AVAILABLE = True
except ImportError:
    NUMBA_AVAILABLE = False
    def jit(*args, **kwargs):
        def decorator(func):
            return func
        return decorator

@jit(nopython=True, cache=True)
def _calculate_dynamic_padding(w, h, target_aspect_ratio=9.0/16.0, overall_padding_factor=1.5):
    """
    Calculates padding for a face to fit a target aspect ratio.
    Numba-compiled for performance.
    """
    face_aspect_ratio = 1.0 * w / h if h > 0 else 0

    if face_aspect_ratio > target_aspect_ratio:
        # Face is wider than target, so we calculate new height based on width
        new_w = w
        new_h = new_w / target_aspect_ratio
    else:
        # Face is taller or equal to target, calculate new width based on height
        new_h = h
        new_w = new_h * target_aspect_ratio

    # Apply overall padding
    padded_w = new_w * overall_padding_factor
    padded_h = new_h * overall_padding_factor

    # Calculate padding needed on each side
    pad_x = (padded_w - w) / 2
    pad_y = (padded_h - h) / 2

    return int(pad_x), int(pad_y) 