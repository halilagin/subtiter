# flake8: noqa: E501

import matplotlib.pyplot as plt
import matplotlib.animation as animation
from PIL import Image
import numpy as np

# --- Configuration ---
# NOTE: Replace 'image_b9cfdc.jpg' with the actual path to your image file.
IMAGE_PATH = 'animation.jpeg'
ANIMATION_DURATION = 5000  # 5000 milliseconds (5 seconds)
FPS = 30  # Frames per second
NUM_FRAMES = int(ANIMATION_DURATION / 1000 * FPS)

# --- 1. Load and Segment the Image ---
try:
    # Open the image using PIL
    img = Image.open(IMAGE_PATH)
except FileNotFoundError:
    print(f"Error: Image file not found at {IMAGE_PATH}")
    # Create a placeholder image if the original is missing for demonstration
    img = Image.new('RGB', (600, 400), color='gray') 
    
img_data = np.array(img)
H, W, _ = img_data.shape

# Calculate the width of each vertical third
third_width = W // 3

# Segment the image into three vertical parts (as NumPy arrays)
segments = [
    img_data[:, 0:third_width, :],          # Left third
    img_data[:, third_width:2*third_width, :], # Middle third
    img_data[:, 2*third_width:W, :]         # Right third (to handle remainder)
]

# Get the initial position for each segment
initial_positions = [
    (0, 0),        # Left segment starts at (0, 0)
    (third_width, 0), # Middle segment starts at (third_width, 0)
    (2*third_width, 0) # Right segment starts at (2*third_width, 0)
]

# --- 2. Define Animation Parameters ---

# Total horizontal separation distance for step 2 (e.g., 20% of the image width)
sep_distance = W * 0.20

# Final vertical scale factor for step 3 (0.5 for half height)
final_v_scale = 0.5

# Calculate the end state for each segment's position and scale
end_states = [
    # (x_offset, y_offset, v_scale)
    (-sep_distance, 0, final_v_scale),  # Left moves left
    (0, 0, final_v_scale),              # Middle stays put
    (sep_distance, 0, final_v_scale)    # Right moves right
]

# --- 3. Animation Function ---

def update_frame(frame_number):
    """
    Updates the plot for each frame of the animation.
    """
    # Calculate the progress (0.0 to 1.0) for the current frame
    progress = frame_number / (NUM_FRAMES - 1)
    
    # Clear the previous plot content
    ax.clear()
    ax.set_xlim(0 - sep_distance, W + sep_distance)
    ax.set_ylim(H * final_v_scale, 0) # Adjust Y-limit for half-height and inverted axis

    # Set up the plot aesthetics
    ax.axis('off') # Hide axes

    # Iterate over each of the three segments
    for i, segment in enumerate(segments):
        
        # --- Interpolation ---
        
        # 1. Horizontal Separation (Steps 1 & 2)
        # We animate the X position from the initial to the final offset
        start_x_offset = 0
        end_x_offset = end_states[i][0]
        current_x_offset = start_x_offset + (end_x_offset * progress)
        
        # 2. Vertical Halving (Step 3)
        # We animate the vertical scaling from 1.0 (full height) to 0.5 (half height)
        start_v_scale = 1.0
        end_v_scale = end_states[i][2]
        current_v_scale = start_v_scale + ((end_v_scale - start_v_scale) * progress)

        # --- Transform and Plot ---
        
        # Calculate the new height based on the current scale
        new_h = int(segment.shape[0] * current_v_scale)
        
        # Create a PIL image from the segment array to resize it
        segment_pil = Image.fromarray(segment)
        
        # Resize only the height, keeping width proportional to the segment's width
        resized_segment_pil = segment_pil.resize((segment.shape[1], new_h))
        resized_segment = np.array(resized_segment_pil)

        # Calculate the new position for plotting
        x_pos = initial_positions[i][0] + current_x_offset
        
        # Y position centers the smaller image in the final half-height
        # (H - new_h) / 2 centers the smaller segment vertically
        y_pos = (H - new_h) / 2 

        # Plot the resized segment at the calculated position
        ax.imshow(resized_segment, extent=[
            x_pos, x_pos + resized_segment.shape[1], 
            y_pos + resized_segment.shape[0], y_pos # Y-axis is inverted
        ])
    
    # Set the title for context
    if progress < 0.5:
        title_text = f"Separating and Shrinking... (Progress: {progress*100:.1f}%)"
    else:
        title_text = f"Animation Complete! (Progress: {progress*100:.1f}%)"
        
    ax.set_title(title_text)


# --- 4. Create and Run the Animation ---

# Setup the figure and axes
fig, ax = plt.subplots(figsize=(10, 6))

# Create the animation object
ani = animation.FuncAnimation(
    fig, 
    update_frame, 
    frames=NUM_FRAMES, 
    interval=1000/FPS, # Delay between frames in ms
    repeat=False # Run once
)

# Display the animation
print("Displaying animation... Close the window to continue.")
plt.show()
print("Animation finished.")