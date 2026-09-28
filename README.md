# Real-Time Cloud-Based Event Planning & RSVP Tracker

Industry-oriented, cloud-ready event platform demonstrating **React + FastAPI + PostgreSQL/SQLite + JWT + REST + WebSockets + transaction-safe capacity control + notifications + analytics + Docker + CI**.

## Architecture

```text
React Browser(s)
      |
 HTTPS/JSON + WebSocket
      v
 FastAPI API
      |
      +---- JWT/RBAC
      |
      +---- SQLAlchemy ---- PostgreSQL (production)
      |                       SQLite (local)
      |
      +---- WebSocket rooms
      |
      +---- Notifications / Analytics
```

For multiple API instances, replace the in-memory WebSocket manager with Redis Pub/Sub or a managed realtime service.

## Main features

- Attendee and organizer roles
- Event CRUD and cancellation
- RSVP: GOING / MAYBE / NOT_GOING
- Unique `(event_id, user_id)` RSVP constraint
- Transaction-safe capacity enforcement
- Real-time organizer counters through WebSockets
- Announcements and in-app notifications
- Analytics
- JWT authentication and password hashing
- Owner-based authorization
- Automated backend tests
- Docker Compose
- GitHub Actions CI
- Cloud-ready `DATABASE_URL`

## Local run

### Docker

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`  
API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

Seed synthetic demo data:

```bash
curl -X POST http://localhost:8000/api/dev/seed
```

Demo users:

```text
organizer@example.com / Organizer123!
alice@example.com     / Attendee123!
bob@example.com       / Attendee123!
```

### Without Docker

Backend:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Realtime proof

Open three browser windows:

1. Organizer: `organizer@example.com`
2. Alice: `alice@example.com`
3. Bob: `bob@example.com`

Alice -> GOING -> organizer count changes immediately.  
Bob -> GOING -> count changes again.  
Alice -> MAYBE -> Going/Maybe counts change without refresh.

## Race-condition solution

The backend does **not** trust frontend counts.

For a GOING RSVP it:

1. Starts a database transaction.
2. Locks the event row (`SELECT ... FOR UPDATE` on PostgreSQL).
3. Reads the current RSVP state.
4. Counts GOING records.
5. Rejects a new GOING request if capacity is full.
6. Inserts/updates one RSVP.
7. Commits.
8. Recalculates authoritative counts.
9. Broadcasts counts over WebSocket.

If capacity is 100 and 99 users are GOING, simultaneous final-seat requests serialize. One can consume the last seat; the other receives HTTP `409`.

## API

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/events
GET    /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
GET    /api/events/{id}/counts

POST/PUT /api/events/{id}/rsvp
DELETE   /api/events/{id}/rsvp
GET      /api/events/{id}/rsvps
GET      /api/rsvps/me

GET  /api/events/{id}/analytics

POST /api/events/{id}/announcements
GET  /api/events/{id}/announcements

GET /api/notifications
PUT /api/notifications/{id}/read

WS /ws/events/{id}?token=JWT
GET /health
```

## Cloud concepts

| Concept | Evidence in project |
|---|---|
| SaaS | Browser-based event application |
| PaaS | Containerized FastAPI deployment |
| Cloud DB | PostgreSQL through `DATABASE_URL` |
| Auth | JWT + bcrypt |
| Authorization | RBAC + ownership checks |
| REST | `/api/*` |
| Realtime | WebSockets |
| Server-side truth | Counts calculated from DB |
| Transactions | Capacity-safe RSVP |
| Scalability | Stateless API + managed DB + shared realtime broker path |
| CI/CD | GitHub Actions |
| Secrets | `.env`, deployment secret variables |
| Failure handling | rollback, retries/reconnect, idempotent RSVP updates |
| Monitoring | `/health` + logs |

## Security

- Never commit `.env`
- Hash passwords
- Sign JWTs with a deployment secret
- Enforce roles server-side
- Enforce organizer ownership server-side
- Enforce RSVP ownership
- Use HTTPS/WSS in production
- Add rate limiting at the edge/API gateway
- Use managed PostgreSQL backups/encryption
- Remove `/api/dev/seed` from production
- Do not let clients submit RSVP counts

## Scaling path

```text
CDN -> Load Balancer -> API replicas -> PostgreSQL
                         |
                         +-> Redis / queue -> notification workers
                         |
                         +-> Redis Pub/Sub -> WebSocket replicas
```

For 100k users, add connection pooling, indexes, caching, rate limits, queues, shared realtime fanout, and load testing.

## Test

```bash
cd backend
pytest -q
```

## GitHub

```bash
git init
git add .
git commit -m "Initialize real-time cloud event tracker"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

Recommended commits:

```text
Create authentication and roles
Add event management
Implement RSVP workflow
Add transaction-safe capacity control
Add WebSocket realtime updates
Add announcements and notifications
Build analytics
Add automated tests
Add Docker and CI
Complete documentation
Deploy application
```

## Deployment

See `docs/DEPLOYMENT.md`. The frontend can be deployed to a static host and the backend as a container connected to managed PostgreSQL. Provider free tiers change over time; verify current student/free-tier terms before choosing a provider.

## Resume bullets

- Built a cloud-ready real-time event management platform with React, FastAPI, PostgreSQL/SQLite, JWT authentication, RBAC, REST APIs, and WebSockets.
- Implemented transaction-safe RSVP capacity enforcement and unique user/event constraints to prevent duplicate registrations and final-seat race conditions.
- Added analytics, announcements, notifications, automated tests, Docker, and CI/CD-ready deployment architecture.

## Repository topics

`cloud-computing`, `event-management`, `rsvp`, `realtime`, `fastapi`, `react`, `websocket`, `postgresql`, `rest-api`, `authentication`, `docker`
