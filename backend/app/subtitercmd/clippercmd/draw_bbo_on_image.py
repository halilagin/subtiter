# flake8: noqa: E501
from app.config import Settings
import click
import os
import subprocess
from app.config import Settings
from PIL import Image, ImageDraw

def get_video_duration(video_path):
    """Gets the duration of a video file using ffprobe."""
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path,
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


@click.command('draw-bbox-on-image')
@click.option('--input-image', type=click.Path(exists=True, dir_okay=False, file_okay=True), required=True, help='The path to the input video file.')
@click.option('--output-image', type=click.Path(exists=False, dir_okay=False, file_okay=True), required=True, help='The path to the output image file.')
@click.option('--bbox-left-px', default=6, help='left pixel of the bounding box')
@click.option('--bbox-top-px', default=6, help='top pixel of the bounding box')
@click.option('--bbox-width-px', default=6, help='width pixel of the bounding box')
@click.option('--bbox-height-px', default=6, help='height pixel of the bounding box')
def draw_bbo_on_image_command(input_image, output_image, bbox_left_px, bbox_top_px, bbox_width_px, bbox_height_px):
    _draw_bbo_on_image(input_image, output_image, bbox_left_px, bbox_top_px, bbox_width_px, bbox_height_px)

def _draw_bbo_on_image(input_image, output_image, bbox_left_px, bbox_top_px, bbox_width_px, bbox_height_px):
    """
    Extracts frames from a video file in a given interval using ffmpeg.
    """
    with Image.open(input_image) as img:
        draw = ImageDraw.Draw(img)
        draw.rectangle([bbox_left_px, bbox_top_px, bbox_left_px + bbox_width_px, bbox_top_px + bbox_height_px], outline="red", width=3)
        img.save(output_image)


@click.group("draw-bbox")
def draw_bbox_cli():
    """Subtiter Chat CLI Tool - Send messages to the chat API"""
    pass


draw_bbox_cli.add_command(draw_bbo_on_image_command, name='draw')

if __name__ == "__main__":
    draw_bbox_cli()