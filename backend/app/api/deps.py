from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.db.session import get_db
from app.models import User, Role

bearer = HTTPBearer()

def current_user(creds=Depends(bearer), db: Session=Depends(get_db)):
    user_id = decode_token(creds.credentials)
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user: raise HTTPException(401, "User not found")
    return user

def roles(*allowed):
    def dep(user=Depends(current_user)):
        if user.role not in allowed: raise HTTPException(403, "Insufficient permissions")
        return user
    return dep
