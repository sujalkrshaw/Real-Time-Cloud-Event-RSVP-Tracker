import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.core.security import decode_token, hash_password
from app.db.session import Base, engine, SessionLocal
from app.models import User, Event, Role
from app.api import auth, events, rsvps, analytics, announcements, notifications
from app.services.realtime import manager

logging.basicConfig(level=logging.INFO)
Base.metadata.create_all(bind=engine)

app=FastAPI(title="Real-Time Cloud Event RSVP Tracker",version="1.0.0")
app.add_middleware(CORSMiddleware,allow_origins=settings.cors_list,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(auth.router); app.include_router(events.router); app.include_router(rsvps.router)
app.include_router(analytics.router); app.include_router(announcements.router); app.include_router(notifications.router)

@app.get("/health")
def health(): return {"status":"ok","service":"event-rsvp-api"}

@app.post("/api/dev/seed")
def seed():
    db=SessionLocal()
    try:
        if db.execute(select(User).where(User.email=="organizer@example.com")).scalar_one_or_none():
            return {"message":"Seed already exists"}
        org=User(name="Demo Organizer",email="organizer@example.com",password_hash=hash_password("Organizer123!"),role=Role.ORGANIZER)
        alice=User(name="Alice Demo",email="alice@example.com",password_hash=hash_password("Attendee123!"),role=Role.ATTENDEE)
        bob=User(name="Bob Demo",email="bob@example.com",password_hash=hash_password("Attendee123!"),role=Role.ATTENDEE)
        db.add_all([org,alice,bob]); db.commit(); db.refresh(org)
        e=Event(organizer_id=org.id,event_name="Cloud Computing Workshop",
                description="Synthetic event for realtime RSVP demonstration.",event_type="Workshop",
                event_date="2099-12-10",start_time="10:00",end_time="13:00",venue="Virtual Lab",
                online_link="https://example.com/demo",maximum_capacity=100,
                registration_deadline="2099-12-10T09:30")
        db.add(e); db.commit(); db.refresh(e)
        return {"message":"Synthetic demo created","event_id":e.id}
    finally: db.close()

@app.websocket("/ws/events/{event_id}")
async def ws(websocket:WebSocket,event_id:int):
    token=websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008); return
    try: decode_token(token)
    except Exception:
        await websocket.close(code=1008); return
    db=SessionLocal()
    try:
        if not db.get(Event,event_id):
            await websocket.close(code=1008); return
    finally: db.close()
    await manager.connect(event_id,websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: await manager.disconnect(event_id,websocket)
    except Exception: await manager.disconnect(event_id,websocket)
