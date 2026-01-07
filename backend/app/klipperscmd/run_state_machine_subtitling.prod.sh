#!/bin/bash
# Script to run the Step Functions state machine for subtitling processing
# This is a wrapper that calls the Python implementation
#
# Environment Variables Passed to Fargate Task:
# ==============================================
# TASK_INPUT (JSON) - contains all task parameters
#
set -a
source ../../.env.prod
set +a
exec > /tmp/run_on_uploaded.fargate.log 2>&1

start_time=$(date +%s)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "SCRIPT_DIR: $SCRIPT_DIR"

export S3_WAREHOUSE_PREFIX=$(basename $VIDEO_WAREHOUSE_ROOT_DIR)

PYTHONPATH=.
aws s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/original.mp4 s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/original.mp4
aws s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/shorts_config.json
aws s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/thumbnail.png s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/thumbnail.png


# Call the Python script using uv
cd "$SCRIPT_DIR" && uv run run_state_machine_subtitling.prod.py "$@"

end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
