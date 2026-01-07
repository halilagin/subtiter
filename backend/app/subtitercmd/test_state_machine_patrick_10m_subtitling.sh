set -x

set -a
source ../../.env.local
set +a

exec > /tmp/run_on_uploaded.fargate.log 2>&1

start_time=$(date +%s)

# export DO_DB_OPERATION=false
# export SEND_CHAT=false
export VIDEO_WAREHOUSE_ROOT_DIR=/Users/halilagin/root/github/subtiter.ai/backend/app/subtiter_warehouse
export USER_ID=patrick
export VIDEO_ID=patrick_10m_subtitling
export APPLIED_APPLICATION=generate_subtitling
# export MOCK_PROCESS=false


export S3_WAREHOUSE_PREFIX=$(basename $VIDEO_WAREHOUSE_ROOT_DIR)

PYTHONPATH=.
kaws_subtiter_cli s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/original.mp4 s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/original.mp4
kaws_subtiter_cli s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/shorts_config.json s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/shorts_config.json
kaws_subtiter_cli s3 cp $VIDEO_WAREHOUSE_ROOT_DIR/$USER_ID/$VIDEO_ID/thumbnail.png s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID/thumbnail.png
bash run_state_machine.sh
echo "working on s3://697903399510-videos-warehouse/$S3_WAREHOUSE_PREFIX/$USER_ID/$VIDEO_ID"
end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
