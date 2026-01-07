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


def _create_karaoke_effect(
    line_text: str,
    force_uppercase: bool,
    background_color: str,
    border_thickness: int,
    corner_radius: int 
) -> str:
    """
    Generates ASS override tags for a word-by-word rectangle animation.

    Args:
        line_text: The original text of the subtitle line, potentially with karaoke tags.
        force_uppercase: Whether to convert the text to uppercase.
        background_color: The ASS color string for the rectangle background.
        border_thickness: The thickness of the border used to create the rectangle effect.
        corner_radius: If > 0, uses edge blur (\be) to create rounded corners - only blurs 
                      the border edges, not the whole shape. If 0, sharp corners (no blur).

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
    
    # Determine if we should use edge blur for rounded corners
    use_rounded_corners = corner_radius > 0
    # \be (edge blur) softens corners but unfortunately also affects text slightly
    # Use a very small value (1-2) to minimize text blur while still rounding corners
    rounded_edge_blur = 1 if use_rounded_corners else 0

    for duration_str, word_text in matches:
        duration_cs = int(duration_str)
        if duration_cs == 0:
            continue

        clean_word_text = re.sub(r'\{.*?\}', '', word_text)
        display_text = clean_word_text.upper() if force_uppercase else clean_word_text

        t_start_ms = cumulative_time_cs * 10
        t_end_ms = (cumulative_time_cs + duration_cs) * 10

        # Style for the active (highlighted) state of the word.
        if use_rounded_corners:
            # With edge blur (\be) for rounded corners - only blurs the border edges
            active_style = (
                fr"\c{white_color}"
                fr"\fscx100\fscy100"
                fr"\bord{border_thickness}\be{rounded_edge_blur}\3c{background_color}\3a&H00"
                fr"\shad0"
            )
            post_edge_blur = fr"\be0"
        else:
            # Sharp corners - no blur at all
            active_style = (
                fr"\c{white_color}"
                fr"\fscx100\fscy100"
                fr"\bord{border_thickness}\3c{background_color}\3a&H00"
                fr"\shad0"
            )
            post_edge_blur = ""

        # Style for the word after it has been highlighted (returns to normal).
        # A transparent border effectively removes the rectangle.
        post_active_style = (
            fr"\c{white_color}"
            fr"\fscx100\fscy100"
            fr"\bord{STYLE_DEFINITION['Outline']}\3a&HFF"
            fr"\shad0{post_edge_blur}"
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
    corner_radius: int = 25
):
    """
    Applies a karaoke-style animation with a rectangle background to each word in an ASS subtitle file.

    This function loads an ASS file, ensures the required style is present,
    applies word-by-word highlighting with a background rectangle, scales the
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
        corner_radius: Corner roundness. If 0 (default), creates sharp corners with NO blur.
                      If > 0, uses edge blur (\be) to create rounded corners - only blurs the 
                      border edges for a softer look without full blur (e.g., 3-10 for moderate rounding).
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
