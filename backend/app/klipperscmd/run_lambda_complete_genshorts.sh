#!/bin/bash
# Script to invoke the Lambda function for video processing
# This is a wrapper that calls the Python implementation
#
# Environment Variables:
# ==============================================
# USER_ID: User identifier
# VIDEO_ID: Video identifier
# VIDEO_WAREHOUSE_S3_BUCKET_NAME: S3 bucket for video storage
# S3_WAREHOUSE_PREFIX: S3 prefix for warehouse
# MOCK_PROCESS: Whether to mock the process (true/false)
# FARGATE_TOKEN: Token for Fargate authentication
# WEBAPP_API_HOST: Web app API host
# WEBAPP_API_PORT: Web app API port
# WEBAPP_API_HOST_FARGATE: Web app API host for Fargate
# WEBAPP_API_PORT_FARGATE: Web app API port for Fargate
# WEBAPP_API_URL: Web app API URL
# WEBAPP_API_URL_FARGATE: Web app API URL for Fargate
# CHAT_ROOM_ID: Chat room identifier

set -e

cat ../../.env.local
source ../../.env.local
# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Export AWS_CMD if not already set
export AWS_CMD="${AWS_CMD:-kaws_klippers_cli}"
export USER_ID="${USER_ID:-rojev}"
export VIDEO_ID="${VIDEO_ID:-rodin2025nov15}"
export VIDEO_WAREHOUSE_S3_BUCKET_NAME="${VIDEO_WAREHOUSE_S3_BUCKET_NAME:-697903399510-videos-warehouse}"
export FARGATE_TOKEN="${FARGATE_TOKEN:-fargate-token}"
# Call the Python script using uv
cd "$SCRIPT_DIR"
uv run run_lambda_complete_genshorts.py "$@"

