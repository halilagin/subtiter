#!/bin/bash
# Script to run the Step Functions state machine for video processing
# This is a wrapper that calls the Python implementation
#
# Environment Variables Passed to Fargate Tasks:
# ==============================================
# PARENT TASK: TASK_INPUT (JSON), FARGATE_EXECUTION_ROLE=parent
# CHILD TASKS: TASK_INPUT (JSON), SEGMENT_NUMBER (1..n), FARGATE_EXECUTION_ROLE=child

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Export AWS_CMD if not already set
export AWS_CMD="${AWS_CMD:-kaws_klippers_cli}"
# Only set default values if USER_ID and VIDEO_ID are not already set
export USER_ID="${USER_ID:-rojev}"
export VIDEO_ID="${VIDEO_ID:-rodin2025nov15}"
export VIDEO_WAREHOUSE_S3_BUCKET_NAME="${VIDEO_WAREHOUSE_S3_BUCKET_NAME:-697903399510-videos-warehouse}"

# Call the Python script using uv
cd "$SCRIPT_DIR"
uv run run_state_machine.py "$@"
