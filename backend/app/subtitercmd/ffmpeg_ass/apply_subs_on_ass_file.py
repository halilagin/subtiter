# flake8: noqa: E501
import re
import click
import os
import pysubs2





# Correct ASS V4+ Styles format with all required fields
BASE_STYLES = (
    "[V4+ Styles]\n"
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
)

# --- BASE FORMAT DEFINITION ---


DIGITAL_GLOW = (
    BASE_STYLES +
    "Style: DigitalGlow,Roboto Black,72,&H00FFFFFF,&H000000FF,&H00FF8C00,&H80000000,1,0,0,0,100,100,1.5,0,1,5,4,2,30,30,40,1\n"
)
# 1. Clean Bold Style (Classic, Readable, White/Orange Accent, Subtle Shadow)
CLEAN_BOLD_STYLES = (
    BASE_STYLES +
    "Style: CleanBold_Main,Roboto Bold,58,&H00FFFFFF,&H000000FF,&H00000000,&H00181818,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,70,1\n"
    "Style: CleanBold_Highlight,Roboto Bold,58,&H0000A0FF,&H000000FF,&H00000000,&H00181818,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,70,1\n" # Orange Highlight
)

# 2. Neon Punch Style (Electric Green/Magenta Highlight, High Shadow)
NEON_PUNCH_STYLES = (
    BASE_STYLES +
    "Style: NeonPunch_Main,Oswald Bold,65,&H0032CD32,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,90,1\n"  # Electric Green Main
    "Style: NeonPunch_Highlight,Oswald Bold,65,&H00FF00FF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,90,1\n" # Magenta Highlight
)

# 3. Retro Typewriter Style (Monospace, Smaller, Grey/Purple Accent, High Position)
RETRO_TYPEWRITER_STYLES = (
    BASE_STYLES +
    "Style: RetroType_Main,Courier New Bold,48,&H00C0C0C0,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,120,1\n" # Grey Main, High Margin
    "Style: RetroType_Highlight,Courier New Bold,48,&H008000FF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,120,1\n" # Purple Highlight
)

# 4. Elegant Serif Style (Georgia Font, Left Aligned, White/Blue Accent)
ELEGANT_SERIF_STYLES = (
    BASE_STYLES +
    "Style: ElegantSerif_Main,Georgia,55,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,1,60,30,60,1\n" # Left Alignment (1), large Left Margin
    "Style: ElegantSerif_Highlight,Georgia,55,&H00FF8000,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,1,60,30,60,1\n" # Blue Highlight
)

# 5. Big Blocky Comic Style (Impact Font, Very Large, Yellow/Red Accent, Thick Outline, Right Aligned)
BIG_BLOCKY_COMIC_STYLES = (
    BASE_STYLES +
    "Style: BigBlockyComic_Main,Impact,75,&H00FFFF00,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,3,30,60,70,1\n" # Yellow Main, Right Alignment (3), Thick Outline (5)
    "Style: BigBlockyComic_Highlight,Impact,75,&H000000FF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,3,30,60,70,1\n" # Red Highlight
)

# 1. Beasty Style (Large, White/Yellow, Bottom-Center)
BEASTY_STYLES = (
    BASE_STYLES +
    "Style: Beasty_Main,Arial Black,68,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,80,1\n"
    "Style: Beasty_Highlight,Arial Black,68,&H0000FFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,80,1\n" # Yellow Highlight
)

# 2. Deep Diver Style (White text, Black border, Shadow/Glow effect)
DEEP_DIVER_STYLES = (
    BASE_STYLES +
    "Style: DeepDiver_Main,Marker Felt,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,170,100,-2,0,1,2,2,2,30,30,80,1\n"  # White Main with shadow, tight spacing, very bold (ScaleX=170)
    "Style: DeepDiver_Highlight,Marker Felt,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,170,100,-2,0,1,2,2,2,30,30,80,1\n" # White Highlight with shadow, tight spacing, very bold (ScaleX=170)
)

# 3. Pod P Style (Magenta/Pink, Slightly Higher Position)
POD_P_STYLES = (
    BASE_STYLES +
    "Style: PodP_Main,Arial Black,65,&H00C0C0C0,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,60,1\n"  # White/Grey Main
    "Style: PodP_Highlight,Arial Black,65,&H00FF00FF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,60,1\n" # Magenta Highlight
)

# 4. Karaoke Style (Classic Karaoke Look - Green highlight text)
KARAOKE_STYLES = (
    BASE_STYLES +
    "Style: Karaoke_Main,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n"  # Green Main
    "Style: Karaoke_Highlight,Arial,48,&H00FF00,&Hffffff,&H000000,&H80000000,0,0,0,0,100,100,0,0,3,2,0,2,30,30,50,1\n" # Green Highlight
)

# 5. Youshael Style (Cyan/Light Blue - Modern, Clean)
YOUSHAEL_STYLES = (
    BASE_STYLES +
    "Style: Youshael_Main,Arial Black,65,&H00FFFF00,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,60,1\n"  # Cyan Main
    "Style: Youshael_Highlight,Arial Black,65,&H00FFFF00,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,60,1\n" # Cyan Highlight
)

# 6. Mozi Style (White with Green Highlights - Similar to Beasty)
MOZI_STYLES = (
    BASE_STYLES +
    "Style: Mozi_Main,Arial Black,70,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,70,1\n"  # White Main
    "Style: Mozi_Highlight,Arial Black,70,&H0000FF00,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,70,1\n" # Green Highlight
)

STYLE_MAPPING = {
    # Original styles
    # "clean_bold": {"styles": CLEAN_BOLD_STYLES, "main": "CleanBold_Main"},
    # "neon_punch": {"styles": NEON_PUNCH_STYLES, "main": "NeonPunch_Main"},
    # "retro_typewriter": {"styles": RETRO_TYPEWRITER_STYLES, "main": "RetroType_Main"},
    # "elegant_serif": {"styles": ELEGANT_SERIF_STYLES, "main": "ElegantSerif_Main"},
    # "big_blocky_comic": {"styles": BIG_BLOCKY_COMIC_STYLES, "main": "BigBlockyComic_Main"},
    # # UI-visible styles (from the latest image)
    # "karaoke": {"styles": KARAOKE_STYLES, "main": "Karaoke_Main"},
    # "beasty": {"styles": BEASTY_STYLES, "main": "Beasty_Main"},
    "deep_diver": {"styles": DEEP_DIVER_STYLES, "main": "DeepDiver_Main"},
    # "pod_p": {"styles": POD_P_STYLES, "main": "PodP_Main"},
    # "youshael": {"styles": YOUSHAEL_STYLES, "main": "Youshael_Main"},
    # "mozi": {"styles": MOZI_STYLES, "main": "Mozi_Main"},
    # "digital_glow": {"styles": DIGITAL_GLOW, "main": "DigitalGlow"},
}

# Animation presets
def process_karaoke_line(line_text, subs, main_style_name):
    """
    Process a karaoke line to add word-by-word highlighting effects.
    
    Args:
        line_text: The text of the subtitle line
        subs: The pysubs2 SSAFile object containing styles
        main_style_name: The name of the main style being used
    
    Returns:
        Enhanced text with karaoke effects, or None if no karaoke tags found
    """
    # Get highlight color from the Highlight style
    highlight_style_name = main_style_name.replace("_Main", "_Highlight")
    if highlight_style_name not in subs.styles:
        # Fallback: use the main style name itself if no "_Main" suffix
        highlight_style_name = main_style_name + "_Highlight"
    
    # Convert pysubs2 Color to ASS color format &HAABBGGRR
    if highlight_style_name in subs.styles:
        color_obj = subs.styles[highlight_style_name].primary_color
        highlight_color = f"&H{color_obj.a:02X}{color_obj.b:02X}{color_obj.g:02X}{color_obj.r:02X}"
    else:
        # Fallback color if highlight style not found
        highlight_color = "&H00FFFF00"
    
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
        
        # Capitalize the word text for display
        display_text = word_text.upper()
        
        # Each word explicitly starts at normal size (100%) with gray color
        # Then only during its karaoke time, it changes to bright color, enlarges more and shows background
        # Key: Set explicit base state, then add transformation only for active period
        # \fscx\fscy = scale (set to 100% = normal)
        # \c or \1c = primary text color
        # \bord = border/outline width (2 is default from style)
        # \shad = shadow depth (0 = no shadow for background effect)
        # \4a = shadow alpha (FF = fully transparent, 00 = fully opaque)
        # \t = transformation only active during specified time range
        word_tag = (
            r"{\fscx100\fscy100\c&HC0C0C0&\bord2\shad0\4a&HFF&" +  # Explicit normal state with gray color
            r"\k" + str(duration_cs) + 
            r"\t(" + str(t_start_ms) + r"," + str(t_end_ms) + 
            r",\c" + highlight_color + r"\fscx150\fscy150\bord8\shad2\4c&H000000&\4a&H00&)}"  # Change to highlight color + enlarge to 150% + background during karaoke time
        )
        enhanced_text += word_tag + display_text
        cumulative_time_cs += duration_cs
    
    return enhanced_text


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
    # Get highlight color from the Highlight style
    highlight_style_name = main_style_name.replace("_Main", "_Highlight")
    if highlight_style_name not in subs.styles:
        # Fallback: use the main style name itself if no "_Main" suffix
        highlight_style_name = main_style_name + "_Highlight"
    
    # Convert pysubs2 Color to ASS color format &HAABBGGRR
    if highlight_style_name in subs.styles:
        color_obj = subs.styles[highlight_style_name].primary_color
        highlight_color = f"&H{color_obj.a:02X}{color_obj.b:02X}{color_obj.g:02X}{color_obj.r:02X}"
    else:
        # Fallback color if highlight style not found
        highlight_color = "&H00FFFF00"
    
    # Define background color (dark background for contrast)
    background_color = "&H00000000"  # Black background
    
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
        
        # Capitalize the word text for display
        display_text = word_text.upper()
        
        # --- Define styles for different states ---
        
        # 1. Active state (word is being sung): large, highlighted, with rectangle
        active_style = (
            r",\c" + highlight_color + 
            r"\fscx150\fscy150" + 
            r"\bord8\3c" + background_color + r"&\3a&H00" + # Opaque border as rectangle
            r"&\shad0"
        )
        
        # 2. Post-active state (word has been sung): highlighted, but normal size and no rectangle
        post_active_style = (
            r",\c" + highlight_color +
            r"\fscx100\fscy100" +
            r"\bord2\3a&HFF" + # Transparent border
            r"&\shad0"
        )

        # --- Construct the final tag for the word ---
        word_tag = (
            # Initial state: gray, normal size, no rectangle
            r"{\fscx100\fscy100\c&HC0C0C0&\bord2\3c&H000000&\3a&HFF&\shad0\4a&HFF&" +
            # Karaoke timing
            r"\k" + str(duration_cs) +
            # Transformation for active state (gradual fade-in)
            r"\t(" + str(t_start_ms) + r"," + str(t_end_ms) + active_style + r")" +
            # Transformation for post-active state (instant removal of rectangle)
            r"\t(" + str(t_end_ms) + r"," + str(t_end_ms) + post_active_style + r")}"
        )
        enhanced_text += word_tag + display_text
        cumulative_time_cs += duration_cs
    
    return enhanced_text



def process_deep_diver_line(line_text, subs, main_style_name):
    """
    Process a karaoke line with white text, black borders, and white glow effect.
    Active words get enhanced glow using blur effect.
    """
    if r'{\k' not in line_text and r'{\\k' not in line_text:
        return None

    karaoke_pattern = r'\{\\?k(\d+)\}([^\{]*)'
    matches = re.findall(karaoke_pattern, line_text)

    if not matches:
        return None

    enhanced_text = ""
    cumulative_time_cs = 0

    for duration_str, word_text in matches:
        duration_cs = int(duration_str)
        t_start_ms = cumulative_time_cs * 10
        t_end_ms = (cumulative_time_cs + duration_cs) * 10
        display_text = word_text.upper()

        # Style for the active word (enhanced cloud-like glow)
        # Using only blur for omnidirectional glow effect, no directional shadow
        active_style = r",\blur50\4c&HFFFFFF&"  # Very strong omnidirectional cloud-like glow for active word

        # Construct the tag for each word
        # White text with black border, strong blur for omnidirectional cloud-like glow effect
        # No \shad parameter to avoid directional shadowing
        # Using Marker Felt (casual handwritten font) with tight letter spacing (-2)
        word_tag = (
            r"{\fnMarker Felt\fsp-2\c&HFFFFFF&\bord20\3c&H000000&\blur30\4c&HFFFFFF&" +
            r"\k" + str(duration_cs) +
            r"\t(" + str(t_start_ms) + r"," + str(t_end_ms) + active_style + r")}"
        )
        
        enhanced_text += word_tag + display_text
        cumulative_time_cs += duration_cs

    return enhanced_text


def get_animation_tag(animation, video_width, video_height):
    """
    Generate animation tags based on the animation type.
    
    Args:
        animation: Animation type (e.g., "slide_up", "pop_out", "fade_in", "none")
        video_width: Video width in pixels
        video_height: Video height in pixels
    
    Returns:
        Animation tag string for ASS format
    """
    x_center = video_width // 2
    y_final = video_height - 100  # 100 pixels from bottom
    y_start = video_height + 100  # Start 100 pixels below screen
    
    animations = {
        # "slide_up": r"{" + f"\\move({x_center}, {y_start}, {x_center}, {y_final}, 0, 300)" + r"}",
        # "slide_down": r"{" + f"\\move({x_center}, -100, {x_center}, {y_final}, 0, 300)" + r"}",
        # "slide_left": r"{" + f"\\move({video_width + 100}, {y_final}, {x_center}, {y_final}, 0, 300)" + r"}",
        # "slide_right": r"{" + f"\\move(-100, {y_final}, {x_center}, {y_final}, 0, 300)" + r"}",
        # "fade_in": r"{\fad(300,0)}",
        # "pop_out": r"{\t(0,200,\fscx120\fscy120)\t(200,400,\fscx100\fscy100)}",
        # "zoom_in": r"{\t(0,400,\fscx100\fscy100)\fscx50\fscy50}",
        # "bounce": r"{" + f"\\move({x_center}, {y_start}, {x_center}, {y_final}, 0, 300)\\t(300,350,\\frz5)\\t(350,400,\\frz-5)\\t(400,450,\\frz0)" + r"}",
        # "karaoke_popup": "KARAOKE",  # Special marker for karaoke word-by-word highlighting
        # "karaoke_popup_rectangle": "KARAOKE_RECTANGLE",  # Special marker for karaoke word-by-word highlighting
        "deep_diver": "DEEP_DIVER",  # Special marker for deep diver word-by-word highlighting
        # "none": "",
    }
    
    if animation not in animations:
        raise ValueError(f"Animation '{animation}' not found. Available animations: {list(animations.keys())}")
    
    return animations[animation]

def _apply_subs_on_ass_file(ass_file, output_file, style_name="digital_glow", animation="slide_up", video_width=1280, video_height=3412):
    # Load the existing ASS file
    
    subs = pysubs2.load(ass_file, encoding="utf-8")
    
    # Set the playback resolution to match the video
    subs.info["PlayResX"] = str(video_width)
    subs.info["PlayResY"] = str(video_height)

    # Get the style configuration from the mapping
    if style_name not in STYLE_MAPPING:
        raise ValueError(f"Style '{style_name}' not found in STYLE_MAPPING. Available styles: {list(STYLE_MAPPING.keys())}")
    
    style_config = STYLE_MAPPING[style_name]
    style_definitions = style_config["styles"]
    main_style_name = style_config["main"]
    
    # Clear existing styles and add new ones from the configuration
    subs.styles.clear()
    
    # Parse style definitions and add them to subs
    if isinstance(style_definitions, str):
        # Parse the style definitions string
        lines = style_definitions.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('Style: '):
                # Parse the style line
                style_line = line[7:]  # Remove "Style: " prefix
                parts = [p.strip() for p in style_line.split(',')]
                if len(parts) >= 23:
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
                    
                    style_obj = pysubs2.SSAStyle()
                    style_obj.fontname = parts[1]
                    style_obj.fontsize = float(parts[2])
                    style_obj.primary_color = parse_ass_color(parts[3])
                    style_obj.secondary_color = parse_ass_color(parts[4])
                    style_obj.outline_color = parse_ass_color(parts[5])
                    style_obj.back_color = parse_ass_color(parts[6])
                    style_obj.bold = bool(int(parts[7]))
                    style_obj.italic = bool(int(parts[8]))
                    style_obj.underline = bool(int(parts[9]))
                    style_obj.strikeout = bool(int(parts[10]))
                    style_obj.scalex = float(parts[11])
                    style_obj.scaley = float(parts[12])
                    style_obj.spacing = float(parts[13])
                    style_obj.angle = float(parts[14])
                    style_obj.borderstyle = int(parts[15])
                    style_obj.outline = float(parts[16])
                    style_obj.shadow = float(parts[17])
                    style_obj.alignment = int(parts[18])
                    style_obj.marginl = int(parts[19])
                    style_obj.marginr = int(parts[20])
                    style_obj.marginv = int(parts[21])
                    style_obj.encoding = int(parts[22])
                    
                    # Add the style with its name
                    subs.styles[parts[0]] = style_obj

    # Get the animation tag based on the animation parameter
    ANIMATION_TAG = get_animation_tag(animation, video_width, video_height)

    # Apply the animation and style to all dialogue lines
    for line in subs:
        # 1. Update the style to use the main style name from the mapping
        line.style = main_style_name
        
        # 2. Prepend the animation tag to the line's text
        # Check if the line is not a comment and has text
        if line.is_comment or not line.text.strip():
            continue

        # Special handling for karaoke animation
        if ANIMATION_TAG == "KARAOKE":
            enhanced_text = process_karaoke_line(line.text, subs, main_style_name)
            if enhanced_text:
                line.text = enhanced_text
        elif ANIMATION_TAG == "KARAOKE_RECTANGLE":
            enhanced_text = process_karaoke_rectangle_line(line.text, subs, main_style_name)
            if enhanced_text:
                line.text = enhanced_text

        elif ANIMATION_TAG == "DEEP_DIVER":
            enhanced_text = process_deep_diver_line(line.text, subs, main_style_name)
            if enhanced_text:
                line.text = enhanced_text
    
    subs.save(output_file, encoding="utf-8")
    
    # Fix SecondaryColour for DeepDiver styles (pysubs2 always saves it as red)
    if style_name == "deep_diver":
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()
        # Replace red SecondaryColour with white for DeepDiver styles
        content = content.replace(
            'Style: DeepDiver_Main,Marker Felt,72,&H00FFFFFF,&H000000FF,',
            'Style: DeepDiver_Main,Marker Felt,72,&H00FFFFFF,&H00FFFFFF,'
        )
        content = content.replace(
            'Style: DeepDiver_Highlight,Marker Felt,72,&H00FFFFFF,&H000000FF,',
            'Style: DeepDiver_Highlight,Marker Felt,72,&H00FFFFFF,&H00FFFFFF,'
        )
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)


@click.command("apply-subs-on-ass-file")
@click.option(
    '--ass-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to the ASS file to apply subs to."
)
@click.option(
    '--style-name',
    required=True,
    type=str,
    help="Subs name to apply."
)
@click.option(
    '--animation',
    required=False,
    type=str,
    default="slide_up",
    help="Animation type (slide_up, slide_down, slide_left, slide_right, fade_in, pop_out, zoom_in, bounce, karaoke_popup, none). Default: slide_up."
)
@click.option(
    '--output-file',
    required=False,
    type=click.Path(),
    help="Output text file path."
)
@click.option(
    '--video-width',
    required=False,
    type=int,
    default=1280,
    help="Video width in pixels (default: 1280)."
)
@click.option(
    '--video-height',
    required=False,
    type=int,
    default=3412,
    help="Video height in pixels (default: 3412)."
)
def apply_subs_on_ass_file_command(ass_file, output_file, style_name, animation, video_width, video_height):
    _apply_subs_on_ass_file(ass_file, output_file, style_name, animation, video_width, video_height)
    





if __name__ == '__main__':
    @click.group()
    def apply_subs_on_ass_file_group():
        pass
    apply_subs_on_ass_file_group.add_command(apply_subs_on_ass_file_command)
    apply_subs_on_ass_file_group()