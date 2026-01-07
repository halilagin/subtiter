set -a
source ../../.env.local
set +a

start_time=$(date +%s)

export DO_DB_OPERATION=false
export SEND_CHAT=false
export VIDEO_WAREHOUSE_ROOT_DIR=/Users/halilagin/root/github/subtiter.ai/backend/app/subtiter_warehouse
export USER_ID=2186f4f4-3533-4244-a604-ac7f84546495
# export VIDEO_ID=patrick_podcast_config_work
export VIDEO_ID=0d0c1ec7-3b01-47d7-b202-6d1a03cfa09b
export MOCK_PROCESS=false


PYTHONPATH=.

bash run_on_uploaded.sh.prod.sh


end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
