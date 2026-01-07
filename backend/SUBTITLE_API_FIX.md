# Subtitle API Validation Fix

## Problem
The frontend was sending data that didn't match the backend API's expected format, causing validation errors:

1. **`size` field**: Frontend sent `"Medium"` (string), but API expected an integer (e.g., 48)
2. **`subtitle_box_background_color` field**: Frontend sent `null`, but API expected a string

## Error Response (Before Fix)
```json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["body", "subtitle_configuration", 0, "size"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "Medium"
    },
    {
      "type": "string_type",
      "loc": ["body", "subtitle_configuration", 0, "subtitle_box_background_color"],
      "msg": "Input should be a valid string",
      "input": null
    }
  ]
}
```

## Solution
Modified `app/klipperscmd/clippercmd/model/short_config_model.py`:

### 1. Made `subtitle_box_background_color` Optional
Changed from:
```python
subtitle_box_background_color: str = Field(default="&H00EBCE87", ...)
```

To:
```python
subtitle_box_background_color: Optional[str] = Field(default="&H00EBCE87", ...)
```

### 2. Added Field Validators
Added two Pydantic validators to handle frontend data format:

#### Size Validator
Converts string size values to integers:
- "Small" → 36
- "Medium" → 48
- "Large" → 60
- "Extra Large" / "XL" → 72
- Unknown values → 48 (default)

```python
@field_validator('size', mode='before')
@classmethod
def convert_size_to_int(cls, v):
    if isinstance(v, str):
        size_map = {
            'small': 36,
            'medium': 48,
            'large': 60,
            'extra large': 72,
            'xl': 72,
        }
        return size_map.get(v.lower(), 48)
    return v
```

#### Background Color Validator
Handles `null` values by providing a default color:

```python
@field_validator('subtitle_box_background_color', mode='before')
@classmethod
def handle_null_background_color(cls, v):
    if v is None:
        return "&H00EBCE87"  # Default color
    return v
```

### 3. Added `field_validator` Import
Updated imports to include the validator:
```python
from pydantic import BaseModel, Field, field_validator
```

## Testing

### Manual Test with cURL
You need a valid authentication token. Get a fresh token from the frontend, then run:

```bash
curl 'http://localhost:22081/api/v1/user-subtitling/generate-subtitling/YOUR_VIDEO_ID' \
  -H 'Authorization: Bearer YOUR_FRESH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "subtitle_configuration": [
      {
        "id": "regular_Blue",
        "name": "Regular - Blue",
        "animation": "Word by word",
        "color": "Blue",
        "size": "Medium",
        "font": "Default",
        "subtitle_style": "regular",
        "subtitle_capitalization_method": "uppercase",
        "subtitle_position": "center",
        "subtitle_box_background_color": null,
        "subtitle_inactive_color": "&H00FFFFFF",
        "subtitle_active_color": "&H00F6823B"
      }
    ]
  }'
```

### Expected Success Response
```json
{
  "message": "Subtitling generation started",
  "video_id": "YOUR_VIDEO_ID"
}
```

### Test from Frontend
Simply use the frontend application to:
1. Upload a video
2. Select subtitle configurations with size as "Medium" 
3. Submit the request
4. The API should now accept the request without validation errors

## Files Modified
- `app/klipperscmd/clippercmd/model/short_config_model.py`
  - Line 2: Added `field_validator` import
  - Line 182: Made `subtitle_box_background_color` Optional
  - Lines 194-216: Added two field validators

## Notes
- The server must be restarted for changes to take effect (if not using auto-reload)
- The validators are case-insensitive for size values
- The fix is backward compatible - it still accepts integers for `size` and strings for `subtitle_box_background_color`

