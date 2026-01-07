# flake8: noqa: E501
"""
Word-by-word karaoke animation with vector-drawn rounded rectangles.

This module uses PIL/Pillow for accurate font metrics and ASS vector drawing
to create precise rounded rectangles around each active word during karaoke playback.
"""

import re
import subprocess
import json
import pysubs2
from PIL import ImageFont
from pathlib import Path
import base64
import os
# --- Constants ---

# Aegisub alignment codes for subtitles.
# Numpad codes are used: 2 for Bottom Center, 5 for Middle Center, 7 for Top Left
ALIGNMENT_BOTTOM_CENTER = 2
ALIGNMENT_MIDDLE_CENTER = 5
ALIGNMENT_TOP_LEFT = 7
ALIGNMENT_TOP_CENTER = 8

# The reference video height that the font sizes and margins are based on.
# These values will be scaled relative to the actual video height.
REFERENCE_VIDEO_HEIGHT = 600

# --- Style Definition ---

# Defines the main style for the subtitles.
STYLE_DEFINITION = {
    "Name": "KaraokeRectangle",
    "Fontname": "Arial",
    "Fontsize": 48.0,
    "PrimaryColour": "&H00FFFFFF",      # White
    "SecondaryColour": "&H00FFFFFF",    # White (for karaoke)
    "OutlineColour": "&HFF000000",      # Default transparent outline
    "BackColour": "&HFF000000",         # Default transparent background fill
    "Bold": True,
    "Italic": False,
    "Underline": False,
    "StrikeOut": False,
    "ScaleX": 100.0,
    "ScaleY": 100.0,
    "Spacing": 0.0,
    "Angle": 0.0,
    "BorderStyle": 3,
    "Outline": 0.0,
    "Shadow": 0.0,
    "Alignment": ALIGNMENT_BOTTOM_CENTER,
    "MarginL": 30,
    "MarginR": 30,
    "MarginV": 50,
    "Encoding": 1
}


def _parse_ass_color(color_str: str) -> pysubs2.Color:
    """
    Parses an ASS color string (e.g., '&H00FFFFFF') into a pysubs2.Color object.
    ASS format is &HAABBGGRR (Alpha, Blue, Green, Red).
    """
    if not color_str.startswith('&H'):
        raise ValueError("Invalid ASS color format. Must start with '&H'.")

    hex_color = color_str.replace('&H', '').zfill(8)
    if len(hex_color) != 8:
        raise ValueError("Invalid ASS color format. Must have 8 hex digits.")

    aa = int(hex_color[0:2], 16)
    bb = int(hex_color[2:4], 16)
    gg = int(hex_color[4:6], 16)
    rr = int(hex_color[6:8], 16)
    return pysubs2.Color(r=rr, g=gg, b=bb, a=aa)


def _get_video_dimensions(video_file: str) -> tuple[int, int]:
    """
    Extracts video width and height from a video file using ffprobe.
    
    Args:
        video_file: Path to the video file
        
    Returns:
        A tuple of (width, height) in pixels
        
    Raises:
        RuntimeError: If ffprobe fails or dimensions cannot be extracted
    """
    try:
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height',
            '-of', 'json',
            video_file
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        data = json.loads(result.stdout)
        
        if 'streams' not in data or len(data['streams']) == 0:
            raise RuntimeError(f"No video stream found in {video_file}")
        
        stream = data['streams'][0]
        width = stream.get('width')
        height = stream.get('height')
        
        if width is None or height is None:
            raise RuntimeError(f"Could not extract dimensions from {video_file}")
        
        return int(width), int(height)
        
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffprobe failed: {e.stderr}") from e
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse ffprobe output: {e}") from e
    except Exception as e:
        raise RuntimeError(f"Error getting video dimensions: {e}") from e


def _load_font(fontname: str, fontsize: float, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont:
    """
    Load a TrueType font using PIL/Pillow.
    
    Args:
        fontname: Font name (e.g., "Arial", "DejaVu Sans")
        fontsize: Font size in points
        bold: Whether to use bold variant
        italic: Whether to use italic variant
        
    Returns:
        PIL ImageFont object
        
    Raises:
        RuntimeError: If font cannot be loaded
    """
    # Common font paths on different systems
    font_search_paths = [
        # macOS
        f"/System/Library/Fonts/{fontname}.ttc",
        f"/Library/Fonts/{fontname}.ttf",
        f"/Library/Fonts/{fontname}.ttc",
        # Linux
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if fontname.lower() == "dejavu sans" and bold else None,
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" if fontname.lower() == "dejavu sans" else None,
        f"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if fontname.lower() == "liberation sans" and bold else None,
        f"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf" if fontname.lower() == "liberation sans" else None,
        # Arial on various systems
        f"/System/Library/Fonts/Supplemental/Arial Bold.ttf" if fontname.lower() == "arial" and bold else None,
        f"/System/Library/Fonts/Supplemental/Arial.ttf" if fontname.lower() == "arial" else None,
        f"/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf" if fontname.lower() == "arial" and bold else None,
        f"/usr/share/fonts/truetype/msttcorefonts/Arial.ttf" if fontname.lower() == "arial" else None,
    ]
    
    # Remove None entries
    font_search_paths = [p for p in font_search_paths if p]
    
    # Try to find and load the font
    for font_path in font_search_paths:
        if Path(font_path).exists():
            try:
                return ImageFont.truetype(font_path, int(fontsize))
            except Exception as e:
                print(f"Warning: Could not load font from {font_path}: {e}")
                continue
    
    # Fallback: try to load a default font
    try:
        # Try common fallback fonts
        fallback_paths = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        ]
        for fallback in fallback_paths:
            if Path(fallback).exists():
                print(f"Warning: Using fallback font: {fallback}")
                return ImageFont.truetype(fallback, int(fontsize))
    except Exception:
        pass
    
    raise RuntimeError(
        f"Could not load font '{fontname}' (bold={bold}). "
        f"Searched paths: {font_search_paths}"
    )


def _measure_text(text: str, font: ImageFont.FreeTypeFont, width_compensation: float) -> tuple[float, float]:
    """
    Measure the width and height of text using PIL font metrics.
    
    Args:
        text: The text to measure
        font: PIL ImageFont object
        width_compensation: Factor to multiply width by to match renderer.
        
    Returns:
        A tuple of (width, height) in pixels
    """
    if not text:
        return 0, 0
    
    # Use getlength() for width, which is more accurate than bounding box.
    width = font.getlength(text)
    
    # Apply compensation factor to bridge the gap between Pillow's measurement
    # and libass's final rendering, which can differ.
    width = width * width_compensation
    
    # Use getbbox for height measurement.
    bbox = font.getbbox(text)
    height = bbox[3] - bbox[1]
    
    return width, height


def _calculate_line_geometry(
    line_text: str,
    font: ImageFont.FreeTypeFont,
    padding_x: float,
    word_spacing: float,
    width_compensation: float,
    force_uppercase: bool
) -> tuple[list[dict], float]:
    """Calculates geometric properties of a single karaoke line."""
    karaoke_pattern = r'\{\\?k(\d+)\}([^\{]*)'
    matches = re.findall(karaoke_pattern, line_text)

    if not matches:
        return [], 0

    word_info = []
    for duration_str, word_text in matches:
        duration_cs = int(duration_str)
        if duration_cs == 0:
            continue
        
        clean_word_text = re.sub(r'\{.*?\}', '', word_text).strip()
        if not clean_word_text:
            continue
        
        display_text = clean_word_text.upper() if force_uppercase else clean_word_text
        word_width, word_height = _measure_text(display_text, font, width_compensation)
        
        word_info.append({
            'duration_cs': duration_cs,
            'text': display_text, 'width': word_width, 'height': word_height
        })

    if not word_info:
        return [], 0
        
    total_width = sum(
        (w['width'] + 2 * padding_x) for w in word_info
    ) + (len(word_info) - 1) * word_spacing
    
    return word_info, total_width


def _calculate_global_scale_factor(
    lines: list[pysubs2.SSAEvent],
    font: ImageFont.FreeTypeFont,
    padding_x: float,
    word_spacing: float,
    width_compensation: float,
    force_uppercase: bool,
    video_width: int,
    margin_l: int,
    margin_r: int
) -> float:
    """
    Calculates a single scale factor for all karaoke lines to ensure they fit
    within the video width, preventing inconsistent line heights.
    """
    max_total_width = 0
    
    for line in lines:
        _, total_width = _calculate_line_geometry(
            line.text, font, padding_x, word_spacing, width_compensation, force_uppercase
        )
        if total_width > max_total_width:
            max_total_width = total_width
            
    available_width = video_width - margin_l - margin_r
    
    if max_total_width > available_width:
        return available_width / max_total_width
    
    return 1.0


def _create_rounded_rectangle_drawing(width: float, height: float, radius: float) -> str:
    """
    Creates ASS vector drawing commands for a rounded rectangle using bezier curves.
    
    The rectangle is drawn from (0, 0) to (width, height).
    
    Args:
        width: Rectangle width in pixels
        height: Rectangle height in pixels
        radius: Corner radius in pixels
        
    Returns:
        ASS drawing commands string
    """
    r = min(radius, min(width, height) / 2)
    
    if r <= 0:
        # Sharp corners - simple rectangle
        return f"m 0 0 l {width} 0 {width} {height} 0 {height}"
    
    # Rounded corners using cubic bezier curves
    # The 'b' command in ASS draws cubic bezier curves
    # Format: b x1 y1 x2 y2 x3 y3 (control point 1, control point 2, end point)
    
    # We approximate circular arcs with bezier curves
    # Control point offset: for 90-degree arc, use 0.552284749831 * radius
    # This is a well-known constant for bezier circle approximation
    
    drawing = (
        f"m {r} 0 "                                    # Start at top-left, after corner
        f"l {width - r} 0 "                            # Top edge
        f"b {width} 0 {width} 0 {width} {r} "         # Top-right corner
        f"l {width} {height - r} "                     # Right edge
        f"b {width} {height} {width} {height} {width - r} {height} "  # Bottom-right corner
        f"l {r} {height} "                             # Bottom edge
        f"b 0 {height} 0 {height} 0 {height - r} "    # Bottom-left corner
        f"l 0 {r} "                                    # Left edge
        f"b 0 0 0 0 {r} 0 "                           # Top-left corner
        f"c"                                           # Close path
    )
    
    return drawing


def _ensure_style(subs: pysubs2.SSAFile):
    """
    Ensures the required style exists in the subtitle file.
    If a style with the same name exists, it will be overwritten to ensure consistency.
    """
    style_name = STYLE_DEFINITION["Name"]
    style = pysubs2.SSAStyle()

    # Assign properties from the definition dictionary
    style.fontname = STYLE_DEFINITION["Fontname"]
    style.fontsize = STYLE_DEFINITION["Fontsize"]
    style.primarycolor = _parse_ass_color(STYLE_DEFINITION["PrimaryColour"])
    style.secondarycolor = _parse_ass_color(STYLE_DEFINITION["SecondaryColour"])
    style.outlinecolor = _parse_ass_color(STYLE_DEFINITION["OutlineColour"])
    style.backcolor = _parse_ass_color(STYLE_DEFINITION["BackColour"])
    style.bold = STYLE_DEFINITION["Bold"]
    style.italic = STYLE_DEFINITION["Italic"]
    style.underline = STYLE_DEFINITION["Underline"]
    style.strikeout = STYLE_DEFINITION["StrikeOut"]
    style.scalex = STYLE_DEFINITION["ScaleX"]
    style.scaley = STYLE_DEFINITION["ScaleY"]
    style.spacing = STYLE_DEFINITION["Spacing"]
    style.angle = STYLE_DEFINITION["Angle"]
    style.borderstyle = STYLE_DEFINITION["BorderStyle"]
    style.outline = STYLE_DEFINITION["Outline"]
    style.shadow = STYLE_DEFINITION["Shadow"]
    style.alignment = STYLE_DEFINITION["Alignment"]
    style.marginl = STYLE_DEFINITION["MarginL"]
    style.marginr = STYLE_DEFINITION["MarginR"]
    style.marginv = STYLE_DEFINITION["MarginV"]
    style.encoding = STYLE_DEFINITION["Encoding"]

    subs.styles[style_name] = style


def _create_karaoke_effect(
    original_line: pysubs2.SSAEvent,
    force_uppercase: bool,
    active_color: str,
    inactive_color: str,
    subtitle_box_background_color: str,
    subtitle_box_transparency: int,
    corner_radius: float,
    font: ImageFont.FreeTypeFont,
    font_size: float,
    video_width: int,
    video_height: int,
    alignment: int,
    margin_v: int,
    margin_l: int,
    margin_r: int,
    padding_x: float,
    padding_y: float,
    word_spacing: float,
    width_compensation: float
) -> tuple[list[pysubs2.SSAEvent], list[pysubs2.SSAEvent]]:
    """
    Generates lists of static text events and timed box events for a karaoke line.
    """
    line_text = original_line.text
    
    if r'{\k' not in line_text.lower():
        return [], []

    # Calculate geometry for the line based on the provided, globally-scaled font
    word_info, total_line_width = _calculate_line_geometry(
        line_text,
        font,
        padding_x,
        word_spacing,
        width_compensation,
        force_uppercase
    )

    if not word_info:
        return [], []

    # --- Final Layout Calculation ---
    center_x = video_width / 2
    start_x = center_x - (total_line_width / 2)
    
    if alignment == ALIGNMENT_MIDDLE_CENTER:
        pos_y = video_height / 2
    elif alignment == ALIGNMENT_TOP_CENTER:
        pos_y = margin_v
    else:
        pos_y = video_height - margin_v
    
    text_events, box_events = [], []
    cumulative_time_cs = 0
    current_x = start_x
    
    for word_data in word_info:
        duration_cs, display_text, word_width, word_height = word_data.values()

        t_start_ms = cumulative_time_cs * 10
        word_start_time = original_line.start + t_start_ms
        word_end_time = word_start_time + (duration_cs * 10)

        box_width = word_width + (2 * padding_x)
        box_height = word_height + (2 * padding_y)
        
        box_x = current_x
        box_y = pos_y - box_height / 2
        
        drawing_commands = _create_rounded_rectangle_drawing(box_width, box_height, corner_radius)

        rect_event = pysubs2.SSAEvent(
            start=word_start_time, end=word_end_time,
            text=f"{{\\an7\\pos({box_x:.1f},{box_y:.1f})\\p1\\c{subtitle_box_background_color}\\1a&H{subtitle_box_transparency:02X}&\\bord0}}{drawing_commands}{{\\p0}}",
            style=STYLE_DEFINITION["Name"], layer=0
        )
        box_events.append(rect_event)

        text_x = current_x + padding_x + (word_width / 2)
        text_y = pos_y
        
        text_content = (
            f"{{\\an5\\pos({text_x:.1f},{text_y:.1f})"
            f"\\fn{STYLE_DEFINITION['Fontname']}\\fs{font_size:.1f}"
            f"\\b{int(STYLE_DEFINITION['Bold'])}"
            f"\\i{int(STYLE_DEFINITION['Italic'])}"
            f"\\c{active_color}\\bord0\\shad0}}"
            f"{display_text}"
        )
        
        text_event = pysubs2.SSAEvent(
            start=original_line.start, end=original_line.end,
            text=text_content, style=STYLE_DEFINITION["Name"], layer=1
        )
        text_events.append(text_event)
        
        current_x += box_width + word_spacing
        cumulative_time_cs += duration_cs

    return text_events, box_events


def _process_dialogue_lines(
    subs: pysubs2.SSAFile,
    force_uppercase: bool,
    active_color: str,
    inactive_color: str,
    subtitle_box_background_color: str,
    subtitle_box_transparency: int,
    corner_radius: float,
    video_width: int,
    video_height: int,
    alignment: int,
    font: ImageFont.FreeTypeFont,
    font_size: float,
    margin_v: int,
    margin_l: int,
    margin_r: int,
    padding_x: float,
    padding_y: float,
    word_spacing: float,
    width_compensation: float
):
    """
    Replaces original karaoke lines with a series of static text events
    and timed box events.
    """
    all_new_events = []
    lines_to_remove = [
        line for line in subs 
        if not line.is_comment and line.text.strip() and r'{\k' in line.text.lower()
    ]
    
    for line in lines_to_remove:
        text_events, box_events = _create_karaoke_effect(
            line,
            force_uppercase,
            active_color,
            inactive_color,
            subtitle_box_background_color,
            subtitle_box_transparency,
            corner_radius,
            font,
            font_size,
            video_width,
            video_height,
            alignment,
            margin_v,
            margin_l,
            margin_r,
            padding_x,
            padding_y,
            word_spacing,
            width_compensation
        )
        
        if text_events:
            all_new_events.extend(text_events)
            all_new_events.extend(box_events)

    # Remove original karaoke lines that have been processed
    for line in lines_to_remove:
        subs.events.remove(line)

    # Add all the new generated events to the subtitle file
    for event in all_new_events:
        subs.events.append(event)
    
    # Sort events by start time and layer to maintain proper order
    subs.events.sort(key=lambda e: (e.start, e.layer))




def apply_subs_on_ass_file(
    ass_file: str,
    output_file: str,
    video_width: int = None,
    video_height: int = None,
    position: str = "middle",
    force_uppercase: bool = False,
    active_color: str = "&H00FFFFFF",
    inactive_color: str = "&H00B469FF",
    subtitle_box_background_color: str = "&H00000000",
    subtitle_box_transparency: int = 255,
    border_thickness: int = 0,  # Not used with vector drawing, kept for API compatibility
    corner_radius: int = 15,  # Radius for rounded corners in vector drawing
    padding: float = 10,  # Padding around text inside rectangle
    input_video: str = None,
    width_compensation: float = 1.0,
):
    r"""
    Applies a karaoke-style animation with vector-drawn rectangle backgrounds to each word in an ASS subtitle file.

    This function uses PIL/Pillow for accurate font metrics and ASS vector drawing (\p1 mode) to create
    precise rounded rectangles around each active word during karaoke playback.

    Args:
        ass_file: Path to the input ASS subtitle file.
        output_file: Path to save the modified ASS file.
        input_video: Path to the video file. If provided, dimensions will be extracted automatically using ffprobe.
        video_width: Width of the target video in pixels. Required if input_video is not provided.
        video_height: Height of the target video in pixels. Required if input_video is not provided.
        position: "bottom" (default), "middle", or "top". Determines the vertical alignment of subtitles.
        force_uppercase: If True (default), all subtitle text is converted to uppercase.
        active_color: The color of the active word text in ASS format (&HAABBGGRR).
        inactive_color: The color of the rectangle highlight in ASS format (&HAABBGGRR).
        border_thickness: [Deprecated - kept for API compatibility] Not used in vector drawing mode.
        corner_radius: Radius for rounded corners in pixels. If 0, creates sharp rectangular corners.
                      If > 0, creates smooth rounded corners using bezier curves.
        padding: Padding around the text inside the rectangle in pixels. Default is 10.
        width_compensation: A factor to multiply the measured text width by, to calibrate
                          for differences between Pillow and the final renderer.
    
    Raises:
        ValueError: If neither input_video nor both video_width and video_height are provided.
        RuntimeError: If ffprobe fails to extract video dimensions or font cannot be loaded.
    """
    # Extract video dimensions from video file if provided
    if input_video:
        print(f"Video file: {input_video}")
        video_width, video_height = _get_video_dimensions(input_video)
    elif video_width is None or video_height is None:
        raise ValueError(
            "Either input_video must be provided, or both video_width and video_height must be specified"
        )
    
    print(f"Video dimensions: {video_width}x{video_height}")
    
    # Load subtitle file
    subs = pysubs2.load(ass_file, encoding="utf-8")

    # Set script resolution to match video for correct rendering
    subs.info["PlayResX"] = str(video_width)
    subs.info["PlayResY"] = str(video_height)

    # Add or overwrite our custom style definition
    _ensure_style(subs)

    # Determine alignment based on position preference
    if position == "middle":
        alignment = ALIGNMENT_MIDDLE_CENTER
    elif position == "top":
        alignment = ALIGNMENT_TOP_CENTER
    else:
        alignment = ALIGNMENT_BOTTOM_CENTER

    # Calculate scaled values for positioning and sizing
    scale_factor = video_height / REFERENCE_VIDEO_HEIGHT
    scaled_margin_v = int(STYLE_DEFINITION["MarginV"] * scale_factor)
    scaled_margin_l = int(STYLE_DEFINITION["MarginL"] * scale_factor)
    scaled_margin_r = int(STYLE_DEFINITION["MarginR"] * scale_factor)
    scaled_font_size = STYLE_DEFINITION["Fontsize"] * scale_factor
    scaled_padding = padding * scale_factor
    scaled_corner_radius = corner_radius * scale_factor
    
    print(f"Scale factor: {scale_factor:.2f}")
    print(f"Initial scaled font size: {scaled_font_size:.1f}")
    
    # Load font using PIL for accurate text measurement
    try:
        font = _load_font(
            STYLE_DEFINITION["Fontname"],
            scaled_font_size,
            bold=STYLE_DEFINITION["Bold"],
            italic=STYLE_DEFINITION["Italic"]
        )
        print(f"Font loaded: {STYLE_DEFINITION['Fontname']} (size: {scaled_font_size:.1f})")
    except RuntimeError as e:
        raise RuntimeError(f"Failed to load font: {e}") from e

    # --- Global Scaling for Consistent Line Height ---
    # Find all karaoke lines to determine the maximum width
    karaoke_lines = [
        line for line in subs 
        if not line.is_comment and line.text.strip() and r'{\k' in line.text.lower()
    ]

    # Calculate a single scale factor for all lines to prevent size changes
    if karaoke_lines:
        global_scale_factor = _calculate_global_scale_factor(
            karaoke_lines,
            font,
            scaled_padding,
            scaled_padding,  # word_spacing is based on padding
            width_compensation,
            force_uppercase,
            video_width,
            scaled_margin_l,
            scaled_margin_r,
        )

        final_font_size = scaled_font_size
        final_padding = scaled_padding
        final_corner_radius = scaled_corner_radius

        if global_scale_factor < 1.0:
            print(f"  ⚠️ Longest line is too wide. Applying global scaling of {global_scale_factor:.2f} to all lines.")
            final_font_size *= global_scale_factor
            final_padding *= global_scale_factor
            final_corner_radius *= global_scale_factor
            
            # Reload font with the globally scaled size for accurate measurement
            font = _load_font(
                STYLE_DEFINITION["Fontname"],
                final_font_size,
                bold=STYLE_DEFINITION["Bold"],
                italic=STYLE_DEFINITION["Italic"]
            )
            print(f"Globally scaled font size: {final_font_size:.1f}")
    else:
        final_font_size = scaled_font_size
        final_padding = scaled_padding
        final_corner_radius = scaled_corner_radius

    # Apply the per-word animation to all dialogue lines using vector drawing
    _process_dialogue_lines(
        subs,
        force_uppercase=force_uppercase,
        active_color=active_color,
        inactive_color=inactive_color,
        subtitle_box_background_color=subtitle_box_background_color,
        subtitle_box_transparency=subtitle_box_transparency,
        corner_radius=final_corner_radius,
        video_width=video_width,
        video_height=video_height,
        alignment=alignment,
        font=font,
        font_size=final_font_size,
        margin_v=scaled_margin_v,
        margin_l=scaled_margin_l,
        margin_r=scaled_margin_r,
        padding_x=final_padding,
        padding_y=final_padding / 2,  # Less vertical padding for better look
        word_spacing=final_padding,
        width_compensation=width_compensation
    )

    # Save the final result
    subs.save(output_file, encoding="utf-8")
    print(f"✅ Saved styled ASS file with vector-drawn rectangles to {output_file}")
    print(f"Position middle: {position == 'middle'}")
    print(f"Force uppercase: {force_uppercase}")
    print(f"Inactive color: {inactive_color}")
    print(f"Active color: {active_color}")
    print(f"Corner radius: {corner_radius}")
    print(f"Padding: {padding}")
    print(f"Width Compensation: {width_compensation}")




# def apply_subs_on_ass_file_with_config(ass_file: str, input_video: str, output_file: str, video_width: int, video_height: int, config: ShortConfigJson  ):
#     apply_subs_on_ass_file(
#         ass_file=ass_file,
#         output_file=output_file,
#         video_width=video_width,
#         video_height=video_height,
#         position=config.subtitle_style,
#         force_uppercase=config.subtitle_capitalization_method,
#         active_color=config.subtitle_active_color,
#         inactive_color=config.subtitle_inactive_color,
#         subtitle_box_background_color=config.subtitle_box_background_color,
#         subtitle_box_transparency=config.subtitle_box_transparency,
#         corner_radius=config.subtitle_box_corner_radius,
#         padding=config.subtitle_box_padding,
#         width_compensation=config.subtitle_box_width_compensation,
#     )
