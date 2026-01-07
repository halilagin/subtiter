#!/bin/bash
set -e

# This script is the entrypoint for the Fargate task
# It receives JSON input from environment variable TASK_INPUT
# and extracts the necessary parameters to run the video processing

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



#    GENERATE_SHORTS = "GENERATE_SHORTS"
#    APPLY_TRIM = "APPLY_TRIM"
#    APPLY_SUBTITLES = "APPLY_SUBTITLES"
#    APPLY_VOICE_OVER = "APPLY_VOICE_OVER"
#    APPLY_VLOG = "APPLY_VLOG"
#    APPLY_PODCAST_TEMPLATE = "APPLY_PODCAST_TEMPLATE"

# Check if FARGATE_EXECUTION_ROLE is set as an environment variable
# If not, try to extract it from TASK_INPUT JSON

set -x 
echo "entrypoint: TASK_INPUT: $TASK_INPUT"

export USER_ID=$(echo "$TASK_INPUT" | jq -r '.user_id')
export VIDEO_ID=$(echo "$TASK_INPUT" | jq -r '.video_id')
export VIDEO_WAREHOUSE_ROOT_DIR=$(echo "$TASK_INPUT" | jq -r '.video_warehouse_root_dir // "/app/klippers_warehouse"')
export VIDEO_WAREHOUSE_S3_BUCKET_NAME=$(echo "$TASK_INPUT" | jq -r '.VIDEO_WAREHOUSE_S3_BUCKET_NAME // "697903399510-videos-warehouse"')
export S3_WAREHOUSE_PREFIX=$(echo "$TASK_INPUT" | jq -r '.S3_WAREHOUSE_PREFIX // "klippers_warehouse"')


echo  "s3://$VIDEO_WAREHOUSE_S3_BUCKET_NAME/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/shorts_config.json"
aws s3 cp --quiet "s3://$VIDEO_WAREHOUSE_S3_BUCKET_NAME/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/shorts_config.json" "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json" || { echo "ERROR: Failed to download shorts_config.json"; exit 1; }

echo "entrypoint: shorts_config.json: $(cat "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json")"

export applied_application=$(cat "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json" | jq -r '.config_json.applied_application')
if [ -z "$applied_application" ]; then
    applied_application="GENERATE_SHORTS"
fi
applied_application=$(echo "$applied_application" | tr  '[:lower:]' '[:upper:]')

echo "entrypoint: applied_application: $applied_application"

if [ "$applied_application" == "GENERATE_SHORTS" ]; then
    echo "Running GENERATE_SHORTS entrypoint"
    bash /app/entrypoint_genshorts.sh
elif [ "$applied_application" == "APPLY_TRIM" ]; then
    echo "Running APPLY_TRIM entrypoint"
    bash /app/entrypoint_trimming.sh
elif [ "$applied_application" == "GENERATE_SUBTITLING" ]; then
    echo "Running GENERATE_SUBTITLING entrypoint"
    bash /app/entrypoint_subtitling.sh
elif [ "$applied_application" == "APPLY_VOICE_OVER" ]; then
    echo "Running APPLY_VOICE_OVER entrypoint"
    bash /app/entrypoint_apply_voice_over.sh
elif [ "$applied_application" == "APPLY_VLOG" ]; then
    echo "Running APPLY_VLOG entrypoint"
    bash /app/entrypoint_apply_vlog.sh
elif [ "$applied_application" == "APPLY_PODCAST_TEMPLATE" ]; then
    echo "Running APPLY_PODCAST_TEMPLATE entrypoint"
    bash /app/entrypoint_apply_podcast_template.sh
else
    echo "ERROR: invalid applied_application: $applied_application"
    exit 1
fi

