set -x

set -a
source ../../.env.local
set +a

exec > /tmp/run_on_uploaded.fargate.log 2>&1

start_time=$(date +%s)

# export DO_DB_OPERATION=false
# export SEND_CHAT=false
# export VIDEO_WAREHOUSE_ROOT_DIR=/Users/halilagin/root/github/klippers.ai/backend/app/klippers_warehouse
# export USER_ID=2f4e1723-cda8-430f-b014-466e227e6f8b
# export VIDEO_ID=patrick_podcast_config_work
# export VIDEO_ID=e95cef80-8dd6-4617-bc3d-2054302d2317
# export MOCK_PROCESS=false

export S3_WAREHOUSE_PREFIX=$(basename $VIDEO_WAREHOUSE_ROOT_DIR)

PYTHONPATH=.
kaws_klippers_cli s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/original.mp4 s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/original.mp4
kaws_klippers_cli s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/shorts_config.json
kaws_klippers_cli s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/thumbnail.png s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/thumbnail.png
uv run fargate_run.py 
end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
