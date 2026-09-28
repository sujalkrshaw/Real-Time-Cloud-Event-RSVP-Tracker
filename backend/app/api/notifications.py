from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_user
from app.db.session import get_db
from app.models import Notification
from app.schemas import NotificationOut

router=APIRouter(prefix="/api/notifications",tags=["notifications"])

@router.get("",response_model=list[NotificationOut])
def all_notifications(db:Session=Depends(get_db),user=Depends(current_user)):
    return db.execute(select(Notification).where(Notification.user_id==user.id).order_by(Notification.created_at.desc()).limit(100)).scalars().all()

@router.put("/{notification_id}/read",response_model=NotificationOut)
def read(notification_id:int,db:Session=Depends(get_db),user=Depends(current_user)):
    n=db.get(Notification,notification_id)
    if not n or n.user_id!=user.id: raise HTTPException(404,"Notification not found")
    n.read=True; db.commit(); db.refresh(n); return n
