from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, Role
from app.schemas import UserCreate, Login, TokenOut, UserOut
from app.core.security import hash_password, verify_password, create_token
from app.api.deps import current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenOut, status_code=201)
def register(p: UserCreate, db: Session=Depends(get_db)):
    email = p.email.lower()
    if db.execute(select(User).where(User.email==email)).scalar_one_or_none():
        raise HTTPException(409, "Email already registered")
    # Public registration cannot self-promote to organizer/admin.
    user = User(name=p.name, email=email, password_hash=hash_password(p.password), role=Role.ATTENDEE)
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_token(user.id), "user": user}

@router.post("/login", response_model=TokenOut)
def login(p: Login, db: Session=Depends(get_db)):
    user = db.execute(select(User).where(User.email==p.email.lower())).scalar_one_or_none()
    if not user or not verify_password(p.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": create_token(user.id), "user": user}

@router.get("/me", response_model=UserOut)
def me(user=Depends(current_user)): return user
