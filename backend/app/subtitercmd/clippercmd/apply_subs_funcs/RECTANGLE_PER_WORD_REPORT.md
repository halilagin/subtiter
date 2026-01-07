# Rectangle Per Word Animation - Implementation Report

## Overview
This report documents the implementation and debugging of the `rectangle_per_word` animation style for ASS subtitle files. This animation creates a karaoke-style effect where each word is highlighted with a rounded rectangle background as it is being spoken.

## Animation Requirements
The animation was designed with the following specifications:

1. **Constant Font Size**: All words maintain the same font size throughout the animation (no scaling/popping effects)
2. **Active Word Highlighting**: The word being articulated appears highlighted within a rounded rectangle
3. **Clean Transitions**: When the next word becomes active, the previous word returns to its default style (no rectangle)
4. **Consistent Styling**: All text is bold white, with black rounded rectangles for highlighting

## Implementation Details

### File Location
`app/subtitercmd/clippercmd/apply_subs_funcs/rectangle_per_word.py`

### Key Components

#### 1. Style Definition
The animation uses two styles defined in `style_definition_map`:
- `KaraokePopupRectangle_Main`: Main style for subtitle text
- `KaraokePopupRectangle_Highlight`: Highlight style (currently same as main)

**Critical Color Settings:**
```python
"PrimaryColour": "&H00FFFFFF",    # White text
"SecondaryColour": "&H00FFFFFF",  # White (not red!)
"OutlineColour": "&H00000000",    # Black outline
"BackColour": "&H00000000",       # Black background
"Bold": -1,                       # Bold font enabled
```

#### 2. Animation States
Each word transitions through three states:

**Initial State (Before Speaking):**
- White text
- Normal size (100%)
- No rectangle (transparent border)

**Active State (Being Spoken):**
- White text
- Normal size (100% - no scaling)
- Visible rounded rectangle (opaque border with `\be1` for rounded effect)
- Black background color

**Post-Active State (After Speaking):**
- White text
- Normal size (100%)
- No rectangle (transparent border returns)

#### 3. ASS Override Tags Used
- `\c&H00FFFFFF`: Text color (white)
- `\fscx100\fscy100`: Font scale (kept at 100% always)
- `\bord8`: Border width (creates the rectangle)
- `\3c&H00000000`: Border color (black)
- `\3a&H00`: Border alpha (opaque for visible rectangle)
- `\3a&HFF`: Border alpha (transparent for no rectangle)
- `\be1`: Blur edges (creates rounded corners)
- `\be0`: No blur (sharp edges)
- `\shad0`: No shadow
- `\k<duration>`: Karaoke timing tag

## Critical Bugs Fixed

### Bug 1: Red Color Appearing in Subtitles
**Problem:** Red color was appearing in the subtitles despite setting all colors to white.

**Root Cause:** The `SecondaryColour` in the style definition was set to `&Hffffff` which was being parsed as `&H000000FF` (red in AABBGGRR format).

**Solution:** Changed `SecondaryColour` to `&H00FFFFFF` (proper white color).

### Bug 2: pysubs2 Attribute Name Mismatch
**Problem:** Even after fixing the color definition, red color persisted in the output.

**Root Cause:** The code was using Python property names with underscores (`secondary_color`, `primary_color`, etc.) but pysubs2 `SSAStyle` object expects **all lowercase attribute names without underscores**.

**How to Verify Correct Attribute Names:**
```python
import pysubs2
style = pysubs2.SSAStyle()
# List all color-related attributes
for attr in dir(style):
    if 'color' in attr.lower():
        print(attr)
# Output shows: backcolor, outlinecolor, primarycolor, secondarycolor, tertiarycolor
```

**Incorrect (with underscores):**
```python
style_obj.primary_color = parse_ass_color(...)
style_obj.secondary_color = parse_ass_color(...)
style_obj.outline_color = parse_ass_color(...)
style_obj.back_color = parse_ass_color(...)
```

**Correct (all lowercase, no underscores):**
```python
style_obj.primarycolor = parse_ass_color(...)
style_obj.secondarycolor = parse_ass_color(...)
style_obj.outlinecolor = parse_ass_color(...)
style_obj.backcolor = parse_ass_color(...)
```

**Why This Matters:** When using incorrect attribute names with underscores, Python's dynamic attribute assignment creates NEW attributes instead of setting the existing pysubs2 attributes. This means:
- `style_obj.secondary_color = Color(...)` creates a new attribute that pysubs2 ignores
- The actual `secondarycolor` attribute remains at its default value (red: `&H000000FF`)
- When the file is saved, pysubs2 uses the default red color instead of your white color

**Solution:** Updated all color attribute assignments to use the correct lowercase names without underscores.

### Bug 3: Font Size Scaling (Pop-out Effect)
**Problem:** Words were enlarging when highlighted, creating an unwanted "pop-out" effect.

**Root Cause:** The active state was using `\fscx150\fscy150` to scale text to 150%.

**Solution:** Changed all scaling to `\fscx100\fscy100` to maintain constant font size.

### Bug 4: Highlight Color from Style
**Problem:** The code was extracting highlight color from the Highlight style, which could introduce unwanted colors.

**Solution:** Removed the color extraction logic and directly use white color (`&H00FFFFFF`) defined in the function.

## ASS Color Format Reference

ASS colors use the format `&HAABBGGRR` where:
- `AA` = Alpha channel (00 = opaque, FF = transparent)
- `BB` = Blue component (00-FF)
- `GG` = Green component (00-FF)
- `RR` = Red component (00-FF)

**Common Colors:**
- White: `&H00FFFFFF` (AA=00, BB=FF, GG=FF, RR=FF)
- Black: `&H00000000` (AA=00, BB=00, GG=00, RR=00)
- Red: `&H000000FF` (AA=00, BB=00, GG=00, RR=FF)
- Green: `&H0000FF00` (AA=00, BB=00, GG=FF, RR=00)
- Blue: `&H00FF0000` (AA=00, BB=FF, GG=00, RR=00)

## Testing

### Test Command
```bash
cd /Users/halilagin/root/github/subtiter.ai/backend/app/subtitercmd
bash test_ass.sh
```

### Expected Output
The output ASS file (`/tmp/segment_1.ass`) should have:
```
Style: KaraokePopupRectangle_Main,Arial,58,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,3,2.4,0,5,36,36,60,1
```

All color values should be:
- PrimaryColour: `&H00FFFFFF` (white)
- SecondaryColour: `&H00FFFFFF` (white)
- OutlineColour: `&H00000000` (black)
- BackColour: `&H00000000` (black)

## Future Maintenance Notes

1. **pysubs2 Attribute Names**: Always use lowercase without underscores for color attributes
2. **Color Format**: Always use 8-character hex format `&HAABBGGRR` for colors
3. **Font Scaling**: Keep `\fscx` and `\fscy` at 100 to maintain constant size
4. **Rounded Corners**: Use `\be1` for rounded rectangle effect, `\be0` to disable
5. **Border Width**: `\bord8` creates the rectangle; adjust this value to change rectangle thickness

## Related Files
- `apply_subs_on_ass_file.py`: Main entry point that calls this animation
- `karaoke.py`: Similar karaoke animation without rectangles
- `karaoke_rectangle.py`: Alternative karaoke rectangle implementation
- `deep_diver.py`: Another animation style
- `popular_styles.py`: Collection of popular animation styles

## Date
Created: November 8, 2025

## Contributors
- Implementation and debugging session documented

