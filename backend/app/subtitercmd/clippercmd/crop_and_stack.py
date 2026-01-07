# flake8: noqa: E501
# clipper/clippercmd/crop_and_stack.py


import click
import logging
from .utils import get_video_info
from config import  get_shorts_config
from .crop_and_stack_ai import _crop_and_stack_ai
from .crop_and_stack_manual import _crop_and_stack_manual
from .model.subtiter_model import CroppingOperator


@click.command('crop-and-stack')
@click.option('--cropping-operator', type=click.Choice(['AI', 'manual', 'custom']), required=True)
@click.option('--input-video-path', type=click.Path(exists=True), required=True)
@click.option('--faces-bounding-boxes-path', type=click.Path(exists=True), required=True)
@click.option('--output-video-path', type=click.Path(), required=True)
@click.option('--reference-image-time-interval', type=int, default=6, required=False)
@click.option('--num-threads', type=int, default=10,
              help='Number of threads to use for processing (auto-detect if not specified)')
@click.option('--segment-number', type=int, required=True)
def crop_and_stack_command(cropping_operator, segment_number):
    _crop_and_stack(cropping_operator, segment_number)

def _crop_and_stack(cropping_operator=None, segment_number=None):
    if segment_number is None:
        raise ValueError("Segment number is required")
    
    config = get_shorts_config()
    if cropping_operator is None:
        cropping_operator = config.config_json.cropping_operator
    
    if cropping_operator == CroppingOperator.AI:
        _crop_and_stack_ai(segment_number, resolution_mode=config.config_json.target_resolution_mode)
        # _crop_and_stack_ai(segment_number, resolution_mode="4k")
    elif cropping_operator == CroppingOperator.MANUAL:
        _crop_and_stack_manual(segment_number, resolution_mode="hd")
    else:
        raise ValueError(f"Invalid cropping operator: {cropping_operator}")