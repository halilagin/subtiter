#!/bin/bash
# Unset problematic Ray environment variable

#set -a;. .env.docker;set +a
unset RAY_USE_MULTIPROCESSING_CPU_COUNT

echo "Starting Subtiter API with uvicorn and Ray actors..."

# Run with uvicorn directly (single worker to avoid Ray forking issues)
# Ray actors will be initialized in the FastAPI lifespan
uvicorn app.main:app --host 0.0.0.0 --port 22081
