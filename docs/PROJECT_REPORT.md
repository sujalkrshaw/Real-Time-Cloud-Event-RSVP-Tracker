# Project Report

## Abstract
A cloud-ready event platform with authenticated event management, RSVP workflows, realtime synchronization, transaction-safe capacity control, notifications, analytics, testing, and container deployment.

## Problem
Spreadsheet/chat-based registration can create duplicates, stale counts, and manual coordination.

## Objectives
Centralize event data, enforce capacity, provide live RSVP counts, secure role-based access, and demonstrate cloud architecture.

## Industry relevance
The same pattern applies to conferences, workshops, corporate training, webinars, meetups, college festivals, and community events.

## Architecture
React frontend -> FastAPI -> PostgreSQL/SQLite, with WebSocket rooms for realtime updates.

## Database
Users, Events, RSVPs, Announcements, Notifications. `(event_id,user_id)` is unique.

## Authentication and authorization
Passwords are hashed. JWT authenticates requests. Role and event ownership are enforced server-side.

## RSVP and concurrency
A PostgreSQL row lock on the event serializes final-seat decisions. This prevents a check-then-insert race condition.

## Realtime
A committed RSVP triggers `RSVP_UPDATED`, which updates connected clients without refresh.

## Analytics
Counts, response rate for stored responses, utilization, and available seats are exposed.

## Security
Secrets are environment variables; backend is authoritative; production requires HTTPS, rate limiting, secret management, backups, and monitoring.

## Testing
Automated tests cover registration, duplicate registration, RBAC, RSVP transitions, capacity, ownership, notifications, and analytics.

## Limitations
Single-process WebSocket manager; no email/SMS provider enabled; waitlist is an extension point.

## Future scope
FIFO waitlist, QR check-in, email/push workers, Redis realtime fanout, audit log, SSO, calendar integration, payments, IaC.

## Conclusion
The project demonstrates a real-time, cloud-oriented architecture rather than a basic CRUD website.
