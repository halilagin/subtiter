# flake8: noqa: E501
# filesystem_wrapper/filesystem_wrapper.py

import boto3
from botocore.exceptions import ClientError
from config import settings
import os
from typing import Union



def make_file_remote(file_path: str, content: Union[str, bytes]):
    s3_bucket_defined = settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME is not None and settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME.strip() != ""
    if s3_bucket_defined:
        s3_prefix = file_path.replace(settings.VIDEO_WAREHOUSE_ROOT_DIR + "/", "")
        s3_client = boto3.client('s3')
        s3_client.put_object(Bucket=settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME, Key=s3_prefix, Body=content)

def write_to_file(file_path: str, content: Union[str, bytes]):
    """
    Writes content to a file, handling both text and binary data.
    """
    mode = 'wb' if isinstance(content, bytes) else 'w'
    with open(file_path, mode) as f:
        f.write(content)
    make_file_remote(file_path, content)



def make_file_local_path(file_path: str) -> str:
    s3_bucket_defined = settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME is not None and settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME.strip() != ""
    if s3_bucket_defined:
        s3_prefix = file_path.replace(settings.VIDEO_WAREHOUSE_ROOT_DIR + "/", "")
        s3_client = boto3.client('s3')

        try:
            # Check if object exists in S3
            s3_client.head_object(Bucket=settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME, Key=s3_prefix)

            # Object found, download it
            # Ensure local directory exists
            local_dir = os.path.dirname(file_path)
            if not os.path.exists(local_dir):
                os.makedirs(local_dir)

            s3_client.download_file(settings.VIDEO_WAREHOUSE_S3_BUCKET_NAME, s3_prefix, file_path)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                # Object doesn't exist in S3, will try to read from local filesystem
                pass
            else:
                # Re-raise other S3 related errors
                raise
    return file_path


def read_file_from_remote(file_path: str) -> Union[str, bytes]:
    """
    Reads content from a text file.
    If S3 is configured, it checks if the file exists there. If so, it's
    downloaded to the local path and then read. Otherwise, it attempts to
    read from the local path directly.
    """
    make_file_local_path(file_path)
    try:
        with open(file_path, 'r') as f:
            return f.read()
    except UnicodeDecodeError:
        with open(file_path, 'rb') as f:
            return f.read()


def read_from_file(file_path: str, no_cache: bool = False) -> Union[str, bytes]:
    """
    Reads content from a file.
    If S3 is configured, it checks if the file exists there. If so, it's
    downloaded to the local path and then read. Otherwise, it attempts to
    read from the local path directly.
    """
    if no_cache:
        return read_file_from_remote(file_path)

    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as f:
                return f.read()
        except UnicodeDecodeError:
            with open(file_path, 'rb') as f:
                return f.read()
    return read_file_from_remote(file_path)


def delete_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)