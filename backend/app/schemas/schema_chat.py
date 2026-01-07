from pydantic import BaseModel
import asyncio
from fastapi import WebSocket


class ChatMessage(BaseModel):
    kind: str = "video-process-message"
    message: str
    clientId: str
    timestamp: str | None = None
    roomId: str
    isTesting: bool = False
    companyId: str | None = None
    machineId: str | None = None
    lineId: str | None = None
    conversationId: str | None = None
    chunkIds: list[str] | None = None


class WSConnection(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    websocket: WebSocket
    queue: asyncio.Queue
    clientId: str
    roomId: str