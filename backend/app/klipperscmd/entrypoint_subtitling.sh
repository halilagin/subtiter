#!/bin/bash
set -e

# This script is the entrypoint for the Fargate task
# It receives JSON input from environment variable TASK_INPUT
# and extracts the necessary parameters to run the video processing

echo "=== Klipperscmd Fargate Task Starting ==="
echo "Timestamp: $(date)"

# Check if jq is installed
if ! which jq > /dev/null 2>&1; then
    echo "ERROR: jq is not installed"
    exit 1
fi

# Parse JSON input from environment variable
if [ -z "$TASK_INPUT" ]; then
    echo "ERROR: TASK_INPUT environment variable is not set"
    exit 1
fi

if [ -f "/app/.aws_secrets/aws_secrets" ]; then
    source /app/.aws_secrets/aws_secrets
fi

echo "Received TASK_INPUT: $TASK_INPUT"

# Extract parameters from JSON using jq
export USER_ID=$(echo "$TASK_INPUT" | jq -r '.user_id')
export VIDEO_ID=$(echo "$TASK_INPUT" | jq -r '.video_id')
export VIDEO_WAREHOUSE_ROOT_DIR=$(echo "$TASK_INPUT" | jq -r '.video_warehouse_root_dir // "/app/klippers_warehouse"')
export DO_DB_OPERATION=$(echo "$TASK_INPUT" | jq -r '.do_db_operation // "true"')
export SEND_CHAT=$(echo "$TASK_INPUT" | jq -r '.send_chat // "true"')
export MOCK_PROCESS=$(echo "$TASK_INPUT" | jq -r '.mock_process // "false"')
export VIDEO_WAREHOUSE_S3_BUCKET_NAME=$(echo "$TASK_INPUT" | jq -r '.VIDEO_WAREHOUSE_S3_BUCKET_NAME // "697903399510-videos-warehouse"')
export S3_WAREHOUSE_PREFIX=$(echo "$TASK_INPUT" | jq -r '.S3_WAREHOUSE_PREFIX // "klippers_warehouse"')
# Validate required parameters
if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
    echo "ERROR: user_id is required in TASK_INPUT"
    exit 1
fi

if [ "$VIDEO_ID" == "null" ] || [ -z "$VIDEO_ID" ]; then
    echo "ERROR: video_id is required in TASK_INPUT"
    exit 1
fi

echo "=== Configuration ==="
echo "USER_ID: $USER_ID"
echo "VIDEO_ID: $VIDEO_ID"
echo "VIDEO_WAREHOUSE_ROOT_DIR: $VIDEO_WAREHOUSE_ROOT_DIR"
echo "VIDEO_WAREHOUSE_S3_BUCKET_NAME: $VIDEO_WAREHOUSE_S3_BUCKET_NAME"
echo "S3_WAREHOUSE_PREFIX: $S3_WAREHOUSE_PREFIX"
echo "DO_DB_OPERATION: $DO_DB_OPERATION"
echo "SEND_CHAT: $SEND_CHAT"
echo "MOCK_PROCESS: $MOCK_PROCESS"

echo "===================="

# Record start time
start_time=$(date +%s)


# Set Python path and run the video processing
export PYTHONPATH=/app
cd /app

echo "Starting video subtitling processing..."

mkdir -p "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID"
set -x 
aws s3 cp --quiet "s3://$VIDEO_WAREHOUSE_S3_BUCKET_NAME/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/original.mp4" "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/original.mp4" || { echo "ERROR: Failed to download original.mp4"; exit 1; }
aws s3 cp --quiet "s3://$VIDEO_WAREHOUSE_S3_BUCKET_NAME/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/shorts_config.json" "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json" || { echo "ERROR: Failed to download shorts_config.json"; exit 1; }
aws s3 cp --quiet "s3://$VIDEO_WAREHOUSE_S3_BUCKET_NAME/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/thumbnail.png" "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/thumbnail.png" || { echo "ERROR: Failed to download thumbnail.png"; exit 1; }

stderr_path="$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/klippers.stderr"
stdout_path="$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/klippers.stdout"

# Run python script with a 50 minute timeout.
# If it times out, the exit code is 124.
# We disable exit on error (`+e`) for this command so we can handle the timeout case.
set +e
timeout 30m python -m run_app_subtitling
exit_code=$?
set -e


if [ $exit_code -eq 124 ]; then
    echo "ERROR: Fargate task timed out after 50 minutes."
    exit 1 # Exit with failure
elif [ $exit_code -ne 0 ]; then
    echo "ERROR: Fargate task python script failed with exit code $exit_code."
    # The script would have already printed errors to stderr, which are in klippers.stderr
    exit $exit_code
fi
# Always upload results, even on failure or timeout, for debugging.
aws s3 cp --quiet --recursive "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/" "s3://$VIDEO_WAREHOUSE_S3_BUCKET_NAME/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/" || echo "Warning: Failed to upload results to S3"

# Send completion message via chat CLI
echo "Sending completion message via chat CLI..."
echo "VIDEO_ID: $VIDEO_ID"
echo "USER_ID: $USER_ID"

# Extract API URL from TASK_INPUT or use defaults
WEBAPP_API_HOST_FARGATE=$(echo "$TASK_INPUT" | jq -r '.WEBAPP_API_HOST_FARGATE // "klippers.ai"')
WEBAPP_API_URL="https://${WEBAPP_API_HOST_FARGATE}"
echo "WEBAPP_API_URL: $WEBAPP_API_URL"

# python -m clippercmd.chat_cli send \
#   --message "7___Video processing completed" \
#   --room-id "${VIDEO_ID}" \
#   --client-id "bot-${USER_ID}-${VIDEO_ID}" \
#   --url "${WEBAPP_API_URL}" || echo "Warning: Failed to send completion message"



# Calculate execution time
end_time=$(date +%s)
execution_time=$((end_time - start_time))

echo "=== Klipperscmd Fargate Task Completed ==="
echo "Execution time: ${execution_time} seconds"
echo "Timestamp: $(date)"

exit 0

