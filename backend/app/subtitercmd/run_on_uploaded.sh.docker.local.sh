# set -a
# source ../../.env.local
# set +a

start_time=$(date +%s)

export DO_DB_OPERATION=true
export SEND_CHAT=true
export MOCK_PROCESS=false


# copy db to current directory

PYTHONPATH=.
python -m run_on_uploaded 

end_time=$(date +%s)
echo "Script took: $(( end_time - start_time )) seconds"
