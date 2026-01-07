# set -a
# source ../../.env.local
# set +a

# source ~/.aws_secrets

# Redirect stdout and stderr to files
exec > "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/klippers.stdout" 2> "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/klippers.stderr"

# Write the PID to a file
echo $$ > "$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/klippers.pid"

start_time=$(date +%s)

export DO_DB_OPERATION=true
export SEND_CHAT=true
export MOCK_PROCESS=false


# copy db to current directory
shorts_config_json_path="$VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json"

application_type=$(jq -r '.config_json.applied_application' $shorts_config_json_path)

PYTHONPATH=.
if [ "$application_type" == "GENERATE_SHORTS" ]; then
    echo "Running GENERATE_SHORTS"
    uv run python -m run_app_genshorts
    
elif [ "$application_type" == "GENERATE_SUBTITLING" ]; then
    echo "Running GENERATE_SUBTITLING"
    uv run python -m run_app_subtitling
elif [ "$application_type" == "APPLY_TRIM" ]; then
    echo "Running APPLY_TRIM"
    uv run python -m run_app_trimming
else
    echo "ERROR: invalid application_type: $application_type"
    exit 1
fi

end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
