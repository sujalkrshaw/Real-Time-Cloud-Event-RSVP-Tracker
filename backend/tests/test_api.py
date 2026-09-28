from datetime import datetime,timedelta

def reg(c,email):
    return c.post("/api/auth/register",json={"name":email.split("@")[0],"email":email,"password":"Password123!"})

def login(c,email,password="Password123!"):
    return c.post("/api/auth/login",json={"email":email,"password":password})

def auth(token): return {"Authorization":f"Bearer {token}"}

def seed(c):
    c.post("/api/dev/seed")
    return login(c,"organizer@example.com","Organizer123!").json()["access_token"]

def event(c,token,capacity=2):
    return c.post("/api/events",headers=auth(token),json={
        "event_name":"Test Workshop","description":"test","event_type":"Workshop",
        "event_date":"2099-01-01","start_time":"10:00","end_time":"11:00","venue":"Virtual",
        "online_link":None,"maximum_capacity":capacity,
        "registration_deadline":(datetime.now()+timedelta(days=2)).isoformat()
    }).json()

def test_registration_login(client):
    assert reg(client,"a@example.com").status_code==201
    assert login(client,"a@example.com").status_code==200

def test_duplicate_registration(client):
    reg(client,"a@example.com")
    assert reg(client,"a@example.com").status_code==409

def test_attendee_cannot_create_event(client):
    token=reg(client,"a@example.com").json()["access_token"]
    assert event(client,token)["event_name"] if False else client.post("/api/events",headers=auth(token),json={
        "event_name":"x","description":"","event_type":"Workshop","event_date":"2099-01-01",
        "start_time":"10:00","end_time":"11:00","venue":"x","maximum_capacity":2,
        "registration_deadline":"2099-01-01T09:00"}).status_code==403

def test_event_and_rsvp_transition(client):
    org=seed(client); e=event(client,org)
    a=reg(client,"a@example.com").json()["access_token"]
    r=client.post(f"/api/events/{e['id']}/rsvp",headers=auth(a),json={"status":"GOING"})
    assert r.status_code==200 and r.json()["counts"]["going"]==1
    r=client.put(f"/api/events/{e['id']}/rsvp",headers=auth(a),json={"status":"MAYBE"})
    assert r.json()["counts"]["going"]==0 and r.json()["counts"]["maybe"]==1
    assert len(client.get("/api/rsvps/me",headers=auth(a)).json())==1

def test_capacity(client):
    org=seed(client); e=event(client,org,1)
    a=reg(client,"a@example.com").json()["access_token"]
    b=reg(client,"b@example.com").json()["access_token"]
    assert client.post(f"/api/events/{e['id']}/rsvp",headers=auth(a),json={"status":"GOING"}).status_code==200
    assert client.post(f"/api/events/{e['id']}/rsvp",headers=auth(b),json={"status":"GOING"}).status_code==409

def test_owner_security(client):
    org=seed(client); e=event(client,org)
    other=reg(client,"other@example.com").json()["access_token"]
    payload={**e,"event_name":"hacked","status":"PUBLISHED"}
    assert client.put(f"/api/events/{e['id']}",headers=auth(other),json=payload).status_code==403

def test_announcement_notification_analytics(client):
    org=seed(client); e=event(client,org)
    a=reg(client,"a@example.com").json()["access_token"]
    client.post(f"/api/events/{e['id']}/rsvp",headers=auth(a),json={"status":"GOING"})
    assert client.post(f"/api/events/{e['id']}/announcements",headers=auth(org),
                       json={"title":"Update","message":"Venue changed"}).status_code==201
    notes=client.get("/api/notifications",headers=auth(a)).json()
    assert any(n["type"]=="ANNOUNCEMENT" for n in notes)
    an=client.get(f"/api/events/{e['id']}/analytics",headers=auth(org))
    assert an.status_code==200 and an.json()["going"]==1
