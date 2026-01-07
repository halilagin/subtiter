from pydantic import BaseModel
import asyncio
from fastapi import WebSocket


class ChatMessage(BaseModel):
    message: str
    clientId: str
    timestamp: str | None = None
    roomId: str


class WSConnection(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    websocket: WebSocket
    queue: asyncio.Queue
    clientId: str
    roomId: str