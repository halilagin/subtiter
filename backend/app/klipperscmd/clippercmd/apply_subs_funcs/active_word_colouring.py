# flake8: noqa: E501
import re
import pysubs2

# --- Constants ---

# Aegisub alignment codes for subtitles.
# Numpad codes are used: 2 for Bottom Center, 5 for Middle Center.
ALIGNMENT_BOTTOM_CENTER = 2
ALIGNMENT_MIDDLE_CENTER = 5

# The reference video height that the font sizes and margins are based on.
# These values will be scaled relative to the actual video height.
REFERENCE_VIDEO_HEIGHT = 600

# --- Style Definition ---

# Defines the main style for the subtitles. This avoids redundancy and
# makes the style easier to configure.
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
    "BorderStyle": 3,                  # Use 3 for an opaque "box" background effect
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


def _ensure_style(subs: pysubs2.SSAFile):
    """
    Ensures the required style exists in the subtitle file.
    If a style with the same name exists, it will be overwritten to ensure
    consistency. This is safer than clearing all existing styles.
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


def _estimate_word_width(text: str, font_size: float) -> float:
    """
    Estimates the pixel width of a text string based on character count and font size.
    This is a rough approximation used for drawing rounded rectangles.
    """
    # Average character width is approximately 0.6 * font_size for most fonts
    avg_char_width = font_size * 0.6
    return len(text) * avg_char_width


def _create_rounded_rectangle_drawing(
    width: float,
    height: float,
    corner_radius: float,
    padding_h: float,
    padding_v: float
) -> str:
    """
    Creates ASS drawing commands for a rounded rectangle.
    
    Args:
        width: Width of the text content
        height: Height of the text content
        corner_radius: Radius of the rounded corners
        padding_h: Horizontal padding around text
        padding_v: Vertical padding around text
    
    Returns:
        ASS drawing commands string for a rounded rectangle
    """
    # Calculate rectangle dimensions with padding
    rect_width = width + (padding_h * 2)
    rect_height = height + (padding_v * 2)
    
    # Ensure corner radius doesn't exceed half the smallest dimension
    max_radius = min(rect_width, rect_height) / 2
    r = min(corner_radius, max_radius)
    
    # Center the rectangle horizontally (for \an5 or \an2 alignment)
    x_offset = -rect_width / 2
    y_offset = -rect_height / 2
    
    # Define corner points
    x1 = x_offset
    x2 = x_offset + rect_width
    y1 = y_offset
    y2 = y_offset + rect_height
    
    # Create rounded rectangle path using ASS drawing commands
    # Format: m x y l x y b x1 y1 x2 y2 x3 y3 (move, line, bezier curve)
    drawing = (
        f"m {x1 + r:.0f} {y1:.0f} "  # Start at top-left corner (after radius)
        f"l {x2 - r:.0f} {y1:.0f} "  # Line to top-right corner (before radius)
        f"b {x2:.0f} {y1:.0f} {x2:.0f} {y1:.0f} {x2:.0f} {y1 + r:.0f} "  # Top-right corner curve
        f"l {x2:.0f} {y2 - r:.0f} "  # Line to bottom-right corner (before radius)
        f"b {x2:.0f} {y2:.0f} {x2:.0f} {y2:.0f} {x2 - r:.0f} {y2:.0f} "  # Bottom-right corner curve
        f"l {x1 + r:.0f} {y2:.0f} "  # Line to bottom-left corner (before radius)
        f"b {x1:.0f} {y2:.0f} {x1:.0f} {y2:.0f} {x1:.0f} {y2 - r:.0f} "  # Bottom-left corner curve
        f"l {x1:.0f} {y1 + r:.0f} "  # Line to top-left corner (before radius)
        f"b {x1:.0f} {y1:.0f} {x1:.0f} {y1:.0f} {x1 + r:.0f} {y1:.0f}"  # Top-left corner curve
    )
    
    return drawing


def _create_karaoke_effect(
    line_text: str,
    force_uppercase: bool,
    background_color: str,
    border_thickness: int,
    corner_radius: int = 15
) -> str:
    """
    Generates ASS override tags for a word-by-word rectangle animation with rounded corners.

    Args:
        line_text: The original text of the subtitle line, potentially with karaoke tags.
        force_uppercase: Whether to convert the text to uppercase.
        background_color: The ASS color string for the rectangle background.
        border_thickness: The thickness of the border used to create the rectangle effect.
        corner_radius: The radius of the rounded corners in pixels.

    Returns:
        A string with new ASS override tags for the animation, or None if no karaoke tags are found.
    """
    if r'{\k' not in line_text.lower():
        return None

    karaoke_pattern = r'\{\\?k(\d+)\}([^\{]*)'
    matches = re.findall(karaoke_pattern, line_text)

    if not matches:
        return None

    enhanced_text = ""
    cumulative_time_cs = 0
    white_color = "&H00FFFFFF"  # White text for all states
    font_size = STYLE_DEFINITION["Fontsize"]

    for duration_str, word_text in matches:
        duration_cs = int(duration_str)
        if duration_cs == 0:
            continue

        clean_word_text = re.sub(r'\{.*?\}', '', word_text)
        display_text = clean_word_text.upper() if force_uppercase else clean_word_text

        t_start_ms = cumulative_time_cs * 10
        t_end_ms = (cumulative_time_cs + duration_cs) * 10

        # Estimate dimensions for the rounded rectangle
        text_width = _estimate_word_width(display_text, font_size)
        text_height = font_size * 1.2  # Height is typically 1.2x font size
        
        # Create rounded rectangle drawing
        rect_drawing = _create_rounded_rectangle_drawing(
            width=text_width,
            height=text_height,
            corner_radius=corner_radius,
            padding_h=border_thickness * 0.8,  # Horizontal padding
            padding_v=border_thickness * 0.5   # Vertical padding
        )

        # Style for the active (highlighted) state of the word.
        # Uses ASS drawing mode to create a rounded rectangle behind the text.
        active_style = (
            fr"\c{white_color}"
            fr"\fscx100\fscy100"
            fr"\bord0\shad0"
            fr"\p1\1c{background_color}\1a&H00"  # Drawing mode with background color
            fr"{rect_drawing}"
            fr"\p0"  # Exit drawing mode
        )

        # Style for the word after it has been highlighted (returns to normal).
        # Remove the rectangle by making it transparent.
        post_active_style = (
            fr"\c{white_color}"
            fr"\fscx100\fscy100"
            fr"\bord0\shad0"
        )

        # The full override block for a single word.
        word_tag = (
            fr"{{"
            # Reset to base style for this word, to not be affected by previous words.
            fr"\r{STYLE_DEFINITION['Name']}"
            # Karaoke timing tag to sync with audio.
            fr"\k{duration_cs}"
            # Animation using \t tag:
            # 1. At t_start_ms, instantly apply the active_style.
            fr"\t({t_start_ms},{t_start_ms},{active_style})"
            # 2. At t_end_ms, instantly switch to the post_active_style.
            fr"\t({t_end_ms},{t_end_ms},{post_active_style})"
            fr"}}"
        )

        enhanced_text += word_tag + display_text
        cumulative_time_cs += duration_cs

    return enhanced_text


def _process_dialogue_lines(
    subs: pysubs2.SSAFile,
    force_uppercase: bool,
    background_color: str,
    border_thickness: int,
    corner_radius: int
):
    """
    Iterates through all subtitle lines, applying the karaoke animation to dialogue.
    """
    style_name = STYLE_DEFINITION["Name"]
    for line in subs:
        if line.is_comment or not line.text.strip():
            continue

        line.style = style_name

        enhanced_text = _create_karaoke_effect(
            line.text,
            force_uppercase,
            background_color,
            border_thickness,
            corner_radius
        )
        if enhanced_text:
            line.text = enhanced_text


def _scale_and_position_styles(subs: pysubs2.SSAFile, video_height: int, position_middle: bool):
    """
    Scales all style properties based on the video height and sets the final alignment.
    This ensures subtitles look correct at different video resolutions.
    """
    scale_factor = video_height / REFERENCE_VIDEO_HEIGHT
    alignment = ALIGNMENT_MIDDLE_CENTER if position_middle else ALIGNMENT_BOTTOM_CENTER

    for style in subs.styles.values():
        style.alignment = alignment
        if scale_factor != 1.0:
            style.fontsize = round(style.fontsize * scale_factor)
            style.outline = round(style.outline * scale_factor, 2)
            style.shadow = round(style.shadow * scale_factor, 2)
            style.marginl = int(style.marginl * scale_factor)
            style.marginr = int(style.marginr * scale_factor)
            style.marginv = int(style.marginv * scale_factor)


def apply_subs_on_ass_file(
    ass_file: str,
    output_file: str,
    video_width: int,
    video_height: int,
    position_middle: bool = False,
    force_uppercase: bool = True,
    background_color: str = "&H00B469FF",  # Default: Fancy Pink
    border_thickness: int = 25,
    corner_radius: int = 15
):
    """
    Applies a karaoke-style animation with a rounded rectangle background to each word in an ASS subtitle file.

    This function loads an ASS file, ensures the required style is present,
    applies word-by-word highlighting with a rounded background rectangle, scales the
    styles to the video resolution, and saves the result to a new file.

    Args:
        ass_file: Path to the input ASS subtitle file.
        output_file: Path to save the modified ASS file.
        video_width: Width of the target video in pixels.
        video_height: Height of the target video in pixels.
        position_middle: If True, subtitles are centered vertically. If False (default),
                         they are at the bottom.
        force_uppercase: If True (default), all subtitle text is converted to uppercase.
        background_color: The color of the rectangle highlight in ASS format (&HAABBGGRR).
        border_thickness: The thickness of the border used to create the rectangle effect.
        corner_radius: The radius of the rounded corners in pixels (default: 15).
    """
    subs = pysubs2.load(ass_file, encoding="utf-8")

    # 1. Set script resolution to match video for correct rendering
    subs.info["PlayResX"] = str(video_width)
    subs.info["PlayResY"] = str(video_height)

    # 2. Add or overwrite our custom style definition
    _ensure_style(subs)

    # 3. Apply the per-word animation to all dialogue lines
    _process_dialogue_lines(
        subs,
        force_uppercase=force_uppercase,
        background_color=background_color,
        border_thickness=border_thickness,
        corner_radius=corner_radius
    )

    # 4. Scale styles to fit video resolution and set final position
    _scale_and_position_styles(subs, video_height, position_middle)

    # 5. Save the final result
    subs.save(output_file, encoding="utf-8")
    print(f"Saved styled ASS file to {output_file}")
