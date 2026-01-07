import re
import pysubs2


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


def _apply_subs_on_ass_file(ass_file, output_file, style_name, style_config, video_width, video_height, position_middle):
    """
    Apply deep_diver animation style to ASS subtitle file.
    """
    # Extract style configuration
    style_definitions = style_config["styles"]
    main_style_name = style_config["main_style"]

    subs = pysubs2.load(ass_file, encoding="utf-8")

    # Set the playback resolution to match the video
    subs.info["PlayResX"] = str(video_width)
    subs.info["PlayResY"] = str(video_height)

    if style_name.lower().strip() != "default":
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

        # Apply the animation and style to all dialogue lines
        for line in subs:
            # 1. Update the style to use the main style name from the mapping
            line.style = main_style_name

            # 2. Check if the line is not a comment and has text
            if line.is_comment or not line.text.strip():
                continue

            # Apply deep diver animation
            enhanced_text = process_deep_diver_line(line.text, subs, main_style_name)
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
