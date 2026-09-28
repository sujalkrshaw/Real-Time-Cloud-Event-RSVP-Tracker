from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_user, roles
from app.db.session import get_db
from app.models import Event, Role, EventStatus
from app.schemas import EventCreate, EventUpdate, EventOut
from app.services.rsvp import counts

router = APIRouter(prefix="/api/events", tags=["events"])

def owner(event, user):
    if user.role != Role.ADMIN and event.organizer_id != user.id:
        raise HTTPException(403, "You do not own this event")

@router.post("", response_model=EventOut, status_code=201)
def create(p: EventCreate, db: Session=Depends(get_db), user=Depends(roles(Role.ORGANIZER, Role.ADMIN))):
    e = Event(**p.model_dump(), organizer_id=user.id)
    db.add(e); db.commit(); db.refresh(e); return e

@router.get("", response_model=list[EventOut])
def list_events(db: Session=Depends(get_db), user=Depends(current_user)):
    return db.execute(select(Event).where(Event.status != EventStatus.CANCELLED).order_by(Event.event_date, Event.start_time)).scalars().all()

@router.get("/{event_id}", response_model=EventOut)
def get(event_id: int, db: Session=Depends(get_db), user=Depends(current_user)):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    return e

@router.put("/{event_id}", response_model=EventOut)
def update(event_id: int, p: EventUpdate, db: Session=Depends(get_db), user=Depends(roles(Role.ORGANIZER,Role.ADMIN))):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    owner(e,user)
    for k,v in p.model_dump(exclude_unset=True).items(): setattr(e,k,v)
    db.commit(); db.refresh(e); return e

@router.delete("/{event_id}", status_code=204)
def cancel(event_id:int, db:Session=Depends(get_db), user=Depends(roles(Role.ORGANIZER,Role.ADMIN))):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    owner(e,user); e.status=EventStatus.CANCELLED; db.commit()

@router.get("/{event_id}/counts")
def get_counts(event_id:int, db:Session=Depends(get_db), user=Depends(current_user)):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    return counts(db,e)
