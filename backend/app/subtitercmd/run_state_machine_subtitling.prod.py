#!/usr/bin/env python3
# flake8: noqa: E501
"""
Script to run the Step Functions state machine for subtitling processing
This runs a single Fargate task for subtitling

Environment Variables Passed to Fargate Task:
==============================================

TASK receives:
  - TASK_INPUT: JSON string with all task parameters

The state machine:
  1. Runs single Fargate task with TASK_INPUT
  2. Sends completion message via Lambda
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
    print_info("=== Subtiter Subtitling Processing State Machine ===")
    
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
    print()
    
    try:
        # Initialize boto3 client
        sfn_client = boto3.client('stepfunctions', region_name=region)
        
        # Find state machine
        print_info("Finding state machine...")
        
        response = sfn_client.list_state_machines()
        state_machine_arn = None
        
        for state_machine in response.get('stateMachines', []):
            if state_machine['name'] == 'subtiter-subtitling-processing':
                state_machine_arn = state_machine['stateMachineArn']
                break
        
        if not state_machine_arn:
            print_error("ERROR: State machine 'subtiter-subtitling-processing' not found")
            print_error("Please ensure the Terraform infrastructure is deployed")
            sys.exit(1)
        
        print_success(f"Found state machine: {state_machine_arn}")
        
        # Create execution name with timestamp (max 80 chars for AWS)
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        # Shorten user_id and video_id to first 8 chars to keep under 80 char limit
        user_id_short = user_id[:8] if len(user_id) > 8 else user_id
        video_id_short = video_id[:8] if len(video_id) > 8 else video_id
        execution_name = f"sub-proc-{user_id_short}-{video_id_short}-{timestamp}"
        
        # Create input JSON
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
        
        # Start execution
        print_info("Starting execution...")
        
        response = sfn_client.start_execution(
            stateMachineArn=state_machine_arn,
            name=execution_name,
            input=json.dumps(task_input)
        )
        
        execution_arn = response['executionArn']
        
        # Display success message and monitoring information
        print()
        print_success("✓ State machine execution started!")
        print()
        print(f"Execution ARN: {execution_arn}")
        print(f"Execution Name: {execution_name}")
        print()
        print("=" * 80)
        print_info("Monitoring Commands:")
        print()
        print("Check execution status (boto3):")
        print(f"  import boto3")
        print(f"  sfn = boto3.client('stepfunctions', region_name='{region}')")
        print(f"  sfn.describe_execution(executionArn='{execution_arn}')")
        print()
        print("Check execution status (AWS CLI):")
        print(f"  aws stepfunctions describe-execution \\")
        print(f"    --execution-arn {execution_arn} \\")
        print(f"    --region {region}")
        print()
        print("Get execution history (AWS CLI):")
        print(f"  aws stepfunctions get-execution-history \\")
        print(f"    --execution-arn {execution_arn} \\")
        print(f"    --region {region}")
        print()
        print("View state machine logs:")
        print(f"  aws logs tail /aws/stepfunctions/subtiter-subtitling-processing --follow")
        print()
        print("View Fargate task logs:")
        print(f"  aws logs tail /ecs/subtiter --follow")
        print()
        print_info("AWS Console:")
        console_url = f"https://{region}.console.aws.amazon.com/states/home?region={region}#/executions/details/{execution_arn}"
        print(f"  {console_url}")
        print("=" * 80)
        
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
        sys.exit(1)

if __name__ == "__main__":
    main()

