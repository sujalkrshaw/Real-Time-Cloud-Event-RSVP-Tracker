from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models import Role, EventStatus, RSVPStatus

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class Login(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    role: Role

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class EventCreate(BaseModel):
    event_name: str = Field(min_length=3, max_length=200)
    description: str = ""
    event_type: str = "Workshop"
    event_date: str
    start_time: str
    end_time: str
    venue: str
    online_link: str | None = None
    maximum_capacity: int = Field(gt=0, le=1_000_000)
    registration_deadline: str

class EventUpdate(EventCreate):
    status: EventStatus | None = None

class EventOut(EventCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organizer_id: int
    status: EventStatus
    created_at: datetime
    updated_at: datetime

class RSVPCreate(BaseModel):
    status: RSVPStatus

class RSVPOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    user_id: int
    status: RSVPStatus
    responded_at: datetime
    updated_at: datetime

class Counts(BaseModel):
    going: int
    maybe: int
    not_going: int
    capacity: int
    available: int

class RSVPResponse(BaseModel):
    rsvp: RSVPOut
    counts: Counts

class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=1, max_length=5000)

class AnnouncementOut(AnnouncementCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    created_at: datetime

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    event_id: int | None
    type: str
    message: str
    read: bool
    created_at: datetime
