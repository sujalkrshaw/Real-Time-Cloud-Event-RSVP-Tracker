import asyncio
from collections import defaultdict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.rooms = defaultdict(set)
        self.lock = asyncio.Lock()

    async def connect(self, event_id, ws):
        await ws.accept()
        async with self.lock:
            self.rooms[event_id].add(ws)

    async def disconnect(self, event_id, ws):
        async with self.lock:
            self.rooms[event_id].discard(ws)
            if not self.rooms[event_id]:
                self.rooms.pop(event_id, None)

    async def broadcast(self, event_id, payload):
        async with self.lock:
            sockets = list(self.rooms.get(event_id, set()))
        for ws in sockets:
            try:
                await ws.send_json(payload)
            except Exception:
                await self.disconnect(event_id, ws)

manager = ConnectionManager()
