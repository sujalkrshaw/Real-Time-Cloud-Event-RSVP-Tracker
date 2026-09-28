from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_user, roles
from app.db.session import get_db
from app.models import RSVP, Event, Role
from app.schemas import RSVPCreate, RSVPOut, RSVPResponse
from app.services.rsvp import upsert, counts
from app.services.realtime import manager

router=APIRouter(prefix="/api",tags=["rsvp"])

@router.post("/events/{event_id}/rsvp",response_model=RSVPResponse)
@router.put("/events/{event_id}/rsvp",response_model=RSVPResponse)
async def set_rsvp(event_id:int,p:RSVPCreate,db:Session=Depends(get_db),user=Depends(current_user)):
    r,c=upsert(db,event_id,user.id,p.status)
    await manager.broadcast(event_id,{"type":"RSVP_UPDATED","counts":c})
    return {"rsvp":r,"counts":c}

@router.delete("/events/{event_id}/rsvp",status_code=204)
async def delete_rsvp(event_id:int,db:Session=Depends(get_db),user=Depends(current_user)):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    r=db.execute(select(RSVP).where(RSVP.event_id==event_id,RSVP.user_id==user.id)).scalar_one_or_none()
    if r: db.delete(r); db.commit()
    await manager.broadcast(event_id,{"type":"RSVP_UPDATED","counts":counts(db,e)})

@router.get("/events/{event_id}/rsvps",response_model=list[RSVPOut])
def event_rsvps(event_id:int,db:Session=Depends(get_db),user=Depends(roles(Role.ORGANIZER,Role.ADMIN))):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    if user.role!=Role.ADMIN and e.organizer_id!=user.id: raise HTTPException(403,"Not your event")
    return db.execute(select(RSVP).where(RSVP.event_id==event_id)).scalars().all()

@router.get("/rsvps/me",response_model=list[RSVPOut])
def my_rsvps(db:Session=Depends(get_db),user=Depends(current_user)):
    return db.execute(select(RSVP).where(RSVP.user_id==user.id)).scalars().all()
