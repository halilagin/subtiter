# flake8: noqa: E501
import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw

# Parameters
width, height = 500, 200
frames = []
num_frames = 90  # More frames for sequential animation
big_rect = (50, 60, 150, 140)
short_width_final = 40
short_height_final = 80
num_shorts = 3

# Colors
bg_color = (255, 255, 255)
video_color = (30, 144, 255)
short_color = (255, 165, 0)

# Animation logic
# Each short takes frames_per_short frames to emerge and move
frames_per_short = 25
delay_between_shorts = 5  # Frames to wait before next short starts emerging

for frame in range(num_frames):
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw big video rectangle
    draw.rectangle(big_rect, fill=video_color, outline=(0, 0, 0))

    # Draw each short based on timing
    for i in range(num_shorts):
        # When does this short start emerging?
        short_start_frame = i * delay_between_shorts
        short_end_frame = short_start_frame + frames_per_short
        
        # Is this short visible yet?
        if frame >= short_start_frame:
            # Calculate progress for this specific short (0 to 1)
            if frame >= short_end_frame:
                short_progress = 1.0  # Fully emerged and moved
            else:
                short_progress = (frame - short_start_frame) / frames_per_short
            
            # Position calculation
            start_x = big_rect[2]  # Right edge of big rectangle
            end_x = 250 + i * 60  # Each short ends at a different position
            current_x = start_x + (end_x - start_x) * short_progress
            
            # Size (starts small, grows to full size)
            size_scale = 0.3 + 0.7 * short_progress
            current_width = short_width_final * size_scale
            current_height = short_height_final * size_scale
            
            # Vertical position
            center_y = (big_rect[1] + big_rect[3]) / 2  # Center of big rectangle
            top = center_y - current_height / 2
            bottom = center_y + current_height / 2
            
            draw.rectangle(
                (current_x, top, current_x + current_width, bottom),
                fill=short_color, outline=(0, 0, 0), width=2
            )

    frames.append(np.array(img))

# Save as GIF
import os
output_path = os.path.join(os.path.dirname(__file__), 'video_split_animation.gif')
imageio.mimsave(output_path, frames, duration=0.05)
print(f"Animation saved to: {output_path}")
