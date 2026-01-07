# flake8: noqa: E501
from app.db.seed import sample_config_json
from app.config import settings
import requests
import os
from pathlib import Path

API_URL = "http://localhost:22081"
API_TOKEN = "1234567890"

def get_sample_video_path():
    rootdir = "/".join(os.path.abspath(__file__).split("/")[:-2])
    rootdir_path = Path(rootdir)
    video_path = rootdir_path / "app" / "subtitercmd" / "test_podcast.mp4"
    return video_path


def upload_video(video_path: str, user_id: str):
    print(f"Uploading video from {video_path}")
    url = f"{API_URL}/api/v1/videoupload/upload"
    response = requests.post(url, headers={"Authorization": f"Bearer {API_TOKEN}"}, files={"file": (str(video_path), open(video_path, "rb"), "video/mp4")})
    return response.json()

def GENERATE_SHORTS(user_video_id: str, config_json: dict):
    url = f"{API_URL}/api/v1/videoupload/generate-shorts/{user_video_id}"
    response = requests.post(url,
                 headers={"Authorization": f"Bearer {API_TOKEN}"},
                 json={"config_json": config_json})
    print(response.json())

def simulate_short_generation():
    video_path = get_sample_video_path()
    user_id = "user123"
    response = upload_video(video_path, user_id)
    print(f"Upload response: {response}")
    user_video_id = response["user_video_id"]
    # print(f"User video id: {user_video_id}")
    print(f"User video id: {user_video_id}")
    print(f"Generating shorts...")
    GENERATE_SHORTS(user_video_id, sample_config_json)
    # GENERATE_SHORTS("41f21be3-dcf1-4f7d-ba53-f79d7c7b925f", sample_config_json)

if __name__ == "__main__":
    simulate_short_generation()