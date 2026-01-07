import ray
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
# Import the ChatActor class from the chat_actor.py file.
# Ensure chat_actor.py is in the same directory or accessible in PYTHONPATH.
from .chat_actor import ChatActor
from .types import ChatMessage, WSConnection
from .config import settings
# Load environment variables from .env file
load_dotenv()

# Initialize Ray. This must be done before creating any remote actors.
try:
    ray.init(ignore_reinit_error=True)
    print("Ray initialized successfully.")
except RuntimeError as e:
    print(f"Ray initialization error (likely already initialized): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events to manage the Ray lifecycle."""
    yield
    # On shutdown, gracefully shut down Ray in a separate thread to avoid blocking.
    print("\nShutting down Ray gracefully...")
    if ray.is_initialized():
        await asyncio.to_thread(ray.shutdown)
        print("Ray has been shut down.")


app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create a Ray actor instance. This actor will manage our chat state.
# .remote() schedules the creation of the actor on a Ray worker.
chat_actor = ChatActor.remote()
print("ChatActor remote instance created.")

# Dictionary to hold active WebSocket connections, keyed by clientId.
# This is used for sending messages directly to a specific client.
# ws_connection = active_connections[roomId][clientId]
active_connections: dict[str, dict[str, WSConnection]] = {}


# Dictionary to hold message queues for each client.
# Each client has a dedicated asyncio.Queue for messages waiting to be sent to them.
# client_message_queues: defaultdict[str, asyncio.Queue] = defaultdict(asyncio.Queue)


# Serve static files (like your index.html) from the 'public' directory.
app.mount("/public", StaticFiles(directory="public"), name="public")


@app.post("/chat/message/{roomId}/{clientId}")
async def post_message(chat_message: ChatMessage, roomId: str, clientId: str):
    """
    Handles posting of a new message to the chat via REST API.
    The message is sent to an LLM and the reply is broadcasted back to the chat room.
    """
    print(f"Received from {chat_message.clientId}:", chat_message)
    # First, add the user's own message to the chat history and broadcast it.
    user_message_to_broadcast = await chat_actor.add_message.remote(roomId, clientId, chat_message)
    user_message_json = json.dumps({
        "clientId": user_message_to_broadcast.clientId,
        "message": user_message_to_broadcast.message,
        "timestamp": user_message_to_broadcast.timestamp,
        "roomId": user_message_to_broadcast.roomId
    })
    if roomId in active_connections:
        for ws_conn in active_connections[roomId].values():
            await ws_conn.queue.put(user_message_json)

    # Now, get a response from the LLM
    # For production, it's better to initialize the LLM model once at startup.
    llm = ChatGoogleGenerativeAI(model=settings.LLM_GEMINI_MODEL, convert_system_message_to_human=True, google_api_key=settings.GEMINI_API_KEY)
    # llm_response = await llm.ainvoke(chat_message.message)

    #print(f"LLM response: {llm_response}")
    # Create a chat message for the LLM's reply.
    llm_reply = ChatMessage(
        clientId="LLM-Bot",
        message="Hello, this is a test response from the LLM", #llm_response.content,
        timestamp=str(datetime.now().isoformat()),
        roomId=roomId
    )

    # Add the LLM's reply to the chat history and broadcast it.
    llm_message_to_broadcast = await chat_actor.add_message.remote(roomId, "LLM-Bot", llm_reply)
    llm_message_json = json.dumps({
        "clientId": llm_message_to_broadcast.clientId,
        "message": llm_message_to_broadcast.message,
        "timestamp": llm_message_to_broadcast.timestamp,
        "roomId": llm_message_to_broadcast.roomId
    })

    if roomId in active_connections:
        for ws_conn in active_connections[roomId].values():
            await ws_conn.queue.put(llm_message_json)

    return {"status": "message sent"}


@app.get("/")
async def get():
    """
    Serves the main HTML page for the chat application.
    """
    return HTMLResponse(content=open("public/chat_screen.html", "r").read(), status_code=200)


@app.websocket("/ws/{roomId}/{clientId}")
async def websocket_endpoint(websocket: WebSocket, roomId: str, clientId: str):
    """
    Handles WebSocket connections for the chat room.

    Upon connection, it assigns a unique ID, sends chat history, and then
    concurrently manages receiving messages from the client and sending
    messages back to the client via its dedicated message queue.
    """
    await websocket.accept()
    if roomId not in active_connections:
        active_connections[roomId] = {}

    ws_conn = WSConnection(websocket=websocket, queue=asyncio.Queue(), clientId=clientId, roomId=roomId)
    active_connections[roomId][clientId] = ws_conn
    print(f"Client {clientId} connected to room {roomId}.")

    try:
        while True:
            # Wait for a message to be put into this client's queue.
            # This blocks until a message is available.
            message_to_send = await ws_conn.queue.get()
            await websocket.send_json(message_to_send)
    except WebSocketDisconnect:
        print(f"Client {clientId} disconnected from room {roomId}.")
    except Exception as e:
        print(f"An error occurred with client {clientId}: {e}")
    finally:
        # Clean up connection
        if roomId in active_connections and clientId in active_connections[roomId]:
            del active_connections[roomId][clientId]
            if not active_connections[roomId]:
                del active_connections[roomId]
        print(f"Resources for client {clientId} in room {roomId} cleaned up.")


# To run this backend:
# 1. Save the code above as `main.py` in an `app` directory.
# 2. Save the `chat_actor.py` (from previous step) in the same directory.
# 3. Create a subdirectory named `public` in the same directory.
# 4. Save `chat_screen.html` (from the frontend section below) inside the `public` directory.
# 5. Open your terminal in that directory and run: `sh run_server.sh`
