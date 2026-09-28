# API reference

Protected routes use `Authorization: Bearer <JWT>`.

`POST /api/auth/register` — create attendee account.  
`POST /api/auth/login` — obtain JWT.  
`GET /api/auth/me` — current user.

`POST /api/events` — organizer/admin create.  
`GET /api/events` — list events.  
`GET /api/events/{id}` — event details.  
`PUT /api/events/{id}` — owner/admin update.  
`DELETE /api/events/{id}` — owner/admin cancel.  
`GET /api/events/{id}/counts` — authoritative counts.

`POST/PUT /api/events/{id}/rsvp`:
```json
{"status":"GOING"}
```
Returns RSVP + counts. `409` is used for capacity/deadline conflicts.

`DELETE /api/events/{id}/rsvp` — remove current user's RSVP.  
`GET /api/events/{id}/rsvps` — organizer/admin list.  
`GET /api/rsvps/me` — current user's RSVPs.

`GET /api/events/{id}/analytics` — organizer/admin analytics.

`POST /api/events/{id}/announcements` — publish announcement.  
`GET /api/events/{id}/announcements` — list announcements.

`GET /api/notifications` — current user's notifications.  
`PUT /api/notifications/{id}/read` — mark read.

`WS /ws/events/{id}?token=JWT` — realtime room.

Example server message:
```json
{"type":"RSVP_UPDATED","counts":{"going":2,"maybe":0,"not_going":0,"capacity":100,"available":98}}
```
