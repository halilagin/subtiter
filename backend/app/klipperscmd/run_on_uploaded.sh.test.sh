set -a
source ../../.env.local
set +a

start_time=$(date +%s)

export DO_DB_OPERATION=false
export SEND_CHAT=false
export VIDEO_WAREHOUSE_ROOT_DIR=/Users/halilagin/root/github/klippers.ai/backend/app/klippers_warehouse
export USER_ID=c2c50404-2001-708b-7a67-1b06334348b9
# export VIDEO_ID=patrick_podcast_config_work
export VIDEO_ID=8a5072a6-2075-463b-9da6-a54b6e1dae70
export MOCK_PROCESS=false


PYTHONPATH=.
uv run python -m run_on_uploaded 

end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
