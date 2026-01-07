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

# Check if FARGATE_EXECUTION_ROLE is set as an environment variable
# If not, try to extract it from TASK_INPUT JSON
if [ -z "$FARGATE_EXECUTION_ROLE" ]; then
    export FARGATE_EXECUTION_ROLE=$(echo "$TASK_INPUT" | jq -r '.FARGATE_EXECUTION_ROLE // empty')
fi

echo "entrypoint: FARGATE_EXECUTION_ROLE: $FARGATE_EXECUTION_ROLE"

if [ "$FARGATE_EXECUTION_ROLE" == "null" ] || [ -z "$FARGATE_EXECUTION_ROLE" ]; then
    echo "Running wholistic entrypoint (no FARGATE_EXECUTION_ROLE specified)"
    bash /app/entrypoint_genshorts_wholistic.sh
elif [ "$FARGATE_EXECUTION_ROLE" == "parent" ]; then
    echo "Running parent entrypoint"
    bash /app/entrypoint_genshorts_parent.sh
elif [ "$FARGATE_EXECUTION_ROLE" == "child" ]; then
    echo "Running child entrypoint"
    bash /app/entrypoint_genshorts_child.sh
else
    echo "ERROR: invalid FARGATE_EXECUTION_ROLE: $FARGATE_EXECUTION_ROLE"
    exit 1
fi

