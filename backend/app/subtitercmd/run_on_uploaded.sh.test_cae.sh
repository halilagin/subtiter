set -a
source ../../.env.local
set +a
set -x
start_time=$(date +%s)

export DO_DB_OPERATION=false
export SEND_CHAT=false
export VIDEO_WAREHOUSE_ROOT_DIR=/Users/halilagin/root/github/subtiter.ai/backend/app/subtiter_warehouse
export USER_ID=c5025c38-dda5-4a90-b1dd-1d6eea80ec89
# export VIDEO_ID=patrick_podcast_config_work
export VIDEO_ID=5eac67ff-5550-4e12-9cf7-6ed4d1ae9a84
export MOCK_PROCESS=false


PYTHONPATH=.

bash run_on_uploaded.sh.prod.sh


end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
