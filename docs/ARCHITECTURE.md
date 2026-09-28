# Architecture

## Local
React -> FastAPI -> SQLite -> WebSocket manager.

## Cloud
React static hosting -> HTTPS -> FastAPI replicas -> managed PostgreSQL.

Realtime:
FastAPI transaction -> commit -> WebSocket broadcast.

Multi-instance production:
FastAPI replicas -> Redis Pub/Sub or managed realtime broker -> WebSocket clients.

The database remains authoritative. Browser counters are display state only.

### Cloud concept mapping

- SaaS: browser-accessible service
- PaaS: containerized API
- DBaaS: managed PostgreSQL
- REST: CRUD endpoints
- WebSockets: low-latency live updates
- Event-driven: committed RSVP emits realtime event
- CI/CD: GitHub Actions
- Secrets: deployment environment variables
- Scalability: stateless API + managed database + shared broker
