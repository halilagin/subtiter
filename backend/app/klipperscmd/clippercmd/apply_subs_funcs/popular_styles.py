# flake8: noqa: E501
# --- BASE FORMAT DEFINITION ---
BASE_STYLES = (
    "[V4+ Styles]\n"
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
)

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


# 3. Pod P Style (Magenta/Pink, Slightly Higher Position)
POD_P_STYLES = (
    BASE_STYLES +
    "Style: PodP_Main,Arial Black,65,&H00C0C0C0,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,60,1\n"  # White/Grey Main
    "Style: PodP_Highlight,Arial Black,65,&H00FF00FF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,2,30,30,60,1\n" # Magenta Highlight
)