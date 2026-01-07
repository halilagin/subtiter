# Use Python 3.11 slim image as base (explicit Debian variant for multi-arch)
FROM halilagin/klippersai:latest



RUN apt-get update && apt-get install -y jq

# Set working directory
WORKDIR /app

COPY . .

# Install Python dependencies (main group only) non-interactively
RUN pip install poetry==1.8.2 uv && \
    rm -f poetry.lock && poetry export -f requirements.txt --output requirements.txt --without-hashes && \
    uv pip install --system -r requirements.txt
    
    
    

# Copy the rest of the application code
RUN cp .env.docker .env 

# Expose port 8000
EXPOSE 22081

# Command to run the application
# Use uvicorn directly for now to avoid Ray Serve issues in Docker
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "22081", "--workers", "1"]
CMD ["/bin/sh", "run_server_docker.sh"]