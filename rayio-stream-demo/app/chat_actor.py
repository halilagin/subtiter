import ray
import datetime
from typing import Dict, List
from .types import ChatMessage


@ray.remote
class ChatActor:
    """
    A Ray actor that manages the chat history.

    This actor receives messages, stores them, and provides them for broadcasting.
    It encapsulates the chat room's state, allowing for concurrent message processing
    without directly handling network I/O, which is managed by the FastAPI app.
    """
    def __init__(self):
        self.messages: Dict[str, List[ChatMessage]] = {}  # Stores lists of ChatMessage objects, keyed by clientId.
        print("ChatActor initialized.")

    def add_message(self, roomId: str, clientId: str, message: ChatMessage) -> ChatMessage:
        """
        Adds a new message to the chat history.

        Args:
            roomId: The room ID.
            clientId: The client ID.
            message: The message object.

        Returns:
            The message object, updated with a timestamp.
        """
        # We assume the ChatMessage object is mutable and has `clientId` and `timestamp` attributes.
        message.timestamp = str(datetime.datetime.now().isoformat())

        if clientId not in self.messages:
            self.messages[roomId] = []
        self.messages[roomId].append(message)
        print(f"Message added by actor: {message}")
        return message

    def get_history(self) -> Dict[str, List[ChatMessage]]:
        """
        Retrieves the entire chat history.

        Returns:
            A dictionary of message lists keyed by client ID.
        """
        print("Chat history requested.")
        return self.messages

    def get_history_by_clientId(self, clientId: str) -> List[ChatMessage]:
        """
        Retrieves the entire chat history of the Client with the given ID.

        Returns:
            List of Message objects.
        """
        print(f"Chat history requested for client {clientId}.")
        room_messages = self.messages.values()
        messages_by_client = map(lambda room_messages: [message for message in room_messages if message.clientId == clientId], room_messages)
        return messages_by_client
