# flake8: noqa: E501
# clipper/clippercmd/crop_and_stack.py

import json
import math
import click
import os
import subprocess
from .utils import _run_ffmpeg
from concurrent.futures import ThreadPoolExecutor, as_completed
from .model.klippers_model import BoxRel, RecognizedFacesBBoxes
import ffmpeg
from typing import List, Optional
from .model.klippers_model import BoxPx
import shutil
from pydantic import BaseModel
from config import  get_shorts_config, settings
from .model.short_config_model import KlippersShortsConfig
import logging


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


# def _concat_vertically_with_two_faces(input_video_properties, segment_idx, clips_dir, face_ids, merged_clips_filename='merged_clips_no_audio.mp4'):
#     pass
#     for face_id in face_ids:
#         clip_path = os.path.join(clips_dir, face_id, merged_clips_filename)
#         if not os.path.exists(clip_path):
#             print(f"Clip file not found for face {face_id}: {clip_path}")
#             return
#         command = ['ffmpeg']
#         command.extend(['-i', clip_path])
#         command.extend(['-vcodec', 'libx264', '-acodec', 'aac', '-r', str(input_video_properties.fps), '-y', f'{clips_dir}/segment_{segment_idx}.mp4'])
#         subprocess.run(command, check=True, capture_output=True)

def _crop_manual_face_id_and_save(temp_dir:str, face_id, input_video_properties: InputVideoProperties, reference_image_time_interval:int):

    logging.info(f"[_crop_manual_face_id_and_save] Starting crop for face_id: {face_id}")
    print(f"[_crop_manual_face_id_and_save] Processing face_id: {face_id}")
    
    shorts_config = get_shorts_config()
    face_cropping_list = list(filter(lambda x: x.face_index == int(face_id), shorts_config.config_json.manual_cropping.face_cropping))
    if not face_cropping_list:
        error_msg = f"No face cropping configuration found for face_id: {face_id}"
        logging.error(f"[_crop_manual_face_id_and_save] {error_msg}")
        print(f"[_crop_manual_face_id_and_save] ERROR: {error_msg}")
        return
    face_cropping = face_cropping_list[0]
    box_rel = face_cropping.cropping_bbox

    logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} crop bbox: Left={box_rel.Left}, Top={box_rel.Top}, Width={box_rel.Width}, Height={box_rel.Height}")
    print(f"[_crop_manual_face_id_and_save] Face {face_id} bbox - L:{box_rel.Left}, T:{box_rel.Top}, W:{box_rel.Width}, H:{box_rel.Height}")

    fps = input_video_properties.fps
    total_frames = input_video_properties.total_frames
    
    os.makedirs(os.path.join(temp_dir, face_id), exist_ok=True)
    frames_per_clip = int(reference_image_time_interval * fps)
    if frames_per_clip == 0:
        frames_per_clip = 1
    num_clips = math.ceil(total_frames / frames_per_clip)
    
    logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Will generate {num_clips} clips, {frames_per_clip} frames per clip")
    print(f"[_crop_manual_face_id_and_save] Face {face_id} - Generating {num_clips} clips")
    clip_paths = [None] * num_clips


    def generate_clip(i,  input_video_properties, reference_image_time_interval: int,  box_rel: BoxRel):
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
        
        clip_path = os.path.abspath(os.path.join(temp_dir, f'{face_id}/clip_{i}.mp4'))
        
        logging.debug(f"[generate_clip] Face {face_id} clip {i} - Start: {start_time:.2f}s, Duration: {duration:.2f}s, Crop: {box_rel.Width}x{box_rel.Height} at ({int(box_rel.Left)},{int(box_rel.Top)})")
        
        command = [
            'ffmpeg',
            '-ss', str(start_time),
            '-t', str(duration),
            '-i', input_video_path,
            '-vf', f'crop={box_rel.Width}:{box_rel.Height}:{int(box_rel.Left)}:{int(box_rel.Top)}',
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

    num_threads = len(num_clips)
    logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Starting parallel clip generation with {num_threads} threads")
    print(f"[_crop_manual_face_id_and_save] Face {face_id} - Processing {num_clips} clips in parallel")
    
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = {executor.submit(generate_clip, i,  input_video_properties, reference_image_time_interval, box_rel): i for i in range(num_clips)}
        completed_count = 0
        for future in as_completed(futures):
            i, result = future.result()
            completed_count += 1
            if isinstance(result, str):
                clip_paths[i] = result
                if completed_count % 10 == 0:
                    print(f"[_crop_manual_face_id_and_save] Face {face_id} - Progress: {completed_count}/{num_clips} clips")
            elif result is None:
                # This means the clip was skipped, which is fine.
                pass
            else:
                stderr = result.stderr.decode('utf-8') if result.stderr else "No stderr."
                logging.error(f"[_crop_manual_face_id_and_save] Face {face_id} - Error processing clip {i}: {stderr}")
                print(f"[_crop_manual_face_id_and_save] Face {face_id} - ERROR in clip {i}: {stderr}")
    
    valid_clip_paths = [p for p in clip_paths if p is not None]
    logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Generated {len(valid_clip_paths)}/{num_clips} valid clips")
    print(f"[_crop_manual_face_id_and_save] Face {face_id} - Successfully generated {len(valid_clip_paths)}/{num_clips} clips")

    if not valid_clip_paths:
        error_msg = f"No clips were generated successfully for face {face_id}"
        logging.error(f"[_crop_manual_face_id_and_save] {error_msg}")
        print(f"[_crop_manual_face_id_and_save] ERROR: {error_msg}")
        return
        
    concat_file_path = os.path.join(temp_dir, f'concat_list_{face_id}.txt')
    logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Creating concat file: {concat_file_path}")
    with open(concat_file_path, 'w') as f:
        for path in valid_clip_paths:
            f.write(f"file '{path}'\n")

    merged_clips_no_audio_path = os.path.join(temp_dir, f'{face_id}/merged_clips_no_audio.mp4')
    logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Merging clips into: {merged_clips_no_audio_path}")
    print(f"[_crop_manual_face_id_and_save] Face {face_id} - Merging {len(valid_clip_paths)} clips...")

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
        
        logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Running merge command: {' '.join(command)}")
        subprocess.run(command, check=True, capture_output=True)
        logging.info(f"[_crop_manual_face_id_and_save] Face {face_id} - Successfully merged clips")
        print(f"[_crop_manual_face_id_and_save] Face {face_id} - Clips merged successfully")
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
        logging.error(f"[_crop_manual_face_id_and_save] Face {face_id} - Failed to merge clips: {stderr}")
        print(f"[_crop_manual_face_id_and_save] Face {face_id} - ERROR merging clips: {stderr}")
        raise
        
    finally:
        pass
    

def _crop_and_stack_manual_for_all_faces(input_video_path: str,  output_video_path: str, reference_image_time_interval:int):
    
    logging.info(f"[_crop_and_stack_manual_for_all_faces] Starting processing for input: {input_video_path}")
    print(f"[_crop_and_stack_manual_for_all_faces] Processing video: {input_video_path}")
    
    shorts_config: KlippersShortsConfig = get_shorts_config()
    # print("halil:debug", f"shorts_config: {shorts_config.config_json.manual_cropping.face_cropping}")
    face_ids = [face_cropping.face_index for face_cropping in shorts_config.config_json.manual_cropping.face_cropping]
    face_ids = list(map(str, face_ids))
    
    logging.info(f"[_crop_and_stack_manual_for_all_faces] Found {len(face_ids)} faces to process: {face_ids}")
    print(f"[_crop_and_stack_manual_for_all_faces] Processing {len(face_ids)} faces: {face_ids}")
    
    input_video_properties = _get_video_properties(input_video_path)


    input_video_path_basename = os.path.basename(input_video_path)
    clips_dir = os.path.join(os.path.dirname(output_video_path), f'{input_video_path_basename}_clips')
    
    logging.info(f"[_crop_and_stack_manual_for_all_faces] Clips directory: {clips_dir}")
    print(f"[_crop_and_stack_manual_for_all_faces] Working directory: {clips_dir}")
    
    shutil.rmtree(clips_dir, ignore_errors=True)
    os.makedirs(clips_dir, exist_ok=True)
    try:
        audio_path = os.path.join(clips_dir, 'extracted_audio.m4a')
        logging.info(f"[_crop_and_stack_manual_for_all_faces] Extracting audio to: {audio_path}")
        print(f"[_crop_and_stack_manual_for_all_faces] Extracting audio...")
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
            logging.info(f"[_crop_and_stack_manual_for_all_faces] Audio extracted successfully")
            print(f"[_crop_and_stack_manual_for_all_faces] Audio extracted successfully")
        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
            logging.warning(f"[_crop_and_stack_manual_for_all_faces] Failed to extract audio: {stderr}")
            print(f"[_crop_and_stack_manual_for_all_faces] WARNING: Failed to extract audio: {stderr}")
            audio_path = None

        num_threads = len(face_ids)
        logging.info(f"[_crop_and_stack_manual_for_all_faces] Starting parallel face processing with {num_threads} threads")
        print(f"[_crop_and_stack_manual_for_all_faces] Processing {len(face_ids)} faces in parallel...")
        
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            # def _crop_manual_face_id_and_save(temp_dir:str, face_id, input_video_properties: InputVideoProperties, reference_image_time_interval:int,  num_threads: Optional[int] = None):


            future_to_face_id = {executor.submit(_crop_manual_face_id_and_save, clips_dir, face_id, input_video_properties, reference_image_time_interval): face_id for face_id in face_ids}
            for future in as_completed(future_to_face_id):
                face_id = future_to_face_id[future]
                try:
                    future.result()
                    logging.info(f"[_crop_and_stack_manual_for_all_faces] Successfully processed face {face_id}")
                    print(f"[_crop_and_stack_manual_for_all_faces] ✓ Face {face_id} completed")
                except Exception as exc:
                    logging.error(f"[_crop_and_stack_manual_for_all_faces] Face {face_id} generated an exception: {exc}")
                    print(f"[_crop_and_stack_manual_for_all_faces] ✗ Face {face_id} failed: {exc}")
        # now we have #merged_clips_no_audio_path files in the temp_dir/face_id/merged_clips_no_audio.mp4
        # stack up all the merged_clips_no_audio.mp4 files into one video vertically
        
        logging.info(f"[_crop_and_stack_manual_for_all_faces] All faces processed, now stacking videos")
        print(f"[_crop_and_stack_manual_for_all_faces] Stacking videos...")
        
        video_paths = [os.path.join(clips_dir, face_id, 'merged_clips_no_audio.mp4') for face_id in face_ids]
        
        logging.info(f"[_crop_and_stack_manual_for_all_faces] Expected video paths: {video_paths}")

        existing_video_paths = [p for p in video_paths if os.path.exists(p)]
        
        logging.info(f"[_crop_and_stack_manual_for_all_faces] Found {len(existing_video_paths)}/{len(video_paths)} video files to stack")
        print(f"[_crop_and_stack_manual_for_all_faces] Found {len(existing_video_paths)}/{len(video_paths)} videos to stack")

        if not existing_video_paths:
            error_msg = "No video files found to stack"
            logging.error(f"[_crop_and_stack_manual_for_all_faces] {error_msg}")
            print(f"[_crop_and_stack_manual_for_all_faces] ERROR: {error_msg}")
            return
        
        try:
            logging.info(f"[_crop_and_stack_manual_for_all_faces] Building FFmpeg stacking command")
            print(f"[_crop_and_stack_manual_for_all_faces] Building final video with {len(existing_video_paths)} streams...")
            
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
                    logging.warning(f"[_crop_and_stack_manual_for_all_faces] Could not probe {path}: {e}")
            
            # Use max width from inputs, capped at 1920 to avoid excessive upscaling
            # Don't force a minimum width - use actual input dimensions to avoid memory issues
            target_width = min(max_width, 1920) if max_width > 0 else 720
            logging.info(f"[_crop_and_stack_manual_for_all_faces] Target width for stacking: {target_width}px (max input width: {max_width}px)")
            print(f"[_crop_and_stack_manual_for_all_faces] Using target width: {target_width}px")
            
            command = ['ffmpeg']
            for path in existing_video_paths:
                command.extend(['-i', path])

            filter_complex_parts = []
            video_outputs = []
            for i in range(len(existing_video_paths)):
                filter_complex_parts.append(f'[{i}:v]scale={target_width}:-1[v{i}]')
                video_outputs.append(f'[v{i}]')
            
            filter_complex_parts.append(f'{"".join(video_outputs)}vstack=inputs={len(existing_video_paths)}[v]')
            filter_complex_parts.append('[v]crop=iw:floor(ih/2)*2[vout]')
            
            filter_complex_str = ';'.join(filter_complex_parts)
            command.extend(['-filter_complex', filter_complex_str])
            
            if audio_path:
                logging.info(f"[_crop_and_stack_manual_for_all_faces] Adding audio stream to output")
                command.extend(['-i', audio_path])
                command.extend(['-map', '[vout]', '-map', f'{len(existing_video_paths)}:a'])
                command.extend(['-vcodec', 'libx264', '-acodec', 'aac', '-r', str(input_video_properties.fps), '-y', output_video_path])
            else:
                logging.info(f"[_crop_and_stack_manual_for_all_faces] No audio stream available")
                command.extend(['-map', '[vout]'])
                command.extend(['-vcodec', 'libx264', '-r', str(input_video_properties.fps), '-y', output_video_path])
            
            logging.info(f"[_crop_and_stack_manual_for_all_faces] Running FFmpeg stacking command: {' '.join(command)}")
            print(f"[_crop_and_stack_manual_for_all_faces] Executing final FFmpeg command...")
            subprocess.run(command, check=True, capture_output=True)
            
            logging.info(f"[_crop_and_stack_manual_for_all_faces] Successfully created output video: {output_video_path}")
            print(f"[_crop_and_stack_manual_for_all_faces] ✓ Output video created: {output_video_path}")

        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8') if e.stderr else "No stderr available"
            stdout = e.stdout.decode('utf-8') if e.stdout else "No stdout available"
            logging.error(f"[_crop_and_stack_manual_for_all_faces] Error stacking videos. Command: {' '.join(command)}")
            logging.error(f"[_crop_and_stack_manual_for_all_faces] FFmpeg stderr: {stderr}")
            logging.error(f"[_crop_and_stack_manual_for_all_faces] FFmpeg stdout: {stdout}")
            print(f"[_crop_and_stack_manual_for_all_faces] ERROR: Failed to stack videos")
            print(f"[_crop_and_stack_manual_for_all_faces] FFmpeg error: {stderr}")
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




def _crop_and_stack_manual(input_video_path, output_video_path, reference_image_time_interval, resolution_mode: str = "normal"):
    logging.info(f"[_crop_and_stack_manual] Starting manual crop and stack process")
    logging.info(f"[_crop_and_stack_manual] Input: {input_video_path}")
    logging.info(f"[_crop_and_stack_manual] Output: {output_video_path}")
    logging.info(f"[_crop_and_stack_manual] Reference interval: {reference_image_time_interval}s")
    print(f"[_crop_and_stack_manual] ========================================")
    print(f"[_crop_and_stack_manual] Starting Manual Crop and Stack Process")
    print(f"[_crop_and_stack_manual] ========================================")
    print(f"[_crop_and_stack_manual] Input: {input_video_path}")
    print(f"[_crop_and_stack_manual] Output: {output_video_path}")
    print(f"[_crop_and_stack_manual] Reference interval: {reference_image_time_interval}s")
    
    _create_folder_if_not_exists(output_video_path)
    _crop_and_stack_manual_for_all_faces(input_video_path, output_video_path, reference_image_time_interval)
    
    logging.info(f"[_crop_and_stack_manual] Process completed successfully")
    print(f"[_crop_and_stack_manual] ========================================")
    print(f"[_crop_and_stack_manual] ✓ Process Completed Successfully")
    print(f"[_crop_and_stack_manual] ========================================")


@click.command('crop-and-stack-manual')
@click.option('--input-video-path', type=click.Path(exists=True), required=True)
@click.option('--output-video-path', type=click.Path(), required=True)
@click.option('--reference-image-time-interval', type=int, default=6, required=False)
def crop_and_stack_manual_command(input_video_path, output_video_path,reference_image_time_interval):
    _crop_and_stack_manual(input_video_path, output_video_path, reference_image_time_interval )

