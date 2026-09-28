from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Event, RSVP, RSVPStatus, EventStatus, Notification

def counts(db: Session, event: Event):
    rows = db.execute(
        select(RSVP.status, func.count(RSVP.id))
        .where(RSVP.event_id == event.id)
        .group_by(RSVP.status)
    ).all()
    data = {s.value: 0 for s in RSVPStatus}
    for status, n in rows: data[status.value] = n
    going = data["GOING"]
    return {
        "going": going, "maybe": data["MAYBE"], "not_going": data["NOT_GOING"],
        "capacity": event.maximum_capacity, "available": max(event.maximum_capacity-going, 0)
    }

def upsert(db: Session, event_id: int, user_id: int, status: RSVPStatus):
    # PostgreSQL row lock is the critical concurrency primitive.
    event = db.execute(select(Event).where(Event.id == event_id).with_for_update()).scalar_one_or_none()
    if not event: raise HTTPException(404, "Event not found")
    if event.status in {EventStatus.CANCELLED, EventStatus.COMPLETED, EventStatus.DRAFT}:
        raise HTTPException(409, "Event is not accepting RSVPs")
    try:
        if datetime.fromisoformat(event.registration_deadline) < datetime.now():
            raise HTTPException(409, "Registration deadline has passed")
    except ValueError as exc:
        raise HTTPException(500, "Invalid registration deadline") from exc

    existing = db.execute(select(RSVP).where(RSVP.event_id==event_id, RSVP.user_id==user_id)).scalar_one_or_none()
    c = counts(db, event)
    already_going = existing and existing.status == RSVPStatus.GOING
    if status == RSVPStatus.GOING and not already_going and c["going"] >= event.maximum_capacity:
        event.status = EventStatus.FULL
        db.commit()
        raise HTTPException(409, "Capacity reached")

    if existing:
        existing.status = status
        rsvp = existing
    else:
        rsvp = RSVP(event_id=event_id, user_id=user_id, status=status)
        db.add(rsvp)

    db.add(Notification(
        user_id=user_id, event_id=event_id, type="RSVP",
        message=f"Your RSVP for '{event.event_name}' is {status.value}."
    ))
    db.commit()
    db.refresh(rsvp)
    c = counts(db, event)
    event.status = EventStatus.FULL if c["going"] >= event.maximum_capacity else EventStatus.PUBLISHED
    db.commit()
    return rsvp, c
