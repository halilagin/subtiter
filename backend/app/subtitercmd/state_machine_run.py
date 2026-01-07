import os
import json
import boto3
from datetime import datetime

# Variables
REGION = os.environ.get("REGION", "eu-west-1")
STATE_MACHINE_NAME = "subtiter-video-processing"

# Colors for output
BLUE = '\033[0;34m'
GREEN = '\033[0;32m'
YELLOW = '\033[0;33m'
NC = '\033[0m'

print(f"{BLUE}Starting Step Functions state machine execution...{NC}")

# Initialize boto3 client
sfn_client = boto3.client("stepfunctions", region_name=REGION)

# Define task input
TASK_INPUT = {
    "VIDEO_WAREHOUSE_S3_BUCKET_NAME": os.environ.get("VIDEO_WAREHOUSE_S3_BUCKET_NAME", "697903399510-videos-warehouse"),
    "S3_WAREHOUSE_PREFIX": os.environ.get("S3_WAREHOUSE_PREFIX", "subtiter_warehouse"),
    "user_id": os.environ.get("USER_ID", "2f4e1723-cda8-430f-b014-466e227e6f8b"),
    "video_id": os.environ.get("VIDEO_ID", "e95cef80-8dd6-4617-bc3d-2054302d2317"),
    "mock_process": os.environ.get("MOCK_PROCESS", "false"),
    "RUN_SUBTITERCMD_ON": "fargate",
    "FARGATE_TOKEN": os.environ.get("FARGATE_TOKEN", "fargate-token"),
    "WEBAPP_API_HOST": os.environ.get("WEBAPP_API_HOST", "subtiter.ai"),
    "WEBAPP_API_PORT": int(os.environ.get("WEBAPP_API_PORT", 80)),
    "WEBAPP_API_HOST_FARGATE": os.environ.get("WEBAPP_API_HOST_FARGATE", "subtiter.ai"),
    "WEBAPP_API_PORT_FARGATE": int(os.environ.get("WEBAPP_API_PORT_FARGATE", 80)),
    "WEBAPP_API_URL": os.environ.get("WEBAPP_API_URL", "https://subtiter.ai"),
    "WEBAPP_API_URL_FARGATE": os.environ.get("WEBAPP_API_URL_FARGATE", "https://subtiter.ai"),
    "CHAT_ROOM_ID": os.environ.get("VIDEO_ID", "e95cef80-8dd6-4617-bc3d-2054302d2317"),
}

print(f"{BLUE}STATE_MACHINE_INPUT: {json.dumps(TASK_INPUT, indent=2)}{NC}")

# Get state machine ARN
try:
    # List state machines and find the one we want
    paginator = sfn_client.get_paginator('list_state_machines')
    state_machine_arn = None
    
    for page in paginator.paginate():
        for sm in page['stateMachines']:
            if sm['name'] == STATE_MACHINE_NAME:
                state_machine_arn = sm['stateMachineArn']
                break
        if state_machine_arn:
            break
    
    if not state_machine_arn:
        print(f"{YELLOW}ERROR: State machine '{STATE_MACHINE_NAME}' not found{NC}")
        print(f"{YELLOW}Please ensure the Terraform infrastructure is deployed{NC}")
        exit(1)
    
    print(f"{BLUE}Found state machine: {state_machine_arn}{NC}")
    
except Exception as e:
    print(f"{YELLOW}ERROR: Failed to find state machine: {str(e)}{NC}")
    exit(1)

# Start execution
try:
    execution_name = f"video-processing-{TASK_INPUT['user_id']}-{TASK_INPUT['video_id']}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    response = sfn_client.start_execution(
        stateMachineArn=state_machine_arn,
        name=execution_name,
        input=json.dumps({
            "task_input": TASK_INPUT
        })
    )
    
    execution_arn = response['executionArn']
    
    print(f"{GREEN}State machine execution started!{NC}")
    print(f"\nExecution ARN: {execution_arn}")
    print(f"\nExecution Name: {execution_name}")
    
    print("\n" + "="*80)
    print("To check the status of the execution, run:")
    print(f"aws stepfunctions describe-execution --execution-arn {execution_arn} --region {REGION}")
    
    print("\nTo get execution history:")
    print(f"aws stepfunctions get-execution-history --execution-arn {execution_arn} --region {REGION}")
    
    print("\nTo view in AWS Console:")
    console_url = f"https://{REGION}.console.aws.amazon.com/states/home?region={REGION}#/executions/details/{execution_arn}"
    print(console_url)
    print("="*80)
    
except Exception as e:
    print(f"{YELLOW}ERROR: Failed to start execution: {str(e)}{NC}")
    exit(1)

