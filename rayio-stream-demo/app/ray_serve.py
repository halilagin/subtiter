# main.py
import ray
from ray import serve
from fastapi import FastAPI
import json
import asyncio
# from contextlib import asynccontextmanager
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .chat_actor import WebSocketActor
from .types import ChatMessage, WSConnection

# Load environment variables from .env file
load_dotenv()
# 1. Define a FastAPI application.
# This can be any standard FastAPI app.
app = FastAPI(
    title="Simple FastAPI on Ray Serve",
    description="A basic example showing how to serve a FastAPI app with Ray.",
    version="1.0.0",
    host="0.0.0.0",
)


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
chat_actor = WebSocketActor.remote()
print("ChatActor remote instance created.")

# Serve static files (like your index.html) from the 'public' directory.
app.mount("/public", StaticFiles(directory="public"), name="public")


@serve.deployment(num_replicas=2)
@serve.ingress(app)
class FastAPIDeployment:
    """
    This class wraps our FastAPI app. When a request comes to the route_prefix,
    Ray Serve will forward it to the FastAPI app defined above.
    No methods need to be defined within the class for this simple use case.
    """
    def __init__(self):
        self.active_connections: dict[str, dict[str, WSConnection]] = {}
        pass

    @app.post("/chat/message/{roomId}/{clientId}")
    async def post_message(self, chat_message: ChatMessage, roomId: str, clientId: str):
        """
        Handles posting of a new message to the chat via REST API.
        The message is sent to an LLM and the reply is broadcasted back to the chat room.
        """
        print(f"Received from {chat_message.clientId}:", chat_message)

        # Add the message to the chat history via the actor. The actor can process it
        # (e.g., call an LLM) and will return a message object to be broadcasted.
        message_to_broadcast = await chat_actor.add_message.remote(roomId, clientId, chat_message)

        # Broadcast the message to all clients in the room.
        active_connections = await chat_actor.get_active_connections.remote()
        if roomId in active_connections:
            # We assume message_to_broadcast has attributes like clientId, message, etc.,
            # and that its timestamp is a datetime object that needs to be serialized.
            message_dict = json.dumps(message_to_broadcast.model_dump())
            for ws_conn in active_connections[roomId].values():
                await ws_conn.queue.put(message_dict)

        return {"status": "message sent"}

    @app.get("/")
    async def get(self):
        """
        Serves the main HTML page for the chat application.
        """
        return HTMLResponse(content=open("public/chat_screen.html", "r").read(), status_code=200)

    @app.websocket("/ws/{roomId}/{clientId}")
    async def websocket_endpoint(self, websocket: WebSocket, roomId: str, clientId: str):
        """
        Handles WebSocket connections for the chat room.

        Upon connection, it registers the client, and then concurrently manages
        receiving messages from the client and sending messages back to the client
        via its dedicated message queue.
        """
        await websocket.accept()
        ws_conn = WSConnection(websocket=websocket, queue=asyncio.Queue(), clientId=clientId, roomId=roomId)
        # self.active_connections[roomId][clientId] = ws_conn

        # You cannot pass the WebSocket connection object to a Ray actor as it is not
        # serializable. Instead, the actor is only notified of the new client's ID.
        await chat_actor.register_client_to_room.remote(roomId, clientId)
        print(f"Client {clientId} connected to room {roomId}. Total members: {await chat_actor.get_room_members.remote(roomId)}")

        try:
            # The writer task waits for messages on the queue and sends them to the client.
            async def writer(conn: WSConnection):
                while True:
                    message = await conn.queue.get()
                    await conn.websocket.send_json(message)

            # The reader task listens for incoming messages to detect disconnection.
            async def reader(conn: WSConnection):
                try:
                    while True:
                        await conn.websocket.receive_text()
                except WebSocketDisconnect:
                    pass  # Allow the reader to exit gracefully.

            writer_task = asyncio.create_task(writer(ws_conn))
            reader_task = asyncio.create_task(reader(ws_conn))

            # Wait for either task to complete. If one does (e.g., on disconnect),
            # cancel the other and exit the context.
            done, pending = await asyncio.wait(
                [writer_task, reader_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()

        except Exception as e:
            print(f"An error occurred with client {clientId}: {e}")
        finally:
            # Clean up connection
            print(f"Client {clientId} disconnected from room {roomId}.")
            if roomId in self.active_connections and clientId in self.active_connections[roomId]:
                del self.active_connections[roomId][clientId]
                if not self.active_connections[roomId]:
                    del self.active_connections[roomId]

            # You should also notify the actor that the client has disconnected.
            # This assumes you have an `unregister_client_from_room` method on your actor.
            # await chat_actor.unregister_client_from_room.remote(roomId, clientId)

            print(f"Resources for client {clientId} in room {roomId} cleaned up.")


# 3. Bind the deployment to an application handle.
# This defines the entrypoint for our Ray Serve application.
api_app = FastAPIDeployment.bind()

# To run this script directly for local testing, you could use:
if __name__ == "__main__":
    # This is for local testing and is not the standard way to deploy.
    # The standard way is using the `serve run` command.
    print("This script is intended to be deployed with `serve run`.")
    print("Example: `serve run app.ray_serve:api_app --port 6201`")
    # For a quick local test, you can uncomment the following lines:
    ray.init(num_cpus=4)
    serve.run(api_app, route_prefix="/")
    import time
    try:
        while True:
            time.sleep(5)
            print(serve.status())
    except KeyboardInterrupt:
        serve.shutdown()
        ray.shutdown()

