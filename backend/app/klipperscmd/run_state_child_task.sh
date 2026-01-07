#!/bin/bash
# Script to run a single child Fargate task directly
# This bypasses the state machine and runs a child task with specific segment number
#
# Environment Variables Required:
# ================================
# USER_ID: User identifier
# VIDEO_ID: Video identifier
# SEGMENT_NUMBER: Which segment to process (1, 2, 3, etc.)
# VIDEO_WAREHOUSE_S3_BUCKET_NAME: S3 bucket name
#
# Optional Environment Variables:
# ================================
# S3_WAREHOUSE_PREFIX: S3 prefix (default: klippers_warehouse)
# REGION: AWS region (default: eu-west-1)
# MOCK_PROCESS: Mock processing mode (default: false)
# FARGATE_TOKEN: Authentication token
# WEBAPP_API_HOST: API host
# WEBAPP_API_URL: API URL
#
# Example Usage:
# ==============
# export USER_ID="rojev"
# export VIDEO_ID="rodin2025nov15"
# export SEGMENT_NUMBER="1"
# export VIDEO_WAREHOUSE_S3_BUCKET_NAME="697903399510-videos-warehouse"
# ./run_child_task.sh

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set default values if not provided
export AWS_CMD="${AWS_CMD:-kaws_klippers_cli}"
export USER_ID="rojev"
export VIDEO_ID="rodin2025nov15"
export SEGMENT_NUMBER="2"
export VIDEO_WAREHOUSE_S3_BUCKET_NAME="${VIDEO_WAREHOUSE_S3_BUCKET_NAME:-697903399510-videos-warehouse}"
export S3_WAREHOUSE_PREFIX="${S3_WAREHOUSE_PREFIX:-klippers_warehouse}"
export REGION="${REGION:-eu-west-1}"
export MOCK_PROCESS="${MOCK_PROCESS:-false}"

# Display configuration
echo "=== Child Task Configuration ==="
echo "USER_ID: $USER_ID"
echo "VIDEO_ID: $VIDEO_ID"
echo "SEGMENT_NUMBER: $SEGMENT_NUMBER"
echo "VIDEO_WAREHOUSE_S3_BUCKET_NAME: $VIDEO_WAREHOUSE_S3_BUCKET_NAME"
echo "S3_WAREHOUSE_PREFIX: $S3_WAREHOUSE_PREFIX"
echo "REGION: $REGION"
echo "MOCK_PROCESS: $MOCK_PROCESS"
echo "================================"
echo ""

# Validate required parameters
if [ -z "$USER_ID" ]; then
    echo "ERROR: USER_ID environment variable is required"
    exit 1
fi

if [ -z "$VIDEO_ID" ]; then
    echo "ERROR: VIDEO_ID environment variable is required"
    exit 1
fi

if [ -z "$SEGMENT_NUMBER" ]; then
    echo "ERROR: SEGMENT_NUMBER environment variable is required"
    exit 1
fi

if [ -z "$VIDEO_WAREHOUSE_S3_BUCKET_NAME" ]; then
    echo "ERROR: VIDEO_WAREHOUSE_S3_BUCKET_NAME environment variable is required"
    exit 1
fi

# Call the Python script using uv
cd "$SCRIPT_DIR"
uv run run_state_child_task.py "$@"

