#!/usr/bin/env python3
"""
Script to invoke the Lambda function for video processing
This sends a message to the chat room via Lambda

Environment Variables:
==============================================
USER_ID: User identifier
VIDEO_ID: Video identifier
VIDEO_WAREHOUSE_S3_BUCKET_NAME: S3 bucket for video storage
S3_WAREHOUSE_PREFIX: S3 prefix for warehouse
MOCK_PROCESS: Whether to mock the process (true/false)
FARGATE_TOKEN: Token for Fargate authentication
WEBAPP_API_HOST: Web app API host
WEBAPP_API_PORT: Web app API port
WEBAPP_API_HOST_FARGATE: Web app API host for Fargate
WEBAPP_API_PORT_FARGATE: Web app API port for Fargate
WEBAPP_API_URL: Web app API URL
WEBAPP_API_URL_FARGATE: Web app API URL for Fargate
CHAT_ROOM_ID: Chat room identifier
"""

import os
import sys
import json
import boto3
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError

# Colors for terminal output
class Colors:
    BLUE = '\033[0;34m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[0;33m'
    NC = '\033[0m'  # No Color

def print_colored(text, color):
    """Print text with color"""
    print(f"{color}{text}{Colors.NC}")

def print_info(text):
    """Print info message in blue"""
    print_colored(text, Colors.BLUE)

def print_success(text):
    """Print success message in green"""
    print_colored(text, Colors.GREEN)

def print_error(text):
    """Print error message in yellow"""
    print_colored(text, Colors.YELLOW)

def main():
    print_info("=== Subtiter Lambda Function Invocation ===")
    
    # Get configuration from environment variables with defaults
    region = os.environ.get("REGION", "eu-west-1")
    user_id = os.environ.get("USER_ID", "rojev")
    video_id = os.environ.get("VIDEO_ID", "rodin2025nov15")
    bucket_name = os.environ.get("VIDEO_WAREHOUSE_S3_BUCKET_NAME", "697903399510-videos-warehouse")
    s3_prefix = os.environ.get("S3_WAREHOUSE_PREFIX", "subtiter_warehouse")
    mock_process = os.environ.get("MOCK_PROCESS", "false")
    fargate_token = os.environ.get("FARGATE_TOKEN", "fargate-token")
    webapp_api_host = os.environ.get("WEBAPP_API_HOST", "subtiter.ai")
    webapp_api_port = int(os.environ.get("WEBAPP_API_PORT", "80"))
    webapp_api_host_fargate = os.environ.get("WEBAPP_API_HOST_FARGATE", "subtiter.ai")
    webapp_api_port_fargate = int(os.environ.get("WEBAPP_API_PORT_FARGATE", "80"))
    webapp_api_url = os.environ.get("WEBAPP_API_URL", "https://subtiter.ai")
    webapp_api_url_fargate = os.environ.get("WEBAPP_API_URL_FARGATE", "https://subtiter.ai")
    chat_room_id = os.environ.get("CHAT_ROOM_ID", video_id)
    
    # Display configuration
    print_info("Configuration:")
    print(f"  Region: {region}")
    print(f"  User ID: {user_id}")
    print(f"  Video ID: {video_id}")
    print(f"  S3 Bucket: {bucket_name}")
    print(f"  S3 Prefix: {s3_prefix}")
    print(f"  Mock Process: {mock_process}")
    print(f"  Chat Room ID: {chat_room_id}")
    print()
    
    try:
        # Initialize boto3 client
        lambda_client = boto3.client('lambda', region_name=region)
        
        # Lambda function name (from Terraform: aws_lambda_function.send_completion_message)
        lambda_function_name = "subtiter-send-completion-message"
        
        print_info(f"Invoking Lambda function: {lambda_function_name}")
        
        # Create input JSON for Lambda
        task_input = {
            "task_input": {
                "VIDEO_WAREHOUSE_S3_BUCKET_NAME": bucket_name,
                "S3_WAREHOUSE_PREFIX": s3_prefix,
                "user_id": user_id,
                "video_id": video_id,
                "mock_process": mock_process,
                "RUN_SUBTITERCMD_ON": "fargate",
                "FARGATE_TOKEN": fargate_token,
                "WEBAPP_API_HOST": webapp_api_host,
                "WEBAPP_API_PORT": webapp_api_port,
                "WEBAPP_API_HOST_FARGATE": webapp_api_host_fargate,
                "WEBAPP_API_PORT_FARGATE": webapp_api_port_fargate,
                "WEBAPP_API_URL": webapp_api_url,
                "WEBAPP_API_URL_FARGATE": webapp_api_url_fargate,
                "CHAT_ROOM_ID": chat_room_id
            }
        }
        
        # Invoke Lambda function
        print_info("Sending request to Lambda...")
        
        response = lambda_client.invoke(
            FunctionName=lambda_function_name,
            InvocationType='RequestResponse',  # Synchronous invocation
            Payload=json.dumps(task_input)
        )
        
        # Parse response
        status_code = response['StatusCode']
        payload = json.loads(response['Payload'].read())
        
        # Display results
        print()
        if status_code == 200:
            print_success("✓ Lambda function invoked successfully!")
        else:
            print_error(f"⚠ Lambda function returned status code: {status_code}")
        
        print()
        print("=" * 80)
        print_info("Lambda Response:")
        print(json.dumps(payload, indent=2))
        print("=" * 80)
        print()
        
        # Check for function error
        if 'FunctionError' in response:
            print_error(f"Function Error: {response['FunctionError']}")
            sys.exit(1)
        
        # Check response body for errors
        if isinstance(payload, dict):
            if payload.get('statusCode', 200) != 200:
                print_error(f"Lambda returned error status: {payload.get('statusCode')}")
                if 'body' in payload:
                    print_error(f"Error body: {payload['body']}")
                sys.exit(1)
        
        print_success("Lambda invocation completed successfully!")
        
    except NoCredentialsError:
        print_error("ERROR: AWS credentials not found")
        print_error("Please configure AWS credentials using 'aws configure' or environment variables")
        sys.exit(1)
    except ClientError as e:
        print_error(f"AWS API error: {e}")
        print_error(f"Error code: {e.response['Error']['Code']}")
        print_error(f"Error message: {e.response['Error']['Message']}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

