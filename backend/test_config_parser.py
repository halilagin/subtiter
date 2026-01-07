import json
from app.klipperscmd.clippercmd.model.short_config_model import KlippersShortsConfig
import os

def test_parsing():
    try:
        # Construct the full path to the JSON file
        json_file_path = os.path.join(os.path.dirname(__file__), '..', 'app', 'klippers_warehouse', 'user123', 'dana_podcast', 'shorts_config.json')

        # Correct the path for running from the project root
        project_root = '/Users/halilagin/root/github/klippers.ai/backend'
        json_file_path = os.path.join(project_root, 'app/klippers_warehouse/user123/dana_podcast/shorts_config.json')


        with open(json_file_path, 'r') as f:
            data = json.load(f)
        
        config = KlippersShortsConfig.model_validate(data)
        print(config)
        print("Successfully parsed shorts_config.json")
    except Exception as e:
        print(f"Failed to parse shorts_config.json: {e}")

if __name__ == "__main__":
    test_parsing()
