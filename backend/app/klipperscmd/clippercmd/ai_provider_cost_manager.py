# flake8: noqa: E501
# clippercmd/ai_provider_cost_manager.py

"""
Command line tool to record AI provider costs for video processing operations.
"""

import click
import json
import os
import uuid
from pathlib import Path
from typing import Dict, Any



@click.command()
@click.option('--user-id', '-u', required=True, help='User ID')
@click.option('--video-id', '-v', required=True, help='Video ID')
@click.option('--cost', '-c', required=True, help='Cost in USD')
@click.option('--operation-name', '-on', required=True, help='Operation Name')
@click.option('--provider', '-p', required=True, help='Provider')
@click.option('--model', '-m', required=True, help='Model')
@click.option('--usage', '-us', required=True, help='Usage')
@click.option('--timestamp', '-ts', required=True, help='Timestamp')

def record_ai_provider_cost(user_id, video_id, cost, operation_name, provider, model, usage, timestamp):
    _record_ai_provider_cost(user_id, video_id, cost, operation_name, provider, model, usage, timestamp)

def _record_ai_provider_cost(user_id: str, video_id: str, cost: str, operation_name: str, provider: str, model: str, usage: str, timestamp: str):
    """
    Records AI provider cost to a unique JSON file in the ai_cost folder.
    
    File structure: VIDEO_WAREHOUSE_ROOT_DIR/user_id/video_id/ai_cost/<random-uuid>.json
    
    Args:
        user_id: User ID
        video_id: Video ID
        cost: Cost in USD
        operation_name: Name of the operation (e.g., 'transcription', 'face_detection')
        provider: Provider name (e.g., 'openai', 'aws_rekognition')
        model: Model name (e.g., 'whisper-1', 'gpt-4')
        usage: Usage details (e.g., '1000 tokens', '5 images')
        timestamp: Timestamp of the operation
    """
    # Get warehouse root directory from environment
    warehouse_root = os.getenv('VIDEO_WAREHOUSE_ROOT_DIR', '/tmp/klippers_warehouse')
    
    # Construct the path to ai_cost folder
    ai_cost_dir = Path(warehouse_root) / user_id / video_id / 'ai_cost'
    
    # Ensure the directory exists
    ai_cost_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate a random filename
    random_filename = f"{uuid.uuid4()}.json"
    ai_cost_file_path = ai_cost_dir / random_filename
    
    # Create the cost item
    cost_item: Dict[str, Any] = {
        'user_id': user_id,
        'video_id': video_id,
        'cost': float(cost),
        'operation_name': operation_name,
        'provider': provider,
        'model': model,
        'usage': usage,
        'timestamp': timestamp
    }
    
    # Write to the individual file
    try:
        with open(ai_cost_file_path, 'w') as f:
            json.dump(cost_item, f, indent=2)
        click.echo(f"Successfully recorded AI cost to {ai_cost_file_path}")
        click.echo(f"Cost: ${float(cost):.6f}")
    except IOError as e:
        click.echo(f"Error: Could not write to {ai_cost_file_path}: {e}", err=True)
        raise

    _calculate_total_cost(user_id, video_id)


def _calculate_total_cost(user_id: str, video_id: str):
    """
    Reads all JSON files in the ai_cost folder and writes the sum to ai_cost_total.json.
    
    File structure: 
    - Input: VIDEO_WAREHOUSE_ROOT_DIR/user_id/video_id/ai_cost/*.json
    - Output: VIDEO_WAREHOUSE_ROOT_DIR/user_id/video_id/ai_cost_total.json
    
    Args:
        user_id: User ID
        video_id: Video ID
    """
    # Get warehouse root directory from environment
    warehouse_root = os.getenv('VIDEO_WAREHOUSE_ROOT_DIR', '/tmp/klippers_warehouse')
    
    # Construct the path to ai_cost folder
    ai_cost_dir = Path(warehouse_root) / user_id / video_id / 'ai_cost'
    
    # Check if directory exists
    if not ai_cost_dir.exists():
        click.echo(f"Warning: ai_cost directory does not exist: {ai_cost_dir}", err=True)
        return
    
    # Initialize total cost and items list
    total_cost = 0.0
    ai_cost_items = []
    
    # Read all JSON files in the ai_cost directory
    for json_file in ai_cost_dir.glob('*.json'):
        try:
            with open(json_file, 'r') as f:
                cost_item = json.load(f)
                # Add to items list
                ai_cost_items.append(cost_item)
                # Add to total cost
                if 'cost' in cost_item:
                    total_cost += float(cost_item['cost'])
        except (json.JSONDecodeError, IOError) as e:
            click.echo(f"Warning: Could not read {json_file}: {e}", err=True)
            continue
    
    # Create the total cost data structure
    total_cost_data = {
        'total_cost': total_cost,
        'ai_cost_items': ai_cost_items
    }
    
    # Write to ai_cost_total.json in the parent directory (video_id level)
    video_dir = Path(warehouse_root) / user_id / video_id
    total_cost_file = video_dir / 'ai_cost_total.json'
    try:
        with open(total_cost_file, 'w') as f:
            json.dump(total_cost_data, f, indent=2)
        click.echo(f"Successfully calculated total cost: ${total_cost:.6f}")
        click.echo(f"Total items: {len(ai_cost_items)}")
        click.echo(f"Written to: {total_cost_file}")
    except IOError as e:
        click.echo(f"Error: Could not write to {total_cost_file}: {e}", err=True)
        raise


@click.command()
@click.option('--user-id', '-u', required=True, help='User ID')
@click.option('--video-id', '-v', required=True, help='Video ID')
def calculate_total_cost(user_id, video_id):
    """Calculate total cost from all individual cost files."""
    _calculate_total_cost(user_id, video_id)


@click.group("ai_provider_cost_manager")
def ai_provider_cost_manager_cli():
    """Klippers AI Provider Cost Manager - Record AI provider costs"""
    pass


# Add commands to the group
ai_provider_cost_manager_cli.add_command(record_ai_provider_cost, name='record')
ai_provider_cost_manager_cli.add_command(calculate_total_cost, name='calculate-total')


if __name__ == '__main__':
    ai_provider_cost_manager_cli()
