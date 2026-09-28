from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import roles
from app.db.session import get_db
from app.models import Event, Role
from app.services.rsvp import counts

router=APIRouter(prefix="/api/events",tags=["analytics"])

@router.get("/{event_id}/analytics")
def analytics(event_id:int,db:Session=Depends(get_db),user=Depends(roles(Role.ORGANIZER,Role.ADMIN))):
    e=db.get(Event,event_id)
    if not e: raise HTTPException(404,"Event not found")
    if user.role!=Role.ADMIN and e.organizer_id!=user.id: raise HTTPException(403,"Not your event")
    c=counts(db,e); total=c["going"]+c["maybe"]+c["not_going"]
    return {**c,"total_rsvps":total,"response_rate":100.0 if total else 0.0,
            "capacity_utilization":round(c["going"]/e.maximum_capacity*100,2),
            "available_seats":c["available"]}
