#!/usr/bin/env python3
"""
Script to run a parent Fargate task directly
This bypasses the state machine and runs a parent task that processes the initial steps

Environment Variables Required:
================================
- USER_ID: User identifier
- VIDEO_ID: Video identifier
- VIDEO_WAREHOUSE_S3_BUCKET_NAME: S3 bucket name
- S3_WAREHOUSE_PREFIX: S3 prefix (default: subtiter_warehouse)

Optional Environment Variables:
================================
- REGION: AWS region (default: eu-west-1)
- MOCK_PROCESS: Mock processing mode (default: false)
- FARGATE_TOKEN: Authentication token
- WEBAPP_API_HOST: API host
- WEBAPP_API_URL: API URL
- CLUSTER_NAME: ECS cluster name (default: subtiter-cluster)
- TASK_DEFINITION_NAME: ECS task definition (default: subtiter-video-processing)
- DO_DB_OPERATION: Enable database operations (default: true)
- SEND_CHAT: Enable chat messages (default: true)
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
    RED = '\033[0;31m'
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
    """Print error message in red"""
    print_colored(text, Colors.RED)

def print_warning(text):
    """Print warning message in yellow"""
    print_colored(text, Colors.YELLOW)

def main():
    print_info("=== Subtiter Parent Task Runner ===")
    print_info("Running a parent Fargate task directly")
    print()
    
    # Get required configuration from environment variables
    user_id = os.environ.get("USER_ID")
    video_id = os.environ.get("VIDEO_ID")
    bucket_name = os.environ.get("VIDEO_WAREHOUSE_S3_BUCKET_NAME")
    
    # Validate required parameters
    if not user_id:
        print_error("ERROR: USER_ID environment variable is required")
        sys.exit(1)
    
    if not video_id:
        print_error("ERROR: VIDEO_ID environment variable is required")
        sys.exit(1)
    
    if not bucket_name:
        print_error("ERROR: VIDEO_WAREHOUSE_S3_BUCKET_NAME environment variable is required")
        sys.exit(1)
    
    # Get optional configuration with defaults
    region = os.environ.get("REGION", "eu-west-1")
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
    cluster_name = os.environ.get("CLUSTER_NAME", "subtiter-cluster")
    task_definition_name = os.environ.get("TASK_DEFINITION_NAME", "subtiter-video-processing")
    container_name = os.environ.get("CONTAINER_NAME", "subtitercmd")
    do_db_operation = os.environ.get("DO_DB_OPERATION", "true")
    send_chat = os.environ.get("SEND_CHAT", "true")
    video_warehouse_root_dir = os.environ.get("VIDEO_WAREHOUSE_ROOT_DIR", "/app/subtiter_warehouse")
    
    # Display configuration
    print_info("Configuration:")
    print(f"  Region: {region}")
    print(f"  Cluster: {cluster_name}")
    print(f"  Task Definition: {task_definition_name}")
    print(f"  Container: {container_name}")
    print(f"  User ID: {user_id}")
    print(f"  Video ID: {video_id}")
    print(f"  S3 Bucket: {bucket_name}")
    print(f"  S3 Prefix: {s3_prefix}")
    print(f"  Mock Process: {mock_process}")
    print(f"  Do DB Operation: {do_db_operation}")
    print(f"  Send Chat: {send_chat}")
    print()
    
    try:
        # Initialize boto3 clients
        print_info("Initializing AWS clients...")
        ec2_client = boto3.client('ec2', region_name=region)
        ecs_client = boto3.client('ecs', region_name=region)
        
        # Fetch VPC, Subnets, and Security Group
        print_info("Fetching network configuration...")
        
        # Get default VPC
        vpcs = ec2_client.describe_vpcs(Filters=[{'Name': 'isDefault', 'Values': ['true']}])
        if not vpcs['Vpcs']:
            print_error("ERROR: No default VPC found")
            sys.exit(1)
        vpc_id = vpcs['Vpcs'][0]['VpcId']
        print(f"  VPC ID: {vpc_id}")
        
        # Get public subnets
        subnets = ec2_client.describe_subnets(
            Filters=[
                {'Name': 'vpc-id', 'Values': [vpc_id]},
                {'Name': 'map-public-ip-on-launch', 'Values': ['true']}
            ]
        )
        if not subnets['Subnets']:
            print_error("ERROR: No public subnets found in default VPC")
            sys.exit(1)
        subnet_ids = [subnet['SubnetId'] for subnet in subnets['Subnets']]
        print(f"  Subnets: {', '.join(subnet_ids)}")
        
        # Get security group
        security_groups = ec2_client.describe_security_groups(
            Filters=[{'Name': 'group-name', 'Values': ['subtiter-fargate-sg']}]
        )
        if not security_groups['SecurityGroups']:
            print_error("ERROR: Security group 'subtiter-fargate-sg' not found")
            sys.exit(1)
        sg_id = security_groups['SecurityGroups'][0]['GroupId']
        print(f"  Security Group: {sg_id}")
        print()
        
        # Create task input JSON
        task_input = {
            "VIDEO_WAREHOUSE_S3_BUCKET_NAME": bucket_name,
            "S3_WAREHOUSE_PREFIX": s3_prefix,
            "user_id": user_id,
            "video_id": video_id,
            "video_warehouse_root_dir": video_warehouse_root_dir,
            "do_db_operation": do_db_operation,
            "send_chat": send_chat,
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
        
        print_info("Task Input JSON:")
        print(json.dumps(task_input, indent=2))
        print()
        
        # Run the Fargate task
        print_info("Starting parent Fargate task...")
        
        response = ecs_client.run_task(
            cluster=cluster_name,
            taskDefinition=task_definition_name,
            launchType='FARGATE',
            networkConfiguration={
                'awsvpcConfiguration': {
                    'subnets': subnet_ids,
                    'securityGroups': [sg_id],
                    'assignPublicIp': 'ENABLED'
                }
            },
            overrides={
                'containerOverrides': [
                    {
                        'name': container_name,
                        'environment': [
                            {
                                'name': 'TASK_INPUT',
                                'value': json.dumps(task_input)
                            },
                            {
                                'name': 'FARGATE_EXECUTION_ROLE',
                                'value': 'parent'
                            }
                        ],
                    },
                ],
            },
        )
        
        # Check if task started successfully
        if not response['tasks']:
            print_error("ERROR: Failed to start task")
            if response.get('failures'):
                print_error("Failures:")
                for failure in response['failures']:
                    print_error(f"  - {failure.get('reason', 'Unknown reason')}")
            sys.exit(1)
        
        task_arn = response['tasks'][0]['taskArn']
        task_id = task_arn.split('/')[-1]
        
        # Display success message and monitoring information
        print()
        print_success("✓ Parent Fargate task started successfully!")
        print()
        print(f"Task ARN: {task_arn}")
        print(f"Task ID: {task_id}")
        print()
        print("=" * 80)
        print_info("Monitoring Commands:")
        print()
        print("Check task status (AWS CLI):")
        print(f"  aws ecs describe-tasks \\")
        print(f"    --cluster {cluster_name} \\")
        print(f"    --tasks {task_arn} \\")
        print(f"    --region {region}")
        print()
        print("View task logs (AWS CLI):")
        print(f"  aws logs tail /ecs/subtiter --follow --filter-pattern '{task_id}'")
        print()
        print("List all tasks in cluster:")
        print(f"  aws ecs list-tasks \\")
        print(f"    --cluster {cluster_name} \\")
        print(f"    --region {region}")
        print()
        print_info("AWS Console:")
        console_url = f"https://{region}.console.aws.amazon.com/ecs/v2/clusters/{cluster_name}/tasks/{task_id}/logs?region={region}"
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
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()


