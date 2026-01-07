#!/bin/bash
set -e

# Trigger Step Function to process a video
# Usage: ./trigger-step-function.sh <user_id> <video_id> [region]

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./trigger-step-function.sh <user_id> <video_id> [region]"
    echo "Example: ./trigger-step-function.sh a285b474-7081-7094-7d0f-a3db04a98629 947ff41e-11d5-4f11-9211-c32f3b3da0c9"
    exit 1
fi

USER_ID=$1
VIDEO_ID=$2
REGION=${3:-eu-west-1}
STATE_MACHINE_NAME="klippers-video-processing-workflow"

echo "=== Triggering Klippers Video Processing ==="
echo "User ID: $USER_ID"
echo "Video ID: $VIDEO_ID"
echo "Region: $REGION"

# Get the state machine ARN
STATE_MACHINE_ARN=$(kaws_klippers_cli stepfunctions list-state-machines --region $REGION --query "stateMachines[?name=='$STATE_MACHINE_NAME'].stateMachineArn" --output text)

if [ -z "$STATE_MACHINE_ARN" ]; then
    echo "ERROR: State machine '$STATE_MACHINE_NAME' not found in region $REGION"
    exit 1
fi

echo "State Machine ARN: $STATE_MACHINE_ARN"

# Create input JSON
INPUT_JSON=$(cat <<EOF
{
  "user_id": "$USER_ID",
  "video_id": "$VIDEO_ID",
  "video_warehouse_root_dir": "/app/klippers_warehouse",
  "do_db_operation": "true",
  "send_chat": "true",
  "mock_process": "false"
}
EOF
)

echo "Input JSON:"
echo "$INPUT_JSON"

# Start execution
EXECUTION_ARN=$(kaws_klippers_cli stepfunctions start-execution \
    --region $REGION \
    --state-machine-arn $STATE_MACHINE_ARN \
    --input "$INPUT_JSON" \
    --query 'executionArn' \
    --output text)

echo ""
echo "=== Execution Started ==="
echo "Execution ARN: $EXECUTION_ARN"
echo ""
echo "To check status, run:"
echo "kaws_klippers_cli stepfunctions describe-execution --region $REGION --execution-arn $EXECUTION_ARN"
echo ""
echo "To view logs:"
echo "kaws_klippers_cli logs tail /ecs/klippers-video-processing --region $REGION --follow"

