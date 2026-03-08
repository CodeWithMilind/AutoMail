from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from api.email_routes import router as email_router
from api.ai_routes import router as ai_router
from api.task_routes import router as task_router
from api.meeting_routes import router as meeting_router
from app.config import settings
from app.database import engine, Base
import json

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Middleware
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(email_router)
app.include_router(ai_router)
app.include_router(task_router)
app.include_router(meeting_router)

@app.get("/")
def home():
    return {"message": "Auto Email AI Assistant Backend is running"}

# WebSocket Manager for Real-Time Updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming data if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper function to broadcast updates
async def notify_update(update_type: str, data: dict):
    message = json.dumps({"type": update_type, "data": data})
    await manager.broadcast(message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
