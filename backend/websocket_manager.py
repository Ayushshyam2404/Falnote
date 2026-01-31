import json
import asyncio
from typing import Set, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[tuple[WebSocket, str]] = set()
        self.connection_data: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections.add((websocket, session_id))
        self.connection_data[session_id] = {"connected_at": asyncio.get_event_loop().time()}
        print(f"Client {session_id} connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, session_id: str):
        self.active_connections.discard((websocket, session_id))
        if session_id in self.connection_data:
            del self.connection_data[session_id]
        print(f"Client {session_id} disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict, exclude_session: str = None):
        """Send message to all connected clients except the one that sent it"""
        disconnected = []
        
        # Create a copy to avoid "Set changed size during iteration" error
        for websocket, session_id in list(self.active_connections):
            if exclude_session and session_id == exclude_session:
                continue
            
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending message to {session_id}: {e}")
                disconnected.append((websocket, session_id))
        
        # Remove disconnected clients
        for ws, sid in disconnected:
            self.disconnect(ws, sid)

    async def send_to_client(self, websocket: WebSocket, message: dict):
        """Send message to specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message to client: {e}")

    def get_active_clients_count(self) -> int:
        return len(self.active_connections)

manager = ConnectionManager()
