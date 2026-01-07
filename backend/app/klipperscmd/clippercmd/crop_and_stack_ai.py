# flake8: noqa: E501
# clipper/clippercmd/crop_and_stack.py

import json
import math
import click
import os
import subprocess
import logging
from .model.klippers_model import RecognizedFacesBBoxes
import ffmpeg
from .model.klippers_model import BoxPx
import shutil
from pydantic import BaseModel
from config import get_shorts_config
from pathlib import Path
from .extract_n_frames_from_video import _extract_n_frames_from_video
from .aws_face_recognition import _save_unique_faces, _find_face_bounding_boxes_in_images


def calculate_combined_roi(bbox1, bbox2, video_width, video_height, aspect_ratio=9/16, padding_factor=1.5):
    """
    Calculate a combined Region of Interest for two bounding boxes, ensuring a specific aspect ratio.
    """
    # Union of bboxes
    x_min = min(bbox1.Left, bbox2.Left)
    y_min = min(bbox1.Top, bbox2.Top)
    x_max = max(bbox1.Left + bbox1.Width, bbox2.Left + bbox2.Width)
    y_max = max(bbox1.Top + bbox1.Height, bbox2.Top + bbox2.Height)

    union_w = x_max - x_min
    union_h = y_max - y_min
    center_x = x_min + union_w / 2
    center_y = y_min + union_h / 2

    # Padded ROI dimensions from union center
    # Use the larger dimension of the union to define padded roi, to make it feel more spacious
    padded_dim = max(union_w, union_h) * padding_factor
    
    roi_w = padded_dim
    roi_h = padded_dim

    # Adjust to aspect ratio
    current_aspect_ratio = roi_w / roi_h # this is 1
    if current_aspect_ratio > aspect_ratio:
        # ROI is wider than target, increase height
        roi_h = roi_w / aspect_ratio
    else:
        # ROI is taller than target, increase width
        roi_w = roi_h * aspect_ratio

    # If ROI is bigger than video dimensions, scale it down
    if roi_w > video_width:
        scale = video_width / roi_w
        roi_w = video_width
        roi_h *= scale
    
    if roi_h > video_height:
        scale = video_height / roi_h
        roi_h = video_height
        roi_w *= scale

    # Calculate top-left corner
    roi_x = center_x - roi_w / 2
    roi_y = center_y - roi_h / 2

    # Clamp to video boundaries
    if roi_x < 0:
        roi_x = 0
    if roi_y < 0:
        roi_y = 0
    if roi_x + roi_w > video_width:
        roi_x = video_width - roi_w
    if roi_y + roi_h > video_height:
        roi_y = video_height - roi_h
        
    return int(roi_x), int(roi_y), int(round(roi_w)), int(round(roi_h))

def _calculate_roi_from_bbox(bbox: BoxPx, video_width: int, video_height: int, aspect_ratio: float = 9/16, padding_factor: float = 1.5) -> tuple[int, int, int, int]:
    """
    Calculates the region of interest (ROI) from a bounding box.

    Args:
        bbox: A BoxPx object representing the bounding box in pixels (Left, Top, Width, Height).
        video_width: The width of the video frame.
        video_height: The height of the video frame.
        aspect_ratio: The target aspect ratio for the ROI.
        padding_factor: The factor to expand the bounding box by.

    Returns:
        A tuple representing the ROI (x, y, width, height).
    """
    # 1. Calculate the center of the bounding box
    center_x = bbox.Left + bbox.Width / 2
    center_y = bbox.Top + bbox.Height / 2

    # 2. Determine initial ROI size based on the larger dimension of the bbox
    #    to create a spacious square crop around the face.
    padded_dim = max(bbox.Width, bbox.Height) * padding_factor
    roi_w = padded_dim
    roi_h = padded_dim

    # 3. Adjust dimensions to fit the target aspect ratio
    current_aspect_ratio = 1.0  # Since roi_w and roi_h are equal
    if current_aspect_ratio > aspect_ratio:
        # ROI is wider than target, so increase height to make it more portrait.
        # This is the typical case for aspect_ratio = 9/16.
        roi_h = roi_w / aspect_ratio
    else:
        # ROI is taller than target, so increase width.
        roi_w = roi_h * aspect_ratio
    
    # 4. Ensure the ROI fits within the video boundaries by scaling if necessary
    if roi_w > video_width or roi_h > video_height:
        width_scale = video_width / roi_w if roi_w > 0 else 1
        height_scale = video_height / roi_h if roi_h > 0 else 1
        scale = min(width_scale, height_scale)
        roi_w *= scale
        roi_h *= scale

    # 5. Calculate the top-left corner and clamp it to the video boundaries
    roi_x = center_x - roi_w / 2
    roi_y = center_y - roi_h / 2

    roi_x = max(0, min(roi_x, video_width - roi_w))
    roi_y = max(0, min(roi_y, video_height - roi_h))

    # 6. Return the region of interest with integer coordinates
    return int(roi_x), int(roi_y), int(round(roi_w)), int(round(roi_h))



class InputVideoProperties(BaseModel):
    input_video_path: str
    video_duration: float
    video_info: dict
    fps: float
    total_frames: int

def _get_video_properties(input_video_path: str):
    try:
        logging.info(f"[_get_video_properties] Probing video file: {input_video_path}")
        print(f"[_get_video_properties] Starting video probe for: {input_video_path}")
        
        if not os.path.exists(input_video_path):
            error_msg = f"Input video file not found at {input_video_path}"
            logging.error(f"[_get_video_properties] {error_msg}")
            raise FileNotFoundError(error_msg)
        
        probe = ffmpeg.probe(input_video_path)
        video_duration = float(probe['format']['duration'])
        video_info = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
        # audio_info = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)

        if video_info is None:
            error_msg = "Could not find video stream in the input file."
            logging.error(f"[_get_video_properties] {error_msg}")
            raise ValueError(error_msg)
            
        fps_str = video_info.get('avg_frame_rate', '30/1')
        if '/' in fps_str:
            num, den = map(int, fps_str.split('/'))
            fps = num / den if den != 0 else 30
        else:
            fps = float(fps_str)
        
        total_frames = int(video_duration * fps)
        
        logging.info(f"[_get_video_properties] Video properties - Duration: {video_duration}s, FPS: {fps}, Total frames: {total_frames}, Resolution: {video_info.get('width')}x{video_info.get('height')}")
        print(f"[_get_video_properties] Successfully probed video - Duration: {video_duration}s, FPS: {fps}, Frames: {total_frames}")
        
        return InputVideoProperties(input_video_path=input_video_path, 
            video_duration=video_duration, 
            video_info=video_info, 
            fps=fps, 
            total_frames=total_frames)

    except ffmpeg.Error as e:
        stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr."
        logging.error(f"[_get_video_properties] ffmpeg.probe error. stderr: {stderr}")
        print(f"[_get_video_properties] ERROR: Failed to probe video - {stderr}")
        raise RuntimeError(f"Failed to probe video file: {e}") from e

def _crop_face_id_and_save(temp_dir:str, input_video_properties: InputVideoProperties, faces_bounding_boxes_path: str, output_video_path: str, face_id: str, reference_image_time_interval: int):

    logging.info(f"[_crop_face_id_and_save] Starting crop for face_id: {face_id}")
    print(f"[_crop_face_id_and_save] Processing face_id: {face_id}")
    
    json_data = None
    with open(faces_bounding_boxes_path) as f:
        json_data = json.load(f)

    video_info = input_video_properties.video_info
    fps = input_video_properties.fps
    total_frames = input_video_properties.total_frames
    
    video_width = int(video_info['width'])
    video_height = int(video_info['height'])
    
    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Video dimensions: {video_width}x{video_height}")
    
    faces_data = RecognizedFacesBBoxes.model_validate(json_data)
    face_reference_frames = faces_data.root[face_id]

    if not face_reference_frames:
        error_msg = f"No faces found for face_id {face_id} to generate clips"
        logging.error(f"[_crop_face_id_and_save] {error_msg}")
        print(f"[_crop_face_id_and_save] ERROR: {error_msg}")
        return

    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Found {len(face_reference_frames)} reference frames")
    print(f"[_crop_face_id_and_save] Face {face_id} - Found {len(face_reference_frames)} reference frames")

    # Calculate all ROIs to determine a consistent clip size
    rois = [
        _calculate_roi_from_bbox(ref.box_px, video_width, video_height, aspect_ratio=9/8)
        for ref in face_reference_frames
    ]

    max_width = max(roi[2] for roi in rois)
    max_height = max(roi[3] for roi in rois)

    # Determine final dimensions based on max width/height while maintaining aspect ratio
    target_aspect_ratio = 9/8
    if max_height == 0:
        final_width = 0
        final_height = 0
    elif max_width / max_height > target_aspect_ratio:
        final_height = round(max_width / target_aspect_ratio)
        final_width = max_width
    else:
        final_width = round(max_height * target_aspect_ratio)
        final_height = max_height
    
    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Final crop dimensions: {final_width}x{final_height} (aspect ratio: {target_aspect_ratio})")
    print(f"[_crop_face_id_and_save] Face {face_id} - Crop size: {final_width}x{final_height}")
    
    os.makedirs(os.path.join(temp_dir, face_id), exist_ok=True)
    frames_per_clip = int(reference_image_time_interval * fps)
    if frames_per_clip == 0:
        frames_per_clip = 1
    num_clips = math.ceil(total_frames / frames_per_clip)
    
    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Will generate {num_clips} clips, {frames_per_clip} frames per clip")
    print(f"[_crop_face_id_and_save] Face {face_id} - Generating {num_clips} clips")
    
    clip_paths = [None] * num_clips


    def generate_clip(i, face_id, face_ref_frames, input_video_properties):
        input_video_path = input_video_properties.input_video_path
        fps = input_video_properties.fps
        total_frames = input_video_properties.total_frames
        frames_per_clip = int(reference_image_time_interval * fps)
        if frames_per_clip == 0:
            frames_per_clip = 1

        start_frame = i * frames_per_clip
        end_frame = start_frame + frames_per_clip
        if end_frame > total_frames:
            end_frame = total_frames
        
        if start_frame >= end_frame:
            logging.debug(f"[generate_clip] Face {face_id} clip {i} - Skipping (start_frame >= end_frame)")
            return i, None

        start_time = start_frame / fps
        duration = (end_frame - start_frame) / fps
        
        if duration <= 0:
            logging.debug(f"[generate_clip] Face {face_id} clip {i} - Skipping (duration <= 0)")
            return i, None

        # Use the last known bounding box if the current index is out of bounds
        bbox_index = min(i, len(face_ref_frames) - 1)
        bbox = face_ref_frames[bbox_index].box_px
        
        # Center the crop using the new fixed dimensions
        center_x = bbox.Left + bbox.Width / 2
        center_y = bbox.Top + bbox.Height / 2

        left = center_x - final_width / 2
        top = center_y - final_height / 2

        # Clamp to video boundaries
        left = max(0, min(left, video_width - final_width))
        top = max(0, min(top, video_height - final_height))

        logging.debug(f"[generate_clip] Face {face_id} clip {i} - Start: {start_time:.2f}s, Duration: {duration:.2f}s, Crop: {final_width}x{final_height} at ({int(left)},{int(top)})")
        
        clip_path = os.path.abspath(os.path.join(temp_dir, f'{face_id}/clip_{i}.mp4'))
        
        command = [
            'ffmpeg',
            '-ss', str(start_time),
            '-t', str(duration),
            '-i', input_video_path,
            '-vf', f'crop={final_width}:{final_height}:{int(left)}:{int(top)}',
            # '-an', # no audio
            # '-pix_fmt', 'yuv420p',
            '-loglevel', 'quiet',
            '-y',
            clip_path
        ]

        try:
            subprocess.run(command, check=True, capture_output=True)
            logging.debug(f"[generate_clip] Face {face_id} clip {i} - Successfully generated")
            return i, clip_path
        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr."
            logging.error(f"[generate_clip] Face {face_id} clip {i} - Failed: {stderr}")
            return i, e


    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Starting clip generation")
    print(f"[_crop_face_id_and_save] Face {face_id} - Processing {num_clips} clips")
    
    for i in range(num_clips):
        i, result = generate_clip(i, face_id, face_reference_frames, input_video_properties)
        if isinstance(result, str):
            clip_paths[i] = result
            if (i + 1) % 10 == 0:
                print(f"[_crop_face_id_and_save] Face {face_id} - Progress: {i + 1}/{num_clips} clips")
        elif result is None:
            # This means the clip was skipped, which is fine.
            pass
        else:
            stderr = result.stderr.decode('utf-8') if result.stderr else "No stderr."
            stdout = result.stdout.decode('utf-8') if result.stdout else "No stdout."
            logging.error(f"[_crop_face_id_and_save] Face {face_id} - Error processing clip {i}")
            logging.error(f"[_crop_face_id_and_save] Face {face_id} - FFmpeg stderr: {stderr}")
            logging.error(f"[_crop_face_id_and_save] Face {face_id} - FFmpeg stdout: {stdout}")
            print(f"[_crop_face_id_and_save] Face {face_id} - ERROR in clip {i}: {stderr}")
    
    valid_clip_paths = [p for p in clip_paths if p is not None]
    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Generated {len(valid_clip_paths)}/{num_clips} valid clips")
    print(f"[_crop_face_id_and_save] Face {face_id} - Successfully generated {len(valid_clip_paths)}/{num_clips} clips")

    if not valid_clip_paths:
        error_msg = f"No clips were generated successfully for face {face_id}"
        logging.warning(f"[_crop_face_id_and_save] {error_msg}")
        print(f"[_crop_face_id_and_save] WARNING: {error_msg}")
        return
        
    concat_file_path = os.path.join(temp_dir, f'concat_list_{face_id}.txt')
    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Creating concat file: {concat_file_path}")
    with open(concat_file_path, 'w') as f:
        for path in valid_clip_paths:
            f.write(f"file '{path}'\n")

    merged_clips_no_audio_path = os.path.join(temp_dir, f'{face_id}/merged_clips_no_audio.mp4')
    logging.info(f"[_crop_face_id_and_save] Face {face_id} - Merging clips into: {merged_clips_no_audio_path}")
    print(f"[_crop_face_id_and_save] Face {face_id} - Merging {len(valid_clip_paths)} clips...")

    try:
        command = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file_path,
            '-vcodec', 'libx264',
            '-vsync', 'vfr',
            '-an',
            '-y',
            merged_clips_no_audio_path
        ]
        logging.info(f"[_crop_face_id_and_save] Face {face_id} - Running merge command: {' '.join(command)}")
        subprocess.run(command, check=True, capture_output=True)
        logging.info(f"[_crop_face_id_and_save] Face {face_id} - Successfully merged clips")
        print(f"[_crop_face_id_and_save] Face {face_id} - Clips merged successfully")
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
        stdout = e.stdout.decode('utf-8') if e.stdout else "No stdout available"
        logging.error(f"[_crop_face_id_and_save] Face {face_id} - Failed to merge clips. Command: {' '.join(command)}")
        logging.error(f"[_crop_face_id_and_save] Face {face_id} - FFmpeg stderr: {stderr}")
        logging.error(f"[_crop_face_id_and_save] Face {face_id} - FFmpeg stdout: {stdout}")
        print(f"[_crop_face_id_and_save] Face {face_id} - ERROR merging clips: {stderr}")
        raise
        
    finally:
        pass
        

def _crop_and_stack_optimized_for_all_faces(input_video_path: str, faces_bounding_boxes_path: str, output_video_path: str,
                             reference_image_time_interval: int, resolution_mode: str = "normal"):
    logging.info(f"[_crop_and_stack_optimized_for_all_faces] Starting processing for input: {input_video_path}")
    print(f"[_crop_and_stack_optimized_for_all_faces] Processing video: {input_video_path}")
    
    # Define resolution modes
    resolution_configs = {
        "8k": {"max_width": 7680, "max_height": 13653, "description": "8K Ultra HD (7680x13653)"},
        "4k": {"max_width": 3840, "max_height": 6827, "description": "4K Ultra HD (3840x6827)"},
        "full_hd": {"max_width": 1920, "max_height": 3413, "description": "Full HD 1080p (1920x3413)"},
        "hd": {"max_width": 1280, "max_height": 2276, "description": "HD (1280x2276)"},
        "hd_720p": {"max_width": 720, "max_height": 1280, "description": "HD 720p (720x1280)"},
        "sd_480p": {"max_width": 480, "max_height": 853, "description": "SD 480p (480x853)"},
        "sd_360p": {"max_width": 360, "max_height": 640, "description": "SD 360p (360x640)"},
        "sd_240p": {"max_width": 240, "max_height": 427, "description": "SD 240p (240x427)"},
        "sd_180p": {"max_width": 180, "max_height": 320, "description": "SD 180p (180x320)"},
        "sd_144p": {"max_width": 144, "max_height": 256, "description": "SD 144p (144x256)"},
        "sd_120p": {"max_width": 120, "max_height": 213, "description": "SD 120p (120x213)"},
        "sd_108p": {"max_width": 108, "max_height": 192, "description": "SD 108p (108x192)"},
        "sd_96p": {"max_width": 96, "max_height": 171, "description": "SD 96p (96x171)"}
    }
    
    if resolution_mode not in resolution_configs:
        logging.warning(f"[_crop_and_stack_optimized_for_all_faces] Invalid resolution mode '{resolution_mode}', defaulting to 'normal'")
        resolution_mode = "normal"
    
    resolution_config = resolution_configs[resolution_mode]
    target_width = resolution_config['max_width']
    target_height = resolution_config['max_height']
    
    logging.info(f"[_crop_and_stack_optimized_for_all_faces] Resolution mode: {resolution_mode} - {resolution_config['description']}")
    print(f"[_crop_and_stack_optimized_for_all_faces] Resolution mode: {resolution_mode} - {resolution_config['description']}")
    
    with open(faces_bounding_boxes_path) as f:
        json_data = json.load(f)

    faces_data = RecognizedFacesBBoxes.model_validate(json_data)
    face_ids = list(faces_data.root.keys())
    
    logging.info(f"[_crop_and_stack_optimized_for_all_faces] Found {len(face_ids)} faces to process: {face_ids}")
    print(f"[_crop_and_stack_optimized_for_all_faces] Processing {len(face_ids)} faces: {face_ids}")
    
    input_video_properties = _get_video_properties(input_video_path)


    input_video_path_basename = os.path.basename(input_video_path)
    clips_dir = os.path.join(os.path.dirname(output_video_path), f'{input_video_path_basename}_clips')
    
    logging.info(f"[_crop_and_stack_optimized_for_all_faces] Clips directory: {clips_dir}")
    print(f"[_crop_and_stack_optimized_for_all_faces] Working directory: {clips_dir}")
    
    shutil.rmtree(clips_dir, ignore_errors=True)
    os.makedirs(clips_dir, exist_ok=True)
    try:
        audio_path = os.path.join(clips_dir, 'extracted_audio.m4a')
        logging.info(f"[_crop_and_stack_optimized_for_all_faces] Extracting audio to: {audio_path}")
        print(f"[_crop_and_stack_optimized_for_all_faces] Extracting audio...")
        try:
            # Use copy mode for fast extraction (no re-encoding)
            command = [
                'ffmpeg',
                '-i', input_video_path,
                '-vn', # No video
                '-c:a', 'copy', # Copy audio stream without re-encoding (MUCH faster)
                '-y',
                '-loglevel', 'quiet',
                audio_path
            ]
            subprocess.run(command, check=True, capture_output=True)
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Audio extracted successfully")
            print(f"[_crop_and_stack_optimized_for_all_faces] Audio extracted successfully")
        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
            logging.warning(f"[_crop_and_stack_optimized_for_all_faces] Failed to extract audio: {stderr}")
            print(f"[_crop_and_stack_optimized_for_all_faces] WARNING: Failed to extract audio: {stderr}")
            audio_path = None


        logging.info(f"[_crop_and_stack_optimized_for_all_faces] Starting face processing")
        print(f"[_crop_and_stack_optimized_for_all_faces] Processing {len(face_ids)} faces...")
        
        for face_id in face_ids:
            try:
                _crop_face_id_and_save(clips_dir, input_video_properties, faces_bounding_boxes_path, output_video_path, face_id, reference_image_time_interval)
                logging.info(f"[_crop_and_stack_optimized_for_all_faces] Successfully processed face {face_id}")
                print(f"[_crop_and_stack_optimized_for_all_faces] ✓ Face {face_id} completed")
            except Exception as exc:
                logging.error(f"[_crop_and_stack_optimized_for_all_faces] Face {face_id} generated an exception: {exc}")
                print(f"[_crop_and_stack_optimized_for_all_faces] ✗ Face {face_id} failed: {exc}")
        # now we have #merged_clips_no_audio_path files in the temp_dir/face_id/merged_clips_no_audio.mp4
        # stack up all the merged_clips_no_audio.mp4 files into one video vertically
        
        logging.info(f"[_crop_and_stack_optimized_for_all_faces] All faces processed, now stacking videos")
        print(f"[_crop_and_stack_optimized_for_all_faces] Stacking videos...")
        
        video_paths = [os.path.join(clips_dir, face_id, 'merged_clips_no_audio.mp4') for face_id in face_ids]
        
        logging.info(f"[_crop_and_stack_optimized_for_all_faces] Expected video paths: {video_paths}")
        
        existing_video_paths = [p for p in video_paths if os.path.exists(p)]
        
        logging.info(f"[_crop_and_stack_optimized_for_all_faces] Found {len(existing_video_paths)}/{len(video_paths)} video files to stack")
        print(f"[_crop_and_stack_optimized_for_all_faces] Found {len(existing_video_paths)}/{len(video_paths)} videos to stack")

        if not existing_video_paths:
            error_msg = "No video files found to stack"
            logging.warning(f"[_crop_and_stack_optimized_for_all_faces] {error_msg}")
            print(f"[_crop_and_stack_optimized_for_all_faces] WARNING: {error_msg}")
            return

        if len(existing_video_paths) == 1:
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Single video detected, processing without stacking")
            print(f"[_crop_and_stack_optimized_for_all_faces] Processing single video (no stacking needed)")
            
            video_input_path = existing_video_paths[0]
            command = ['ffmpeg']
            try:
                if audio_path:
                    logging.info(f"[_crop_and_stack_optimized_for_all_faces] Adding audio to single video")
                    command.extend([
                        '-i', video_input_path,
                        '-i', audio_path,
                        '-vf', f'scale={target_width}:-1',
                        '-vcodec', 'libx264',
                        '-acodec', 'aac',
                        '-r', str(input_video_properties.fps),
                        '-y',
                        '-loglevel', 'quiet',
                        output_video_path
                    ])
                else:
                    logging.info(f"[_crop_and_stack_optimized_for_all_faces] Processing single video without audio")
                    command.extend([
                        '-i', video_input_path,
                        '-vf', f'scale={target_width}:-1',
                        '-vcodec', 'libx264',
                        '-r', str(input_video_properties.fps),
                        '-y',
                        '-loglevel', 'quiet',
                        output_video_path
                    ])
                logging.info(f"[_crop_and_stack_optimized_for_all_faces] Running FFmpeg command for single video: {' '.join(command)}")
                print(f"[_crop_and_stack_optimized_for_all_faces] Executing FFmpeg for single video...")
                subprocess.run(command, check=True, capture_output=True)
                logging.info(f"[_crop_and_stack_optimized_for_all_faces] Successfully created output video: {output_video_path}")
                print(f"[_crop_and_stack_optimized_for_all_faces] ✓ Output video created: {output_video_path}")
            except subprocess.CalledProcessError as e:
                stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
                stdout = e.stdout.decode('utf-8') if e.stdout else "No stdout available"
                logging.error(f"[_crop_and_stack_optimized_for_all_faces] Error processing single video. Command: {' '.join(command)}")
                logging.error(f"[_crop_and_stack_optimized_for_all_faces] FFmpeg stderr: {stderr}")
                logging.error(f"[_crop_and_stack_optimized_for_all_faces] FFmpeg stdout: {stdout}")
                print(f"[_crop_and_stack_optimized_for_all_faces] ERROR: Failed to process single video")
                print(f"[_crop_and_stack_optimized_for_all_faces] FFmpeg error: {stderr}")
                raise
            return

        try:
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Building FFmpeg stacking command for {len(existing_video_paths)} videos")
            print(f"[_crop_and_stack_optimized_for_all_faces] Building final video with {len(existing_video_paths)} streams...")
            
            # Get dimensions of all input videos to determine target width
            max_width = 0
            for path in existing_video_paths:
                try:
                    probe = ffmpeg.probe(path)
                    video_info = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
                    if video_info:
                        width = int(video_info['width'])
                        max_width = max(max_width, width)
                except Exception as e:
                    logging.warning(f"[_crop_and_stack_optimized_for_all_faces] Could not probe {path}: {e}")
            
            # Use max width from inputs, capped at resolution mode max width
            # Don't force a minimum width - use actual input dimensions to avoid memory issues
            
            # Create intermediate scaled videos first to avoid memory issues
            # This is a two-pass approach: scale first, then stack
            # Calculate target height for each video when stacking N videos vertically
            num_videos = len(existing_video_paths)
            per_video_height = target_height // num_videos
            
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Using two-pass approach to avoid memory issues")
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Target dimensions: {target_width}x{target_height}, Per-video height: {per_video_height}")
            print(f"[_crop_and_stack_optimized_for_all_faces] Scaling videos individually to reduce memory pressure...")
            print(f"[_crop_and_stack_optimized_for_all_faces] Target: {target_width}x{target_height}, Each video: {target_width}x{per_video_height}")
            
            scaled_video_paths = []
            temp_dir = os.path.dirname(existing_video_paths[0])
            
            for i, path in enumerate(existing_video_paths):
                scaled_path = os.path.join(temp_dir, f'scaled_{i}.mp4')
                scaled_video_paths.append(scaled_path)
                
                # Pass 1: Scale each video individually to fit within target_width x per_video_height
                # Use scale filter to fit within dimensions while maintaining aspect ratio
                scale_command = [
                    'ffmpeg', '-i', path,
                    '-vf', f'scale={target_width}:{per_video_height}:force_original_aspect_ratio=decrease,pad={target_width}:{per_video_height}:(ow-iw)/2:(oh-ih)/2',
                    '-vcodec', 'libx264', '-preset', 'ultrafast',
                    '-crf', '23', '-an', '-y', scaled_path
                ]
                logging.info(f"[_crop_and_stack_optimized_for_all_faces] Scaling video {i+1}/{num_videos}: {' '.join(scale_command)}")
                print(f"[_crop_and_stack_optimized_for_all_faces] Scaling video {i+1}/{num_videos}...")
                subprocess.run(scale_command, check=True, capture_output=True)
            
            # Pass 2: Stack the scaled videos
            print(f"[_crop_and_stack_optimized_for_all_faces] Stacking {len(scaled_video_paths)} scaled videos...")
            command = ['ffmpeg']
            for path in scaled_video_paths:
                command.extend(['-i', path])

            filter_complex_parts = []
            video_outputs = []
            for i in range(len(scaled_video_paths)):
                video_outputs.append(f'[{i}:v]')
            
            # Stack videos vertically and ensure final dimensions match target
            filter_complex_parts.append(f'{"".join(video_outputs)}vstack=inputs={len(scaled_video_paths)}[v]')
            # Crop to exact target dimensions (in case of rounding issues)
            filter_complex_parts.append(f'[v]crop={target_width}:{target_height}[vout]')
            
            filter_complex_str = ';'.join(filter_complex_parts)
            command.extend(['-filter_complex', filter_complex_str])
            
            if audio_path:
                logging.info(f"[_crop_and_stack_optimized_for_all_faces] Adding audio stream to output")
                command.extend(['-i', audio_path])
                command.extend(['-map', '[vout]', '-map', f'{len(scaled_video_paths)}:a'])
                command.extend(['-vcodec', 'libx264', '-acodec', 'aac', '-r', str(input_video_properties.fps), '-y', output_video_path])
            else:
                logging.info(f"[_crop_and_stack_optimized_for_all_faces] No audio stream available")
                command.extend(['-map', '[vout]'])
                command.extend(['-vcodec', 'libx264', '-r', str(input_video_properties.fps), '-y', output_video_path])
            
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Running FFmpeg stacking command: {' '.join(command)}")
            print(f"[_crop_and_stack_optimized_for_all_faces] Executing final FFmpeg command...")
            subprocess.run(command, check=True, capture_output=True)
            
            # Clean up scaled intermediate files
            print(f"[_crop_and_stack_optimized_for_all_faces] Cleaning up intermediate files...")
            for scaled_path in scaled_video_paths:
                try:
                    if os.path.exists(scaled_path):
                        os.remove(scaled_path)
                        logging.info(f"[_crop_and_stack_optimized_for_all_faces] Cleaned up intermediate file: {scaled_path}")
                except Exception as e:
                    logging.warning(f"[_crop_and_stack_optimized_for_all_faces] Failed to clean up {scaled_path}: {e}")
            
            logging.info(f"[_crop_and_stack_optimized_for_all_faces] Successfully created output video: {output_video_path}")
            print(f"[_crop_and_stack_optimized_for_all_faces] ✓ Output video created: {output_video_path}")

        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
            stdout = e.stdout.decode('utf-8') if e.stdout else "No stdout available"
            logging.error(f"[_crop_and_stack_optimized_for_all_faces] Error stacking videos. Command: {' '.join(command)}")
            logging.error(f"[_crop_and_stack_optimized_for_all_faces] FFmpeg stderr: {stderr}")
            logging.error(f"[_crop_and_stack_optimized_for_all_faces] FFmpeg stdout: {stdout}")
            print(f"[_crop_and_stack_optimized_for_all_faces] ERROR: Failed to stack videos")
            print(f"[_crop_and_stack_optimized_for_all_faces] FFmpeg error: {stderr}")
            raise
        finally:
            pass
    finally:
        pass
        #shutil.rmtree(input_video_path)


def _create_folder_if_not_exists(output_video_path):
    output_folder = os.path.dirname(output_video_path)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder, exist_ok=True)



@click.command('crop-and-stack-ai')
@click.option('--segment-number', type=int, required=True, default=10)
@click.option('--resolution', type=click.Choice(['high', 'normal', 'low'], case_sensitive=False), default='normal', help='Output video resolution mode')
def crop_and_stack_ai_command(segment_number, resolution):
    _crop_and_stack_ai(segment_number, resolution)

def _crop_and_stack_ai(segment_number, resolution_mode: str = "normal"):
    logging.info(f"[_crop_and_stack_ai] Starting AI crop and stack process for segment {segment_number} with {resolution_mode} resolution")
    print(f"[_crop_and_stack_ai] ========================================")
    print(f"[_crop_and_stack_ai] Starting AI Crop and Stack Process")
    print(f"[_crop_and_stack_ai] Segment: {segment_number}")
    print(f"[_crop_and_stack_ai] Resolution: {resolution_mode}")
    print(f"[_crop_and_stack_ai] ========================================")
    
    config = get_shorts_config()
    # input_video_path, faces_bounding_boxes_path, output_video_path, num_threads, reference_image_time_interval
    reference_image_time_interval = config.config_json.cropping_reference_image_time_interval
    collection_id = f"{config.get_user_video_id()}_{segment_number}"
    important_segments_video_dir = Path(config.get_important_segments_video_dir_path())
    videos_cropped_stacked_dir = Path(config.get_videos_cropped_stacked_dir_path())

    input_segment_video_path = important_segments_video_dir / f"segment_{segment_number}.mp4"
    output_segment_video_path = videos_cropped_stacked_dir / f"segment_{segment_number}.mp4"
    reference_images_folder_path = important_segments_video_dir / f"segment_{segment_number}_frames"
    faces_bboxes_file_path = important_segments_video_dir / f"segment_{segment_number}_faces_bboxes.json"
    
    logging.info(f"[_crop_and_stack_ai] Input video: {input_segment_video_path}")
    logging.info(f"[_crop_and_stack_ai] Output video: {output_segment_video_path}")
    logging.info(f"[_crop_and_stack_ai] Reference interval: {reference_image_time_interval}s")
    logging.info(f"[_crop_and_stack_ai] Collection ID: {collection_id}")
    print(f"[_crop_and_stack_ai] Input: {input_segment_video_path}")
    print(f"[_crop_and_stack_ai] Output: {output_segment_video_path}")
    print(f"[_crop_and_stack_ai] Reference interval: {reference_image_time_interval}s")
    
    if reference_images_folder_path.exists():
        logging.info(f"[_crop_and_stack_ai] Removing existing reference images folder: {reference_images_folder_path}")
        import shutil
        shutil.rmtree(reference_images_folder_path)
    if faces_bboxes_file_path.exists():
        logging.info(f"[_crop_and_stack_ai] Removing existing faces bboxes file: {faces_bboxes_file_path}")
        faces_bboxes_file_path.unlink()

    logging.info(f"[_crop_and_stack_ai] Step 1: Extracting frames from video")
    print(f"[_crop_and_stack_ai] Step 1/5: Extracting frames...")
    _extract_n_frames_from_video(str(input_segment_video_path), str(reference_images_folder_path), reference_image_time_interval)
    
    logging.info(f"[_crop_and_stack_ai] Step 2: Saving unique faces")
    print(f"[_crop_and_stack_ai] Step 2/5: Detecting and saving unique faces...")
    _save_unique_faces(str(reference_images_folder_path), collection_id)
    
    logging.info(f"[_crop_and_stack_ai] Step 3: Finding face bounding boxes")
    print(f"[_crop_and_stack_ai] Step 3/5: Finding face bounding boxes...")
    _find_face_bounding_boxes_in_images(str(reference_images_folder_path), str(faces_bboxes_file_path), collection_id)
    
    logging.info(f"[_crop_and_stack_ai] Step 4: Creating output folder")
    print(f"[_crop_and_stack_ai] Step 4/5: Preparing output...")
    _create_folder_if_not_exists(str(output_segment_video_path))
    
    logging.info(f"[_crop_and_stack_ai] Step 5: Cropping and stacking faces")
    print(f"[_crop_and_stack_ai] Step 5/5: Cropping and stacking faces...")
    _crop_and_stack_optimized_for_all_faces(str(input_segment_video_path), str(faces_bboxes_file_path), str(output_segment_video_path), reference_image_time_interval, resolution_mode)
    
    logging.info(f"[_crop_and_stack_ai] Process completed successfully for segment {segment_number}")
    print(f"[_crop_and_stack_ai] ========================================")
    print(f"[_crop_and_stack_ai] ✓ Process Completed Successfully")
    print(f"[_crop_and_stack_ai] ========================================")
