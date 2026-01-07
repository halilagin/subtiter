# flake8: noqa: E501
# clippercmd/aws_face_recognition.py

"""
Command line tool to detect faces in images using AWS Rekognition.
"""

import click
import json
import boto3
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from io import BytesIO
from PIL import Image, ImageDraw
from botocore.client import Config
import logging
from botocore.exceptions import ClientError
from concurrent.futures import ThreadPoolExecutor, as_completed

from .model.klippers_model import RecognizedFacesBBoxes
from .settings import  Settings
from .ai_provider_cost_manager import _record_ai_provider_cost
from config import get_shorts_config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def sort_recognized_faces_by_frame_and_index(
    face_detections: RecognizedFacesBBoxes,
) -> RecognizedFacesBBoxes:
    """
    Sorts face detections by frame ID and then by face index within each frame.

    Args:
        face_detections: A RecognizedFacesBBoxes object containing face detections.

    Returns:
        A new RecognizedFacesBBoxes object with sorted face detections.
    """
    # Sort frames by frame ID (the dictionary key)
    sorted_frames = sorted(face_detections.root.items(), key=lambda item: item[0])

    # For each frame, sort the list of faces by face index
    final_dict = {
        frame_id: sorted(faces, key=lambda face: face.index)
        for frame_id, faces in sorted_frames
    }

    return RecognizedFacesBBoxes.model_validate(final_dict)


def detect_faces_bboxes(
    images_bytes: List[bytes],
    *,
    region_name: str = "us-east-1",
    max_faces_per_image: Optional[int] = None,
    to_pixels: bool = False,
    client: boto3.client = None,
) -> List[Dict[str, Any]]:
    """
    Detect faces and bounding boxes in a batch of images held in memory.

    Args:
        images_bytes: List of raw image bytes (e.g., contents of a JPEG/PNG file).
        region_name: AWS region for Rekognition (ignored if `client` provided).
        max_faces_per_image: If set, truncate results per image to this many faces (highest confidence first).
        to_pixels: If True, also return pixel-based bounding boxes using each image's dimensions.
        client: Optional preconfigured boto3 Rekognition client.

    Returns:
        A list with one entry per input image:
        [
          {
            "index": <int>,                # index of the image in the input list
            "image_size": {"width": W, "height": H} or None,
            "faces": [
              {
                "confidence": <float>,     # 0..100
                "box_rel": {               # Rekognition's native fractional box
                  "Left": <float>, "Top": <float>, "Width": <float>, "Height": <float>
                },
                "box_px": {                # only when to_pixels=True
                  "left": <int>, "top": <int>, "width": <int>, "height": <int>
                }
              },
              ...
            ]
          },
          ...
        ]
    """
    rk = client or boto3.client("rekognition", region_name=region_name, config=Config(retries={"max_attempts": 3}))

    results: List[Dict[str, Any]] = []
    for idx, img_bytes in enumerate(images_bytes):
        # Optionally get image size for pixel conversion
        img_size = None
        if to_pixels:
            with Image.open(BytesIO(img_bytes)) as im:
                img_size = {"width": im.width, "height": im.height}

        # Call Rekognition
        resp = rk.detect_faces(Image={"Bytes": img_bytes}, Attributes=["DEFAULT"])
        face_details = resp.get("FaceDetails", [])
        
        # Record cost for face detection: $0.001 per image
        try:
            config = get_shorts_config()
            user_id = config.get_user_id()
            video_id = config.get_video_id()
            _record_ai_provider_cost(
                user_id=user_id,
                video_id=video_id,
                cost="0.001000",
                operation_name="face_detection",
                provider="aws_rekognition",
                model="rekognition-detect-faces",
                usage="1 image",
                timestamp=datetime.utcnow().isoformat()
            )
        except Exception as e:
            logging.warning(f"Failed to record AI cost: {e}")

        # Sort by confidence (desc) and optionally trim
        face_details.sort(key=lambda f: f.get("Confidence", 0.0), reverse=True)
        if max_faces_per_image is not None:
            face_details = face_details[:max_faces_per_image]

        faces_out = []
        for fd in face_details:
            box = fd.get("BoundingBox", {})  # {Width, Height, Left, Top} in 0..1
            face_entry = {
                "confidence": float(fd.get("Confidence", 0.0)),
                "box_rel": {
                    "Left": float(box.get("Left", 0.0)),
                    "Top": float(box.get("Top", 0.0)),
                    "Width": float(box.get("Width", 0.0)),
                    "Height": float(box.get("Height", 0.0)),
                },
            }

            if img_size:
                W, H = img_size["width"], img_size["height"]
                left_px = int(round(box.get("Left", 0.0) * W))
                top_px = int(round(box.get("Top", 0.0) * H))
                width_px = int(round(box.get("Width", 0.0) * W))
                height_px = int(round(box.get("Height", 0.0) * H))
                face_entry["box_px"] = {
                    "left": left_px,
                    "top": top_px,
                    "width": width_px,
                    "height": height_px,
                }

            faces_out.append(face_entry)

        results.append({
            "index": idx,
            "image_size": img_size,
            "faces": faces_out,
        })

    return results


@click.command()
@click.option('--images-folder-path', required=True, type=click.Path(exists=True, file_okay=False, dir_okay=True), help='Path to the folder containing images.')
@click.option('--output-file', default='face_recognition_results.json', help='Path to save the JSON output file.')
def recognize_faces(images_folder_path, output_file):
    _recognize_faces(images_folder_path, output_file)

def _recognize_faces(images_folder_path, output_file):
    """
    Reads images in a folder, sends them to AWS Rekognition for face detection,
    and saves the responses to a JSON file.
    """
    settings = Settings()
    rekognition_client = boto3.client(
        'rekognition',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    
    image_paths = []
    image_bytes_list = []
    image_extensions = ('.png', '.jpg', '.jpeg')

    for filename in sorted(os.listdir(images_folder_path)):
        if filename.lower().endswith(image_extensions):
            image_path = os.path.join(images_folder_path, filename)
            image_paths.append(image_path)
            with open(image_path, 'rb') as f:
                image_bytes_list.append(f.read())

    print(f"Found {len(image_bytes_list)} images to process.")
    
    if not image_bytes_list:
        print("No images found in the specified folder.")
        return

    detection_results = detect_faces_bboxes(image_bytes_list, client=rekognition_client, to_pixels=True)
    
    results = {}
    for i, result in enumerate(detection_results):
        filename = os.path.basename(image_paths[i])
        results[filename] = result
        results["index"] = i

    output_path = os.path.join(images_folder_path, output_file)
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=4)

    print(f"Results saved to {output_path}")




def merge_face_entries(image_dir_path: str) -> Optional[bytes]:
    """
    Merges images from a directory into a single image grid with 4 columns.

    Args:
        image_dir_path: Path to the directory containing images.

    Returns:
        The binary content of the merged image in PNG format, or None if no images are found.
    """
    image_extensions = ('.png', '.jpg', '.jpeg')
    try:
        image_files = sorted([
            f for f in os.listdir(image_dir_path)
            if f.lower().endswith(image_extensions)
        ])
    except FileNotFoundError:
        return None

    if not image_files:
        return None

    images = [Image.open(os.path.join(image_dir_path, f)) for f in image_files]

    if not images:
        return None

    num_cols = 4
    num_images = len(images)

    # Chunk images into rows
    image_rows = [images[i:i + num_cols] for i in range(0, num_images, num_cols)]

    # Calculate dimensions for each row
    row_dims = []
    for row in image_rows:
        if not row:
            continue
        row_width = sum(img.width for img in row)
        row_height = max(img.height for img in row)
        row_dims.append({'width': row_width, 'height': row_height})

    if not row_dims:
        return None

    # Calculate canvas dimensions
    canvas_width = max(rd['width'] for rd in row_dims)
    canvas_height = sum(rd['height'] for rd in row_dims)

    canvas = Image.new('RGB', (canvas_width, canvas_height), color='white')

    current_y = 0
    for i, row in enumerate(image_rows):
        if not row:
            continue
        current_x = 0
        row_height = row_dims[i]['height']
        for img in row:
            # Paste image, aligning to top-left of its cell.
            # If images in a row have different heights, smaller ones will align to the top.
            canvas.paste(img, (current_x, current_y))
            current_x += img.width
        current_y += row_height

    buf = BytesIO()
    canvas.save(buf, format='PNG', compress_level=0)
    image_binary = buf.getvalue()

    return image_binary


@click.command('merge-to-one-image')
@click.option('--images-folder-path', required=True, type=click.Path(exists=True, file_okay=False, dir_okay=True), help='Path to the folder containing images.')
@click.option('--output-file', default='merged_image.png', help='Path to save the JSON output file.')
def merge_to_one_image(images_folder_path: str, output_file: str):
    _merge_to_one_image(images_folder_path, output_file)

def _merge_to_one_image(images_folder_path: str, output_file: str):
    image_binary = merge_face_entries(images_folder_path)
    with open(output_file, 'wb') as f:
        f.write(image_binary)
        



@click.command('fetch-unique-faces')
@click.option('--output-file', default='unique_faces_results.json', help='Path to save the JSON output file.')
@click.option('--collection-id', default='klippers-unique-faces', help='AWS Rekognition collection ID.')
def fetch_unique_faces(output_file: str, collection_id: str):
    _fetch_unique_faces(output_file, collection_id)

def _fetch_unique_faces(output_file: str, collection_id: str):
    settings = Settings()
    rekognition_client = boto3.client(
        'rekognition',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

    response = rekognition_client.list_faces(CollectionId=collection_id)
    with open(output_file, 'w') as f:
        json.dump(response, f, indent=4)


@click.command('save-unique-faces')
@click.option('--images-folder-path', required=True, type=click.Path(exists=True, file_okay=False, dir_okay=True), help='Path to the folder containing images.')
@click.option('--collection-id', default='klippers-unique-faces', help='AWS Rekognition collection ID.')
def save_unique_faces(images_folder_path: str,  collection_id: str):
    _save_unique_faces(images_folder_path, collection_id)

def _save_unique_faces(images_folder_path: str, collection_id: str):
    """
    Finds unique faces in a folder of images and adds them to an AWS Rekognition collection.
    """
    settings = Settings()
    rekognition_client = boto3.client(
        'rekognition',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

    # Create collection if it does not exist
    try:
        print(f"Creating collection: {collection_id}")
        rekognition_client.create_collection(CollectionId=collection_id)
        print(f"Collection '{collection_id}' created.")
    except rekognition_client.exceptions.ResourceAlreadyExistsException:
        print(f"Collection '{collection_id}' already exists.")
    except Exception as e:
        print(f"Error creating collection: {e}")
        return

    image_extensions = ('.png', '.jpg', '.jpeg')
    image_files = [f for f in sorted(os.listdir(images_folder_path)) if f.lower().endswith(image_extensions)]
    
    if not image_files:
        print("No images found in the specified folder.")
        return

    print(f"Found {len(image_files)} images to process.")

    for filename in image_files[::4]:
        image_path = os.path.join(images_folder_path, filename)
        print(f"Processing {filename}...")
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
        
        try:
            pil_image = Image.open(BytesIO(image_bytes))
            width, height = pil_image.size
        except Exception as e:
            print(f"Could not open image {filename}: {e}")
            continue

        try:
            # 1. Detect all faces in the image
            detect_response = rekognition_client.detect_faces(Image={'Bytes': image_bytes})
            face_details = detect_response.get('FaceDetails', [])
            
            # Record cost for face detection: $0.001 per image
            try:
                config = get_shorts_config()
                user_id = config.get_user_id()
                video_id = config.get_video_id()
                _record_ai_provider_cost(
                    user_id=user_id,
                    video_id=video_id,
                    cost="0.001000",
                    operation_name="face_detection_for_indexing",
                    provider="aws_rekognition",
                    model="rekognition-detect-faces",
                    usage="1 image",
                    timestamp=datetime.utcnow().isoformat()
                )
            except Exception as e:
                logging.warning(f"Failed to record AI cost: {e}")
            
            if not face_details:
                print(f"  No faces detected in {filename}.")
                continue

            print(f"  Found {len(face_details)} faces in {filename}.")

            # 2. For each face, check if it exists and index if it doesn't
            for i, face_detail in enumerate(face_details):
                bounding_box = face_detail['BoundingBox']
                left = int(round(bounding_box['Left'] * width))
                top = int(round(bounding_box['Top'] * height))
                box_width = int(round(bounding_box['Width'] * width))
                box_height = int(round(bounding_box['Height'] * height))
                right = left + box_width
                bottom = top + box_height

                # Crop the face from the image
                cropped_image = pil_image.crop((left, top, right, bottom))
                
                # Convert cropped image to bytes
                with BytesIO() as output:
                    cropped_image.save(output, format="JPEG")
                    cropped_image_bytes = output.getvalue()

                try:
                    # Check if a similar face exists in the collection
                    search_response = rekognition_client.search_faces_by_image(
                        CollectionId=collection_id,
                        Image={'Bytes': cropped_image_bytes},
                        FaceMatchThreshold=95,
                        MaxFaces=1
                    )
                    
                    # Record cost for face search: $0.001 per image
                    try:
                        config = get_shorts_config()
                        user_id = config.get_user_id()
                        video_id = config.get_video_id()
                        _record_ai_provider_cost(
                            user_id=user_id,
                            video_id=video_id,
                            cost="0.001000",
                            operation_name="face_search_by_image",
                            provider="aws_rekognition",
                            model="rekognition-search-faces",
                            usage="1 image",
                            timestamp=datetime.utcnow().isoformat()
                        )
                    except Exception as e:
                        logging.warning(f"Failed to record AI cost: {e}")
                    
                    if search_response.get('FaceMatches'):
                        similarity = search_response['FaceMatches'][0]['Similarity']
                        print(f"    Face {i+1}: Similar face found with {similarity:.2f}% similarity. Skipping.")
                    else:
                        # If no similar face is found, index it
                        print(f"    Face {i+1}: No similar face found. Indexing...")
                        rekognition_client.index_faces(
                            CollectionId=collection_id,
                            Image={'Bytes': cropped_image_bytes},
                            ExternalImageId=f"{filename}_face_{i+1}",
                            MaxFaces=1,
                            QualityFilter="AUTO",
                            DetectionAttributes=['DEFAULT']
                        )
                        
                        # Record cost for face indexing: $0.001 per image
                        try:
                            config = get_shorts_config()
                            user_id = config.get_user_id()
                            video_id = config.get_video_id()
                            _record_ai_provider_cost(
                                user_id=user_id,
                                video_id=video_id,
                                cost="0.001000",
                                operation_name="face_indexing",
                                provider="aws_rekognition",
                                model="rekognition-index-faces",
                                usage="1 image",
                                timestamp=datetime.utcnow().isoformat()
                            )
                        except Exception as e:
                            logging.warning(f"Failed to record AI cost: {e}")
                        
                        print(f"    Face {i+1}: Successfully indexed.")

                except rekognition_client.exceptions.InvalidParameterException as e:
                    # This can happen if no face is detected in the cropped image by search_faces_by_image
                    print(f"    Face {i+1}: Could not process face. Maybe quality is too low. {e}")
                except Exception as e:
                    print(f"    Face {i+1}: An unexpected error occurred: {e}")

        except Exception as e:
            print(f"  An error occurred processing {filename}: {e}")


def _get_all_faces_from_collection(rekognition_client: boto3.client, collection_id: str) -> Optional[List[Dict[str, Any]]]:
    """Helper to paginate through all faces in a Rekognition collection."""
    all_faces = []
    next_token = None
    logging.info(f"Fetching all faces from collection '{collection_id}'...")
    while True:
        try:
            list_faces_args: Dict[str, Any] = {"CollectionId": collection_id, "MaxResults": 4096}
            if next_token:
                list_faces_args["NextToken"] = next_token
            
            response = rekognition_client.list_faces(**list_faces_args)
            all_faces.extend(response.get('Faces', []))
            
            next_token = response.get('NextToken')
            if not next_token:
                break
        except ClientError as e:
            logging.error(f"Error listing faces in collection '{collection_id}': {e}")
            return None
    return all_faces


def _identify_faces_in_image(
    rekognition_client: boto3.client, 
    collection_id: str, 
    image_path: str, 
) -> List[tuple[str, Dict[str, Any]]]:
    """Detects and identifies faces in a single image, returning their bounding boxes."""
    identifications = []
    image_file = os.path.basename(image_path)
    image_bytes = None
    logging.info(f"Identifying faces in {image_file}...")

    try:
        with open(image_path, 'rb') as img_file:
            image_bytes = img_file.read()
        pil_image = Image.open(BytesIO(image_bytes))
        width, height = pil_image.size
    except Exception as e:
        logging.error(f"Could not open image {image_file}: {e}")
        return identifications

    def extract_index_from_image_file(image_file_name: str) -> int:
        # image_file_name is like frame_0016.png
        return int(image_file_name.split('_')[-1].split('.')[0])

    try:
        detect_response = rekognition_client.detect_faces(Image={'Bytes': image_bytes})
        face_details = detect_response.get('FaceDetails', [])
        
        # Record cost for face detection: $0.001 per image
        try:
            config = get_shorts_config()
            user_id = config.get_user_id()
            video_id = config.get_video_id()
            _record_ai_provider_cost(
                user_id=user_id,
                video_id=video_id,
                cost="0.001000",
                operation_name="face_detection_for_identification",
                provider="aws_rekognition",
                model="rekognition-detect-faces",
                usage="1 image",
                timestamp=datetime.utcnow().isoformat()
            )
        except Exception as e:
            logging.warning(f"Failed to record AI cost: {e}")

        if not face_details:
            logging.info(f"  No faces detected in {image_file}.")
            return identifications
        
        logging.info(f"  Found {len(face_details)} faces in {image_file}. Trying to identify them.")



        for face_detail in face_details:
            bounding_box = face_detail['BoundingBox']
            
            left = int(round(bounding_box['Left'] * width))
            top = int(round(bounding_box['Top'] * height))
            box_width = int(round(bounding_box['Width'] * width))
            box_height = int(round(bounding_box['Height'] * height))
            right = left + box_width
            bottom = top + box_height
            
            cropped_image_pil = pil_image.crop((left, top, right, bottom))

            with BytesIO() as output_buffer:
                cropped_image_pil.save(output_buffer, format="JPEG")
                cropped_image_bytes = output_buffer.getvalue()

            try:
                search_response = rekognition_client.search_faces_by_image(
                    CollectionId=collection_id,
                    Image={'Bytes': cropped_image_bytes},
                    FaceMatchThreshold=95,
                    MaxFaces=1
                )
                
                # Record cost for face search: $0.001 per image
                try:
                    config = get_shorts_config()
                    user_id = config.get_user_id()
                    video_id = config.get_video_id()
                    _record_ai_provider_cost(
                        user_id=user_id,
                        video_id=video_id,
                        cost="0.001000",
                        operation_name="face_search_for_identification",
                        provider="aws_rekognition",
                        model="rekognition-search-faces",
                        usage="1 image",
                        timestamp=datetime.utcnow().isoformat()
                    )
                except Exception as e:
                    logging.warning(f"Failed to record AI cost: {e}")
                
                if search_response.get('FaceMatches'):
                    match = search_response['FaceMatches'][0]
                    matched_face_id = match['Face']['FaceId']
                    
                    detection_info = {
                        "image_file": image_file,
                        "index": extract_index_from_image_file(image_file),
                        "box_rel": bounding_box,
                        "box_px": {
                            "Left": left,
                            "Top": top,
                            "Width": box_width,
                            "Height": box_height
                        },
                        "similarity": match['Similarity']
                    }
                    identifications.append((matched_face_id, detection_info))
                    logging.info(f"    -> Identified face {matched_face_id} with similarity {match['Similarity']:.2f}%")

            except rekognition_client.exceptions.InvalidParameterException:
                logging.warning(f"    -> Could not identify a face from crop in {image_file}. Face might be too small or low quality.")
            except ClientError as e:
                logging.error(f"    -> A Rekognition error occurred while identifying a face from {image_file}: {e}")
    
    except ClientError as e:
        logging.error(f"A Rekognition client error occurred with {image_file}: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred with {image_file}: {e}")
    
    return identifications


@click.command('find-face-bounding-boxes-in-images')
@click.option('--images-folder-path', required=True, type=click.Path(exists=True, file_okay=False, dir_okay=True), help='Path to the folder containing images.')
@click.option('--output-file', required=True, type=click.Path(exists=False, dir_okay=False) , help='Path to save the JSON output file.')
@click.option('--collection-id', default='klippers-unique-faces', help='AWS Rekognition collection ID.')
def find_face_bounding_boxes_in_images(images_folder_path: str, output_file: str, collection_id: str):
    _find_face_bounding_boxes_in_images(images_folder_path, output_file, collection_id)

def _find_face_bounding_boxes_in_images(images_folder_path: str, output_file: str, collection_id: str):
    """
    Finds all faces from a Rekognition collection in a folder of images and records their bounding boxes.
    """
    settings = Settings()
    rekognition_client = boto3.client(
        'rekognition',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )
    
    # 1. Get all faces from the collection
    all_faces = _get_all_faces_from_collection(rekognition_client, collection_id)
    if all_faces is None:
        return

    if not all_faces:
        logging.warning(f"No faces found in collection '{collection_id}'.")
        return
    
    logging.info(f"Found {len(all_faces)} faces in collection.")
    face_detections: Dict[str, list] = {face['FaceId']: [] for face in all_faces}

    # 2. Get image files
    image_extensions = {'.jpg', '.jpeg', '.png'}
    try:
        image_files = [f for f in os.listdir(images_folder_path) if os.path.splitext(f)[1].lower() in image_extensions]
        logging.info(f"Found {len(image_files)} images to process in '{images_folder_path}'.")
    except FileNotFoundError:
        logging.error(f"Error: The directory '{images_folder_path}' was not found.")
        return

    # 3. Process each image
    with ThreadPoolExecutor(max_workers=min(10, len(image_files))) as executor:
        future_to_image = {
            executor.submit(
                _identify_faces_in_image,
                rekognition_client,
                collection_id,
                os.path.join(images_folder_path, image_file)
            ): image_file for image_file in image_files
        }
        
        for future in as_completed(future_to_image):
            image_file = future_to_image[future]
            try:
                identifications = future.result()
                for face_id, detection_info in identifications:
                    if face_id in face_detections:
                        face_detections[face_id].append(detection_info)
            except Exception as e:
                logging.error(f"Error processing {image_file}: {e}")

    # 4. Save results to JSON file
    try:
        # sort the face detections by frame id and face index
        final_model = sort_recognized_faces_by_frame_and_index(RecognizedFacesBBoxes.model_validate(face_detections))
        with open(output_file, 'w') as f:
            json.dump(final_model.model_dump(), f, indent=4)
        logging.info(f"Face bounding box detection complete. Results written to {output_file}")
    except IOError as e:
        logging.error(f"Error writing to output file {output_file}: {e}")




@click.command('set-boxes-on-images')
@click.option('--images-folder-path', required=True, type=click.Path(exists=True, file_okay=False, dir_okay=True), help='Path to the folder containing images.')
@click.option('--output-dir', required=True, type=click.Path(file_okay=False, dir_okay=True) , help='Path to save the modified images.')
@click.option('--faces-bounding-boxes-file-path', required=True, type=click.Path(exists=True, file_okay=True, dir_okay=False), help='Path to the JSON file with faces bounding boxes.')
@click.option('--face-id', default=0, type=str, help='Index of the face to set on the images.')
def set_boxes_on_images(images_folder_path: str, output_dir: str, faces_bounding_boxes_file_path: str, face_id: str):
    _set_boxes_on_images(images_folder_path, output_dir, faces_bounding_boxes_file_path, face_id)


def _set_boxes_on_images(images_folder_path: str, output_dir: str, faces_bounding_boxes_file_path: str, face_id: str):
    """
    Loads images from a folder, draws bounding boxes for a specific face, and saves them to an output directory.
    """
    # 1. Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # 2. Load and parse bounding boxes file
    try:
        with open(faces_bounding_boxes_file_path, 'r') as f:
            data = json.load(f)
        faces_bboxes = RecognizedFacesBBoxes.model_validate(data)
    except Exception as e:
        logging.error(f"Error reading or parsing bounding boxes file: {e}")
        return

    if face_id not in faces_bboxes.root:
        logging.error(f"Face with ID {face_id} not found in bounding boxes file.")
        return

    # 3. Select the face_id using faces_index
    target_face_id = face_id
    logging.info(f"Selected face with ID: {target_face_id}")

    # 4. Get bounding boxes for the selected face and group them by image file
    face_occurrences = faces_bboxes.root.get(target_face_id, [])
    boxes_by_image = {}
    for face in face_occurrences:
        if face.image_file:
            if face.image_file not in boxes_by_image:
                boxes_by_image[face.image_file] = []
            boxes_by_image[face.image_file].append(face.box_px)

    # 5. Process all images from the input folder
    image_extensions = ('.png', '.jpg', '.jpeg')
    processed_files = 0
    for filename in os.listdir(images_folder_path):
        if filename.lower().endswith(image_extensions):
            image_path = os.path.join(images_folder_path, filename)
            output_path = os.path.join(output_dir, filename)

            try:
                with Image.open(image_path) as img:
                    # Check if there are boxes for this image
                    if filename in boxes_by_image:
                        draw = ImageDraw.Draw(img)
                        for box in boxes_by_image[filename]:
                            left = box.Left
                            top = box.Top
                            right = left + box.Width
                            bottom = top + box.Height
                            draw.rectangle([left, top, right, bottom], outline="red", width=3)
                    
                    # Save the image (modified or original)
                    img.save(output_path)
                    processed_files += 1
            except IOError as e:
                logging.error(f"Could not process image {filename}: {e}")
    
    logging.info(f"Processed {processed_files} images saved to {output_dir}")


@click.command('delete-collection')
@click.option('--collection-id', default='klippers-unique-faces', help='AWS Rekognition collection ID.')
def delete_collection(collection_id: str):
    _delete_collection(collection_id)

def _delete_collection(collection_id: str):
    settings = Settings()
    rekognition_client = boto3.client(
        'rekognition',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )
    rekognition_client.delete_collection(CollectionId=collection_id)


@click.command('list-collections')
def list_collections():
    _list_collections()

def _list_collections():
    settings = Settings()
    rekognition_client = boto3.client(
        'rekognition',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )
    response = rekognition_client.list_collections()
    print(response)



@click.group("aws-face-recognition")
def aws_face_recognition_command():
    """AWS Face Recognition CLI Tool"""
    pass


# Add commands to the group
aws_face_recognition_command.add_command(recognize_faces)
aws_face_recognition_command.add_command(merge_to_one_image)
aws_face_recognition_command.add_command(save_unique_faces)
aws_face_recognition_command.add_command(fetch_unique_faces)
aws_face_recognition_command.add_command(delete_collection)
aws_face_recognition_command.add_command(find_face_bounding_boxes_in_images)
aws_face_recognition_command.add_command(list_collections)
aws_face_recognition_command.add_command(set_boxes_on_images)



if __name__ == '__main__':
    aws_face_recognition_command()
