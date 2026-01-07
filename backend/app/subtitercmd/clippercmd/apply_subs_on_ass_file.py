# flake8: noqa: E501
import click
import shutil
import tempfile
import os

from config import get_shorts_config

from .apply_subs_funcs import rounded_box
from .apply_subs_funcs import message_box
from .apply_subs_funcs import regular

from .apply_subs_funcs import rectangle_per_word_popup
from .apply_subs_funcs import karaoke
from .apply_subs_funcs import karaoke_rectangle
from .apply_subs_funcs import deep_diver
from .apply_subs_funcs import rectangle_per_word
from .utils import _run_ffmpeg
from .model.short_config_model import SubtiterShortsConfig, SubtitleConfiguration
import logging





# Correct ASS V4+ Styles format with all required fields
BASE_STYLES = (
    "[V4+ Styles]\n"
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
)

# Style definitions for animations
ANIMATION_STYLES = {
    "regular": {
        "styles": (
            BASE_STYLES +
            "Style: main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
            "Style: highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
        ),
        "main_style": "main",
        "highlight_style": "highlight"
    },
    "deep_diver": {
        "styles": (
            BASE_STYLES +
            "Style: DeepDiver_Main,Marker Felt,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,170,100,-2,0,1,2,2,2,30,30,80,1\n"
            "Style: DeepDiver_Highlight,Marker Felt,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,170,100,-2,0,1,2,2,2,30,30,80,1\n"
        ),
        "main_style": "DeepDiver_Main",
        "highlight_style": "DeepDiver_Highlight"
    },

    "karaoke": {
        "styles": (
            BASE_STYLES +
            "Style: main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
            "Style: highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
        ),
        "main_style": "main",
        "highlight_style": "highlight"
    },
    "karaoke_popup_rectangle": {
        "styles": (
            BASE_STYLES +
            "Style: KaraokePopupRectangle_Main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
            "Style: KaraokePopupRectangle_Highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
        ),
        "main_style": "KaraokePopupRectangle_Main",
        "highlight_style": "KaraokePopupRectangle_Highlight"
    },

    "rectangle_per_word": {
        "styles": (
            BASE_STYLES +
            "Style: main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
            "Style: highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
        ),
        "main_style": "main",
        "highlight_style": "highlight"
    },
    "rounded_box": {
        "styles": (
            BASE_STYLES +
            "Style: main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
            "Style: highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
        ),
        "main_style": "main",
        "highlight_style": "highlight"
    },
    "message_box": {
        "styles": (
            BASE_STYLES +
            "Style: main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
            "Style: highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"
        ),
        "main_style": "main",
        "highlight_style": "highlight"
    }
}

def apply_subs_on_ass_file(ass_file, output_file, input_video, config: SubtiterShortsConfig, subtitle_configuration: SubtitleConfiguration=None):
    """
    Route to the appropriate animation-specific _apply_subs_on_ass_file function based on animation parameter.
    """
    logging.info(f"--- Running _apply_subs_on_ass_file ---")
    logging.info(f"ass_file: {ass_file}")
    logging.info(f"output_file: {output_file}")
    logging.info(f"input_video: {input_video}")
    # Validate animation type
    subtitle_style = subtitle_configuration.subtitle_style.value
    logging.info(f"subtitle_style: {subtitle_style}")
    if subtitle_style not in ANIMATION_STYLES:
        raise ValueError(f"Animation '{subtitle_style}' not found. Available animations: {list(ANIMATION_STYLES.keys())}")
    _apply_subs_on_ass_file_by_subtitle_style(ass_file, output_file, input_video, config, subtitle_configuration )


def _apply_subs_on_ass_file_by_subtitle_style( ass_file, output_file, input_video, config: SubtiterShortsConfig, subtitle_configuration: SubtitleConfiguration=None):
    
    subtitle_style = subtitle_configuration.subtitle_style
    # Get style configuration for the animation
    style_config = ANIMATION_STYLES[subtitle_style]
    # Route to the appropriate animation module
    
    if subtitle_style == "karaoke_popup_rectangle":
        karaoke_rectangle._apply_subs_on_ass_file(
            ass_file, output_file, subtitle_style, style_config,
            position_middle=True
        )

    elif subtitle_style == "regular":

        regular.apply_subs_on_ass_file(
            ass_file=ass_file,
            output_file=output_file,
            input_video=input_video,
            position=subtitle_configuration.subtitle_position,
            width_compensation=subtitle_configuration.subtitle_box_width_compensation,
            active_color=subtitle_configuration.subtitle_active_color,
            inactive_color=subtitle_configuration.subtitle_inactive_color
        )
    elif subtitle_style == "karaoke":
        karaoke._apply_subs_on_ass_file(
            ass_file, output_file, subtitle_style, style_config,
            position_middle=True
        )
    elif subtitle_style == "deep_diver":
        deep_diver._apply_subs_on_ass_file(
            ass_file, output_file, subtitle_style, style_config,
            position_middle=True
        )
    elif subtitle_style == "rectangle_per_word":
        rectangle_per_word.apply_subs_on_ass_file(
            ass_file=ass_file, 
            output_file=output_file, 
            position=subtitle_configuration.subtitle_position
        )

    elif subtitle_style == "rounded_box":
        
        rounded_box.apply_subs_on_ass_file(
            ass_file=ass_file,
            output_file=output_file,
            input_video=input_video,
            position=subtitle_configuration.subtitle_position,
            width_compensation=subtitle_configuration.subtitle_box_width_compensation,
            corner_radius=subtitle_configuration.subtitle_box_corner_radius,
            active_color=subtitle_configuration.subtitle_active_color,
            inactive_color=subtitle_configuration.subtitle_inactive_color,
            subtitle_box_background_color=subtitle_configuration.subtitle_box_background_color,
            subtitle_box_transparency=subtitle_configuration.subtitle_box_transparency
        )

    elif subtitle_style == "message_box":
        
        message_box.apply_subs_on_ass_file(
            ass_file=ass_file,
            output_file=output_file,
            input_video=input_video,
            position=subtitle_configuration.subtitle_position,
            width_compensation=subtitle_configuration.subtitle_box_width_compensation,
            corner_radius=subtitle_configuration.subtitle_box_corner_radius,
            padding=15, #subtitle_configuration.subtitle_box_padding,
            active_color=subtitle_configuration.subtitle_active_color,
            inactive_color=subtitle_configuration.subtitle_inactive_color,
            subtitle_box_background_color=subtitle_configuration.subtitle_box_background_color,
            subtitle_box_transparency=subtitle_configuration.subtitle_box_transparency
        )


    elif subtitle_style == "rectangle_per_word_popup":
        rectangle_per_word_popup.apply_subs_on_ass_file(
            ass_file=ass_file, 
            output_file=output_file, 
            position_middle=True
        )
    else:
        raise ValueError(f"Animation '{subtitle_style}' is not supported. Available animations: {list(ANIMATION_STYLES.keys())}")
    logging.info(f"--- Finished _apply_subs_on_ass_file ---")


@click.group("subtitles")
def subtitles_group_command():
    """A group of commands for subtitle processing."""
    pass



@subtitles_group_command.command("message_box")
@click.option('--ass-file', required=True, type=click.Path(exists=True, dir_okay=False))
@click.option('--output-file', required=True, type=click.Path())
@click.option('--video-width', type=int)
@click.option('--video-height', type=int)
@click.option('--input-video', type=click.Path(exists=True, dir_okay=False))
@click.option('--width-compensation', default=1.0, type=float)
@click.option('--corner-radius', default=15, type=int)
@click.option('--padding', default=10, type=float)
@click.option('--active-color', default="&H00FFFFFF", type=str)
@click.option('--inactive-color', default="&H00B469FF", type=str)
@click.option('--subtitle-box-background-color', default="&H00000000", type=str, help='Background color for the box.')
@click.option('--subtitle-box-transparency', default=255, type=int, help='Background box transparency (0-255, 255 is invisible).')
@click.option('--position', type=click.Choice(['top', 'middle', 'bottom']), default='middle', help='Vertical position of the subtitles.')
def message_box_command(ass_file, output_file, video_width, video_height, input_video, width_compensation, corner_radius, padding, active_color, inactive_color, subtitle_box_background_color, subtitle_box_transparency, position):
    message_box.apply_subs_on_ass_file(
        ass_file=ass_file,
        output_file=output_file,
        video_width=video_width,
        video_height=video_height,
        position=position,
        input_video=input_video,
        width_compensation=width_compensation,
        corner_radius=corner_radius,
        padding=padding,
        active_color=active_color,
        inactive_color=inactive_color,
        subtitle_box_background_color=subtitle_box_background_color,
        subtitle_box_transparency=subtitle_box_transparency
    )

@subtitles_group_command.command("rounded_box")
@click.option('--ass-file', required=True, type=click.Path(exists=True, dir_okay=False))
@click.option('--output-file', required=True, type=click.Path())
@click.option('--video-width', type=int)
@click.option('--video-height', type=int)
@click.option('--input-video', type=click.Path(exists=True, dir_okay=False))
@click.option('--width-compensation', default=1.0, type=float)
@click.option('--corner-radius', default=15, type=int)
@click.option('--active-color', default="&H00FFFFFF", type=str)
@click.option('--inactive-color', default="&H00B469FF", type=str)
@click.option('--subtitle-box-background-color', default="&H00000000", type=str, help='Background color for the box.')
@click.option('--subtitle-box-transparency', default=255, type=int, help='Background box transparency (0-255, 255 is invisible).')
@click.option('--position', type=click.Choice(['top', 'middle', 'bottom']), default='middle', help='Vertical position of the subtitles.')
def rounded_box_command(ass_file, output_file, video_width, video_height, input_video, width_compensation, corner_radius, active_color, inactive_color, subtitle_box_background_color, subtitle_box_transparency, position):
    rounded_box.apply_subs_on_ass_file(
        ass_file=ass_file,
        output_file=output_file,
        video_width=video_width,
        video_height=video_height,
        position=position,
        input_video=input_video,
        width_compensation=width_compensation,
        corner_radius=corner_radius,
        active_color=active_color,
        inactive_color=inactive_color,
        subtitle_box_background_color=subtitle_box_background_color,
        subtitle_box_transparency=subtitle_box_transparency
    )

@subtitles_group_command.command("regular")
@click.option('--ass-file', required=True, type=click.Path(exists=True, dir_okay=False))
@click.option('--output-file', required=True, type=click.Path())
@click.option('--video-width', type=int)
@click.option('--video-height', type=int)
@click.option('--input-video', type=click.Path(exists=True, dir_okay=False))
@click.option('--width-compensation', default=1.0, type=float)
@click.option('--active-color', default="&H00FFFFFF", type=str)
@click.option('--inactive-color', default="&H00B469FF", type=str)
@click.option('--subtitle-box-background-color', default="&H00000000", type=str, help='Background color for the box.')
@click.option('--subtitle-box-transparency', default=255, type=int, help='Background box transparency (0-255, 255 is invisible).')
@click.option('--position', type=click.Choice(['top', 'middle', 'bottom']), default='middle', help='Vertical position of the subtitles.')
def regular_command(ass_file, output_file, video_width, video_height, input_video, width_compensation, active_color, inactive_color, subtitle_box_background_color, subtitle_box_transparency, position):
    regular.apply_subs_on_ass_file(
        ass_file=ass_file,
        output_file=output_file,
        video_width=video_width,
        video_height=video_height,
        position=position,
        input_video=input_video,
        width_compensation=width_compensation,
        active_color=active_color,
        inactive_color=inactive_color,
        subtitle_box_background_color=subtitle_box_background_color,
        subtitle_box_transparency=subtitle_box_transparency
    )

def _embed_ass_on_video(ass_file, input_video, output_video):


    ffmpeg_cmd = [
        'ffmpeg', '-i', input_video, '-y', '-vf', f"subtitles={ass_file}",
        '-c:v', 'libx264', 
        '-c:a', 'copy',
        '-preset', 'ultrafast',
        '-crf', '30',
        '-threads', '2',
        output_video
    ]
    _run_ffmpeg(ffmpeg_cmd, f"Embedding ASS file {ass_file} into video {input_video}")

@click.command("embed-ass-on-video")
@click.option(
    '--ass-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the ASS file to embed on video."
)
@click.option(
    '--input-video',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the input video."
)
@click.option(
    '--output-video',
    required=True,
    type=click.Path(),
    help="Path to the output video."
)
def embed_ass_on_video_command(ass_file, input_video, output_video):
    _embed_ass_on_video(ass_file, input_video, output_video)


subtitles_group_command.add_command(embed_ass_on_video_command)


if __name__ == '__main__':
    subtitles_group_command()