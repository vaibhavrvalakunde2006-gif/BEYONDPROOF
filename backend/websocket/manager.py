from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["Real-time Verification Stream"])


class ConnectionManager:
    """Manages active WebSocket subscribers tracking live forensic verification progress."""

    def __init__(self):
        # Maps verification_id to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, verification_id: str, websocket: WebSocket):
        """Accept incoming connection and register under verification_id."""
        await websocket.accept()
        if verification_id not in self.active_connections:
            self.active_connections[verification_id] = []
        self.active_connections[verification_id].append(websocket)

    def disconnect(self, verification_id: str, websocket: WebSocket):
        """Unregister closed WebSocket."""
        if verification_id in self.active_connections:
            if websocket in self.active_connections[verification_id]:
                self.active_connections[verification_id].remove(websocket)
            if len(self.active_connections[verification_id]) == 0:
                del self.active_connections[verification_id]

    async def send_progress(
        self,
        verification_id: str,
        engine: str,
        status: str,
        progress: int,
        details: dict = None,
    ):
        """Broadcast live progress update to all active listeners for verification_id."""
        if verification_id not in self.active_connections:
            return

        payload = {
            "verification_id": verification_id,
            "engine": engine,
            "status": status,
            "progress": progress,
            "details": details or {},
        }

        dead_connections = []
        for connection in self.active_connections[verification_id]:
            try:
                await connection.send_json(payload)
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(verification_id, dead)


manager = ConnectionManager()


@router.websocket("/ws/verification/{verification_id}")
async def websocket_verification_stream(websocket: WebSocket, verification_id: str):
    """WebSocket endpoint streaming live multi-engine verification progress to frontend clients."""
    await manager.connect(verification_id, websocket)
    try:
        while True:
            # Keep-alive receive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(verification_id, websocket)
    except Exception:
        manager.disconnect(verification_id, websocket)
