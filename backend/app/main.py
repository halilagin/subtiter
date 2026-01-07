# flake8: noqa: E501

from dotenv import load_dotenv
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

from app.api.middleware import auth_middleware, custom_auth_middleware, cognito_auth_middleware
from app.api.v1.endpoints import auth, users
from app.api.v1.endpoints import subscription
from app.api.klippers import api_chat, user_subtitling, user_trimming
from contextlib import asynccontextmanager
import threading
# from app.db_polling.stripe_document_meters import send_document_meters_loop
from fastapi import FastAPI
from app.config import settings
from app.api.klippers import video_upload
from app.api.klippers import user_videos
import os
from fastapi.staticfiles import StaticFiles
import ray
from ray import serve
from app.api.klippers import user_shorts


EMAIL_INTERVAL_SECONDS = 60
STRIPE_DOCUMENT_METER_INTERVAL_SECONDS = 60
SIGNING_PDF_INTERVAL_SECONDS = 60
PSQL_BACKUP_INTERVAL_SECONDS = 60 * 60 * 12


def start_background_thread():
    pass
    # Create and start the daemon thread

    # if settings.ACTIVATE_STRIPE_METERING:
    #     # Create and start the daemon thread
    #     global strpie_doc_meter_thread
    #     strpie_doc_meter_thread = threading.Thread(
    #         target=send_document_meters_loop,
    #         args=(STRIPE_DOCUMENT_METER_INTERVAL_SECONDS,),
    #         daemon=True  # Set as daemon thread so it exits when FastAPI exits
    #     )
    #     strpie_doc_meter_thread.start()
    #     print(f"MAIN: Background Stripe document meter thread started. Will send meters every {STRIPE_DOCUMENT_METER_INTERVAL_SECONDS} seconds.")

#    if settings.ACTIVATE_PSQL_BACKUP:
#        # Create and start the daemon thread
#        global psql_backup_thread
#        psql_backup_thread = threading.Thread(
#            target=backup_postgres_db_loop,
#            args=(PSQL_BACKUP_INTERVAL_SECONDS,),
#            daemon=True  # Set as daemon thread so it exits when FastAPI exits
#        )
#        psql_backup_thread.start()
#        print(f"MAIN: Background PSQL Backup thread started. Running in {PSQL_BACKUP_INTERVAL_SECONDS} seconds.")


def initialize_ray_and_actors():
    """Initialize Ray and actors for the deployment."""
    # Initialize Ray with explicit address for multi-worker setup
    if not ray.is_initialized():
        try:
            # If no existing cluster, start a new one with resource configuration
            # Unset problematic environment variable if it exists
            if "RAY_USE_MULTIPROCESSING_CPU_COUNT" in os.environ:
                del os.environ["RAY_USE_MULTIPROCESSING_CPU_COUNT"]
            
            # Create spill directory
            os.makedirs("/tmp/ray/spill", exist_ok=True)
            
            ray.init(
                ignore_reinit_error=True, 
                _temp_dir="/tmp/ray",
                # Configure Ray cluster resources (optimized for Docker)
                num_cpus=3,
                object_store_memory=1 * 1024 * 1024 * 1024,  # Reduced to 1GB for Docker
                # Critical for Docker: explicitly set resource limits
                include_dashboard=False,  # Disable dashboard to save resources
                log_to_driver=True,  # Show all logs in main process
            )
            print("MAIN: Started new Ray cluster with 3 CPUs and 2GB object store (Docker optimized).")
        except Exception as e2:
            print(f"MAIN: Failed to start new Ray cluster: {e2}")
            print("MAIN: Continuing without Ray - some features may not work.")
            # Set a flag to indicate Ray is not available
            os.environ["RAY_AVAILABLE"] = "false"
    
    # Initialize Ray actors after Ray is started (if Ray is available)
    if os.environ.get("RAY_AVAILABLE", "true") != "false":
        from app.api.klippers.api_chat import initialize_actor
        initialize_actor()
    else:
        print("MAIN: Skipping Ray actor initialization - Ray not available.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    import sys
    print("MAIN: FastAPI app starting up...", flush=True)
    sys.stdout.flush()

    # Create necessary directories
    os.makedirs(settings.VIDEO_WAREHOUSE_ROOT_DIR, exist_ok=True)

    # Initialize Ray and actors if not already initialized
    if not ray.is_initialized():
        print("MAIN: Initializing Ray for FastAPI app...", flush=True)
        sys.stdout.flush()
        try:
            initialize_ray_and_actors()
            print("MAIN: Ray initialization completed successfully!", flush=True)
        except Exception as e:
            print(f"MAIN: WARNING - Ray initialization failed: {e}", flush=True)
            print("MAIN: Continuing without Ray - some features may not work.", flush=True)
    else:
        print("MAIN: Ray already initialized", flush=True)
        # Even if Ray is initialized, we need to initialize the actors
        if os.environ.get("RAY_AVAILABLE", "true") != "false":
            print("MAIN: Initializing actors...", flush=True)
            from app.api.klippers.api_chat import initialize_actor
            initialize_actor()
            print("MAIN: Actor initialization completed!", flush=True)

    # Initialize Redis listener actor and start background task
    if os.environ.get("RAY_AVAILABLE", "true") != "false":
        print("MAIN: Initializing Redis listener...", flush=True)
        from app.api.klippers.api_chat import initialize_redis_listener, start_redis_listener_task
        initialize_redis_listener()
        await start_redis_listener_task()
        print("MAIN: Redis listener initialized and background task started!", flush=True)

    # Ensure environment variables are loaded if not already loaded by the module import
    start_background_thread()

    yield

    # Code to run on shutdown (optional)
    print("MAIN: FastAPI app shutting down...", flush=True)
    
    # Stop Redis listener task
    if os.environ.get("RAY_AVAILABLE", "true") != "false":
        print("MAIN: Stopping Redis listener task...", flush=True)
        from app.api.klippers.api_chat import stop_redis_listener_task
        stop_redis_listener_task()
    
    # Shutdown Ray if it was initialized
    if ray.is_initialized():
        print("MAIN: Shutting down Ray...", flush=True)
        ray.shutdown()
    # No explicit need to stop the daemon thread, it will exit with the main process


# Create FastAPI app instance
app = FastAPI(title="Klippers API", lifespan=lifespan, version="1.0.0")

app.mount("/public", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "public")), name="public")

# Allow multiple specific origins
origins = [
    "http://localhost:3000",  # Add your frontend origin explicitly
    "http://127.0.0.1:3000",
    "http://localhost:4080",
    "https://localhost:4080",
    "https://localhost:22081",
    "http://localhost:22081",
    "http://localhost:22080",
    "https://localhost:22080",
    "http://localhost:23080",
    "https://localhost:23080",
    "http://localhost:23081",  # Add missing port 23081
    "https://localhost:23081",  # Add missing port 23081 with HTTPS
    "*"
]

# OR allow all origins (not recommended for production)
# origins = ["*"]

# Add CORS middleware FIRST - must come before auth middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth middleware AFTER CORS - this ensures CORS preflight requests are handled first
# You can choose between:
# - cognito_auth_middleware: Uses AWS Cognito for authentication (recommended)
# - custom_auth_middleware: Uses custom JWT tokens with SECRET_KEY
# - auth_middleware: Alias for the default (currently cognito_auth_middleware)
app.middleware("http")(auth_middleware)  # Change to cognito_auth_middleware to use Cognito

# Dummy SECRET, use something secure in production
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(subscription.router, prefix="/api/v1", tags=["subscription"])
app.include_router(api_chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(video_upload.router, prefix="/api/v1", tags=["video_upload"])
app.include_router(user_videos.router, prefix="/api/v1", tags=["user_videos"])
app.include_router(user_shorts.router, prefix="/api/v1", tags=["user_shorts"])
app.include_router(user_subtitling.router, prefix="/api/v1", tags=["user_subtitling"])
app.include_router(user_trimming.router, prefix="/api/v1", tags=["user_trimming"])


@app.get("/")
async def root():
    return {"message": "Welcome to Klippers API"}



def create_deployment():
    """Create the Ray Serve deployment dynamically."""
    @serve.deployment(
        num_replicas=1,
        ray_actor_options={
            "num_cpus": 1,  # Reduced to 1 CPU for Docker compatibility
            "memory": 2 * 1024 * 1024 * 1024,  # 2GB in bytes
        }
    )
    @serve.ingress(app)
    class KlippersAPIDeployment:
        def __init__(self):
            """Initialize the deployment and set up Ray actors."""
            print("KLIPPERS: Initializing Klippers API Deployment...")
            print("KLIPPERS: Allocated 1 CPU and 2GB memory for this deployment (Docker optimized)")
            print("KLIPPERS: Klippers API Deployment initialized successfully.")
    
    return KlippersAPIDeployment


def main(host="0.0.0.0", port=22081):
    """Main function to run the Ray Serve deployment."""
    import time
    import signal
    import sys
    
    # Flag to control the main loop
    running = True
    
    def signal_handler(signum, frame):
        nonlocal running
        print("\nMAIN: Received shutdown signal, stopping server...")
        running = False
        serve.shutdown()
        ray.shutdown()
        sys.exit(0)
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("MAIN: Starting Klippers API with Ray Serve...")
    
    initialize_ray_and_actors()
    
    # Wait for Ray to be fully ready
    print("MAIN: Waiting for Ray cluster to be fully ready...")
    time.sleep(3)
    
    try:
        # Configure Ray Serve with custom host and port
        print(f"MAIN: Starting Ray Serve on {host}:{port}...")
        serve.start(http_options={"host": host, "port": port})
        
        # Wait a bit before deploying
        time.sleep(2)
        
        # Create and deploy the application
        print("MAIN: Creating deployment...")
        KlippersAPIDeployment = create_deployment()
        
        print("MAIN: Deploying KlippersAPIDeployment...")
        deployment_handle = serve.run(KlippersAPIDeployment.bind(), route_prefix="/", blocking=False)
        
        print("MAIN: Klippers API is now running with Ray Serve!")
        print(f"MAIN: Server is running at http://{host}:{port}")
        print("MAIN: Press Ctrl+C to stop the server...")
    except Exception as e:
        print(f"MAIN: Error starting Ray Serve: {e}")
        import traceback
        traceback.print_exc()
        print("\nMAIN: Falling back to uvicorn without Ray Serve...")
        ray.shutdown()
        # Fallback to uvicorn
        import uvicorn
        uvicorn.run(app, host=host, port=port)
        return
    
    # Keep the script running
    try:
        while running:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nMAIN: Shutting down gracefully...")
        serve.shutdown()
        ray.shutdown()
    



if __name__ == "__main__":
    main()
