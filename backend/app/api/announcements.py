from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_user, roles
from app.db.session import get_db
from app.models import Announcement, Event, RSVP, RSVPStatus, Notification, Role
from app.schemas import AnnouncementCreate, AnnouncementOut
from app.services.realtime import manager

router=APIRouter(prefix="/api/events",tags=["announcements"])

@router.post("/{event_id}/announcements",response_model=AnnouncementOut,status_code=201)
async def create(event_id:int,p:AnnouncementCreate,db:Session=Depends(get_db),user=Depends(roles(Role.ORGANIZER,Role.ADMIN))):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    if user.role!=Role.ADMIN and e.organizer_id!=user.id: raise HTTPException(403,"Not your event")
    a=Announcement(event_id=event_id,**p.model_dump()); db.add(a)
    ids=db.execute(select(RSVP.user_id).where(RSVP.event_id==event_id,RSVP.status.in_([RSVPStatus.GOING,RSVPStatus.MAYBE]))).scalars().all()
    for uid in ids: db.add(Notification(user_id=uid,event_id=event_id,type="ANNOUNCEMENT",message=p.message))
    db.commit(); db.refresh(a)
    await manager.broadcast(event_id,{"type":"ANNOUNCEMENT","title":a.title,"message":a.message})
    return a

@router.get("/{event_id}/announcements",response_model=list[AnnouncementOut])
def list_announcements(event_id:int,db:Session=Depends(get_db),user=Depends(current_user)):
    if not db.get(Event,event_id): raise HTTPException(404,"Event not found")
    return db.execute(select(Announcement).where(Announcement.event_id==event_id).order_by(Announcement.created_at.desc())).scalars().all()
