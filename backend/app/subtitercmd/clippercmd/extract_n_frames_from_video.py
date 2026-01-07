# flake8: noqa: E501

import click
import os
import subprocess


@click.group('video-frames')
def video_frames_group():
    """Commands for extracting frames and thumbnails from videos."""
    pass



def _get_video_duration(video_path):
    """Gets the duration of a video file using ffprobe."""
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path),
    ]
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
        return float(result.stdout)
    except FileNotFoundError:
        print("Error: ffprobe is not installed or not in your PATH.")
        return None
    except subprocess.CalledProcessError as e:
        print("Error during ffprobe execution:")
        print(e.stderr)
        return None
    except ValueError:
        print(f"Error: Could not parse duration from ffprobe output: {result.stdout}")
        return None


@click.command('get-video-duration')
@click.option('--video-path', type=click.Path(exists=True, dir_okay=False, file_okay=True), required=True, help='The path to the input video file.')
def get_video_duration_command(video_path):
    duration = _get_video_duration(video_path)
    print(f"Video duration: {duration:.2f} seconds")
    if duration is None:
        return
    return duration

@click.command('extract-n-frames-from-video')
@click.option('--input-video', type=click.Path(exists=True, dir_okay=False, file_okay=True), required=True, help='The path to the input video file.')
@click.option('--output-folder', type=click.Path(file_okay=False), required=True, help='The directory where extracted frames will be saved.')
@click.option('--frame-interval', default=6, help='Interval in seconds between extracted frames.')
def extract_n_frames_from_video_command(input_video, output_folder, frame_interval):
    _extract_n_frames_from_video(input_video, output_folder, frame_interval)

def _extract_n_frames_from_video(input_video, output_folder, frame_interval):
    """
    Extracts frames from a video file in a given interval using ffmpeg.
    """
    duration = _get_video_duration(input_video)
    if duration is None:
        return

    num_frames = int(duration // frame_interval)
    print(f"Video duration: {duration:.2f} seconds")
    print(f"Extracting {num_frames} frames with an interval of {frame_interval} seconds.")

    os.makedirs(output_folder, exist_ok=True)
    output_filename_pattern = os.path.join(output_folder, "frame_%04d.png")

    command = [
        "ffmpeg",
        "-i",
        str(input_video),
        "-vf",
        f"fps=1/{frame_interval}",
        "-compression_level", "9",  # maximize PNG compression for extracted frames
        output_filename_pattern,
    ]

    print(f"Executing command: {' '.join(command)}")
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            preexec_fn=os.setsid if hasattr(os, 'setsid') else None
        )
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print("Successfully extracted frames.")
            print(stderr)
        else:
            print("Error during ffmpeg execution:")
            print(stderr)

    except FileNotFoundError:
        print("Error: ffmpeg is not installed or not in your PATH.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")





@click.command('extract-thumbnail-from-video')
@click.option('--input-video', type=click.Path(exists=True, dir_okay=False, file_okay=True), required=True, help='The path to the input video file.')
@click.option('--output-path', type=click.Path(dir_okay=False), required=True, help='The path where the thumbnail will be saved.')
@click.option('--from-second', default=6, help='From second to extract the thumbnail.')
def extract_thumbnail_from_video_command(input_video, output_path, from_second):
    _extract_thumbnail_from_video(input_video, output_path, from_second)

def _extract_thumbnail_from_video(input_video, output_path, from_second):
    """
    Extracts a thumbnail from a video file at a specific time using ffmpeg.
    """
    duration = _get_video_duration(input_video)
    if duration is None:
        return

    if from_second > duration:
        print(f"Error: from_second ({from_second}) is greater than video duration ({duration:.2f}).")
        return

    print(f"Video duration: {duration:.2f} seconds")
    print(f"Extracting thumbnail from {from_second} second.")

    command = [
        "ffmpeg",
        "-ss",
        str(from_second),
        "-i",
        str(input_video),
        "-vframes",
        "1",
        "-vf",
        "scale=480:-1",  # Scale to 480px width, maintain aspect ratio
        "-q:v",
        "10",  # Lower quality (higher value = lower quality in JPEG)
        str(output_path),
    ]

    print(f"Executing command: {' '.join(command)}")
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
            preexec_fn=os.setsid if hasattr(os, 'setsid') else None
        )
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            print(f"Successfully extracted thumbnail to {output_path}")
            print(stderr)
        else:
            print("Error during ffmpeg execution:")
            print(stderr)

    except FileNotFoundError:
        print("Error: ffmpeg is not installed or not in your PATH.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Register commands to the group
video_frames_group.add_command(get_video_duration_command)
video_frames_group.add_command(extract_n_frames_from_video_command)
video_frames_group.add_command(extract_thumbnail_from_video_command)

if __name__ == "__main__":
    video_frames_group()