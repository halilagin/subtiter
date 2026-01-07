import re
import pysubs2


def process_karaoke_rectangle_line(line_text, subs, main_style_name):
    """
    Process a karaoke line to add word-by-word highlighting effects with background rectangle.

    Args:
        line_text: The text of the subtitle line
        subs: The pysubs2 SSAFile object containing styles
        main_style_name: The name of the main style being used

    Returns:
        Enhanced text with karaoke effects and background rectangle, or None if no karaoke tags found
    """

    print(f"Processing karaoke rectangle line: {line_text}")
    
    # Define background color (fancy pink for rectangle)
    # Pink color in ASS format: &HAABBGGRR
    # Using a vibrant pink: R=255, G=105, B=180 (Hot Pink)
    background_color = "&H00B469FF"  # Fancy pink background (opaque)

    # Check if the line already has karaoke tags
    if r'{\k' not in line_text and r'{\\k' not in line_text:
        return None

    # Parse existing karaoke timing and add background + size effects
    # Extract all {\k<duration>}word patterns
    karaoke_pattern = r'\{\\?k(\d+)\}([^\{]*)'
    matches = re.findall(karaoke_pattern, line_text)

    if not matches:
        return None

    enhanced_text = ""
    cumulative_time_cs = 0

    for duration_str, word_text in matches:
        duration_cs = int(duration_str)
        t_start_ms = cumulative_time_cs * 10  # Convert to milliseconds
        t_end_ms = (cumulative_time_cs + duration_cs) * 10

        # Strip any existing ASS override tags from the word text (like color tags)
        # Remove patterns like {\...} or \... that might contain color overrides
        clean_word_text = re.sub(r'\{[^}]*\}', '', word_text)  # Remove {...} tags
        clean_word_text = re.sub(r'\\[a-zA-Z]+[^\\]*', '', clean_word_text)  # Remove \tag patterns
        
        # Capitalize the word text for display
        display_text = clean_word_text.upper()

        # --- Define styles for different states ---

        # White color for all text
        white_color = "&H00FFFFFF"

        # 1. Active state (word is being sung): white text with rounded rectangle, same font size
        active_style = (
            r",\c" + white_color +
            r"\fscx100\fscy100" +  # Keep font size constant at 100%
            r"\bord15\3c" + background_color + r"&\3a&H00" +  # Thick opaque pink border as rectangle
            r"\shad0\be2"  # \be2 adds more blur for rounder corners
        )

        # 2. Post-active state (word has been sung): white text, no rectangle
        post_active_style = (
            r",\c" + white_color +  # Keep white color
            r"\fscx100\fscy100" +  # Keep font size constant at 100%
            r"\bord2\3a&HFF" +  # Transparent border (no rectangle)
            r"\shad0\be0"  # No blur effect
        )

        # --- Construct the final tag for the word ---
        word_tag = (
            # Initial state: white, normal size, no rectangle
            r"{\fscx100\fscy100\c" + white_color + r"\bord2\3c&H000000&\3a&HFF&\shad0\4a&HFF&\be0" +
            # Karaoke timing
            r"\k" + str(duration_cs) +
            # Transformation for active state (show rectangle with highlight)
            r"\t(" + str(t_start_ms) + r"," + str(t_end_ms) + active_style + r")" +
            # Transformation for post-active state (remove rectangle, back to default)
            r"\t(" + str(t_end_ms) + r"," + str(t_end_ms) + post_active_style + r")}"
        )
        enhanced_text += word_tag + display_text
        cumulative_time_cs += duration_cs

    return enhanced_text


style_definition_map = {
    "main": {
        "Name": "KaraokePopupRectangle_Main",
        "Fontname": "Arial",
        "Fontsize": 48,
        "PrimaryColour": "&H00FFFFFF",  # White color
        "SecondaryColour": "&H00FFFFFF",  # White color (was causing red to appear)
        "OutlineColour": "&H00000000",  # Black outline
        "BackColour": "&H00000000",  # Black background
        "Bold": -1,  # Bold font (use -1 for true bold)
        "Italic": 0,
        "Underline": 0,
        "StrikeOut": 0,
        "ScaleX": 100,
        "ScaleY": 100,
        "Spacing": 0,
        "Angle": 0,
        "BorderStyle": 3,
        "Outline": 2,
        "Shadow": 0,
        "Alignment": 2,
        "MarginL": 30,
        "MarginR": 30,
        "MarginV": 50,
        "Encoding": 1
    },
    "highlight": {
        "Name": "KaraokePopupRectangle_Highlight",
        "Fontname": "Arial",
        "Fontsize": 48,
        "PrimaryColour": "&H00FFFFFF",  # White color
        "SecondaryColour": "&H00FFFFFF",  # White color (was causing red to appear)
        "OutlineColour": "&H00000000",  # Black outline
        "BackColour": "&H00000000",  # Black background
        "Bold": -1,  # Bold font (use -1 for true bold)
        "Italic": 0,
        "Underline": 0,
        "StrikeOut": 0,
        "ScaleX": 100,
        "ScaleY": 100,
        "Spacing": 0,
        "Angle": 0,
        "BorderStyle": 3,
        "Outline": 2,
        "Shadow": 0,
        "Alignment": 2,
        "MarginL": 30,
        "MarginR": 30,
        "MarginV": 50,
        "Encoding": 1
    }
}




def _apply_style_on_subs(ass_file=None, output_file=None, video_width=None, video_height=None, position_middle=None):
    """
    Apply rectangle_per_word animation style to ASS subtitle file.
    Uses style_definition_map to create styles programmatically.
    """
    # Helper function to parse ASS color format &HAABBGGRR
    def parse_ass_color(color_str):
        # Remove &H prefix and parse as hex
        color_hex = color_str.replace('&H', '').replace('&h', '')
        # Pad to 8 characters if needed
        color_hex = color_hex.zfill(8)
        # Parse as AABBGGRR
        aa = int(color_hex[0:2], 16)
        bb = int(color_hex[2:4], 16)
        gg = int(color_hex[4:6], 16)
        rr = int(color_hex[6:8], 16)
        return pysubs2.Color(r=rr, g=gg, b=bb, a=aa)

    # Get style names from the style_definition_map
    subs = pysubs2.load(ass_file, encoding="utf-8")

    # Set the playback resolution to match the video
    subs.info["PlayResX"] = str(video_width)
    subs.info["PlayResY"] = str(video_height)

    # Clear existing styles and create new ones from style_definition_map
    subs.styles.clear()

    # Create styles from the style_definition_map
    for style_key, style_def in style_definition_map.items():
        style_obj = pysubs2.SSAStyle()
        style_obj.fontname = style_def["Fontname"]
        style_obj.fontsize = float(style_def["Fontsize"])
        style_obj.primarycolor = parse_ass_color(style_def["PrimaryColour"])
        style_obj.secondarycolor = parse_ass_color(style_def["SecondaryColour"])
        style_obj.outlinecolor = parse_ass_color(style_def["OutlineColour"])
        style_obj.backcolor = parse_ass_color(style_def["BackColour"])
        style_obj.bold = bool(int(style_def["Bold"]))
        style_obj.italic = bool(int(style_def["Italic"]))
        style_obj.underline = bool(int(style_def["Underline"]))
        style_obj.strikeout = bool(int(style_def["StrikeOut"]))
        style_obj.scalex = float(style_def["ScaleX"])
        style_obj.scaley = float(style_def["ScaleY"])
        style_obj.spacing = float(style_def["Spacing"])
        style_obj.angle = float(style_def["Angle"])
        style_obj.borderstyle = int(style_def["BorderStyle"])
        style_obj.outline = float(style_def["Outline"])
        style_obj.shadow = float(style_def["Shadow"])
        style_obj.alignment = int(style_def["Alignment"])
        style_obj.marginl = int(style_def["MarginL"])
        style_obj.marginr = int(style_def["MarginR"])
        style_obj.marginv = int(style_def["MarginV"])
        style_obj.encoding = int(style_def["Encoding"])

        # Add the style with its name from the definition
        subs.styles[style_def["Name"]] = style_obj
    return subs

def _process_rectangle_per_word_line(subs=None, video_height=None, position_middle=None):
    # Apply the animation and style to all dialogue lines
    main_style_name = style_definition_map["main"]["Name"]

    for line in subs:
        # 1. Update the style to use the main style name from the mapping
        line.style = main_style_name

        # 2. Check if the line is not a comment and has text
        if line.is_comment or not line.text.strip():
            continue

        # Apply karaoke rectangle animation
        enhanced_text = process_karaoke_rectangle_line(line.text, subs, main_style_name)
        if enhanced_text:
            line.text = enhanced_text

    # Define a reference height for which the subtitle styles were designed
    REFERENCE_HEIGHT = 600  # was 3412, which was too large and caused fonts to shrink
    scale_factor = video_height / REFERENCE_HEIGHT

    # Override alignment for all styles and scale font sizes
    alignment = 5 if position_middle else 2  # 5 for Middle Center, 2 for Bottom Center
    for style in subs.styles.values():
        style.alignment = alignment
        if scale_factor != 1.0:
            style.fontsize = round(style.fontsize * scale_factor)
            style.outline = round(style.outline * scale_factor, 2)
            style.shadow = round(style.shadow * scale_factor, 2)
            style.marginl = int(style.marginl * scale_factor)
            style.marginr = int(style.marginr * scale_factor)
            style.marginv = int(style.marginv * scale_factor)
    return subs



def apply_subs_on_ass_file(ass_file=None, output_file=None, video_width=None, video_height=None, position_middle=None):
    pass
    subs = _apply_style_on_subs(ass_file=ass_file, output_file=output_file, video_width=video_width, video_height=video_height, position_middle=position_middle)
    subs = _process_rectangle_per_word_line(subs=subs, video_height=video_height, position_middle=position_middle)
    subs.save(output_file, encoding="utf-8")
    print(f"Saved ASS file to {output_file}")
