#!/bin/bash
# Script to run the Step Functions state machine for video processing
# This is a wrapper that calls the Python implementation
#
# Environment Variables Passed to Fargate Tasks:
# ==============================================
# PARENT TASK: TASK_INPUT (JSON), FARGATE_EXECUTION_ROLE=parent
# CHILD TASKS: TASK_INPUT (JSON), SEGMENT_NUMBER (1..n), FARGATE_EXECUTION_ROLE=child

set -a
source ../../.env.prod
set +a
exec > /tmp/run_on_uploaded.fargate.log 2>&1

start_time=$(date +%s)

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "SCRIPT_DIR: $SCRIPT_DIR"
export S3_WAREHOUSE_PREFIX=$(basename $VIDEO_WAREHOUSE_ROOT_DIR)

application_type=$(cat $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json | jq -r '.config_json.applied_application')
application_type=$(echo $application_type | tr  '[:lower:]' '[:upper:]')

if [ "$application_type" == "GENERATE_SHORTS" ]; then
    echo "Running GENERATE_SHORTS"
    bash "$SCRIPT_DIR/run_state_machine_genshorts.prod.sh" "$@"
elif [ "$application_type" == "GENERATE_SUBTITLING" ]; then
    echo "Running GENERATE_SUBTITLING"
    bash "$SCRIPT_DIR/run_state_machine_subtitling.prod.sh" "$@"
elif [ "$application_type" == "APPLY_TRIM" ]; then
    echo "Running APPLY_TRIM"
    bash "$SCRIPT_DIR/run_state_machine_trimming.prod.sh" "$@"
fi

end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"