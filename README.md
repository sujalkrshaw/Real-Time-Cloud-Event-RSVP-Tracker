# 🚀 Real-Time Cloud Event RSVP Tracker

<p align="center">

<img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>

<img src="https://img.shields.io/badge/FastAPI-0.115.12-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>

<img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>

<img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>

<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>

<img src="https://img.shields.io/badge/WebSockets-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSockets"/>

<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>

<img src="https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions"/>

<img src="https://img.shields.io/badge/pytest-Testing-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white" alt="pytest"/>

</p>

<p align="center">

<strong>⚡ A full-stack, cloud-ready event management platform with real-time RSVP synchronization.</strong>

</p>

<p align="center">

Built with ❤️ using React, FastAPI, PostgreSQL, WebSockets, Docker and GitHub Actions.

</p>

---

## 🌟 Project Overview

**Real-Time Cloud Event RSVP Tracker** is a full-stack event management platform designed to demonstrate how modern web technologies can work together to build a reliable, real-time application.

The platform allows:

- 👤 Attendees to register and manage RSVP status
- 🎯 Organizers to create and manage events
- 🎟️ Users to select `GOING`, `MAYBE`, or `NOT_GOING`
- ⚡ Connected clients to receive real-time RSVP updates
- 📢 Organizers to publish announcements
- 🔔 Users to receive in-app notifications
- 📊 Organizers to access event analytics
- 🐳 Developers to run the complete system using Docker Compose

The project combines **frontend development, backend API design, relational database management, authentication, authorization, transaction handling, WebSockets, testing, containerization, and CI**.

---

# 🎯 Why I Built This

Instead of building only a basic CRUD application, I wanted to understand how different engineering components work together in a complete system.

The project focuses on:

```text
Frontend
   ↓
REST API
   ↓
Authentication & Authorization
   ↓
Database
   ↓
Transaction-Safe RSVP Processing
   ↓
Real-Time WebSocket Updates
   ↓
Notifications & Analytics
```

The goal was to build an integrated engineering system rather than an isolated frontend or backend demo.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- JWT-based authentication
- Password hashing with bcrypt
- Attendee and organizer roles
- Protected API endpoints
- Server-side authorization
- Organizer ownership checks
- RSVP ownership checks

---

## 📅 Event Management

Organizers can:

- ➕ Create events
- 👀 View events
- ✏️ Update events
- ❌ Cancel events
- 🎯 Define event capacity
- ⏰ Set registration deadlines
- 📍 Configure venue/online information
- 📊 Manage event information

---

## 🎟️ RSVP Management

Supported RSVP states:

```text
🟢 GOING
🟡 MAYBE
🔴 NOT_GOING
```

The backend maintains the authoritative RSVP state.

The database enforces a unique event/user RSVP relationship to prevent duplicate registrations.

---

# ⚡ Real-Time WebSocket System

One of the main engineering features of the project is real-time RSVP synchronization.

### Workflow

```text
┌─────────────────┐
│  React Client   │
└────────┬────────┘
         │
         │ RSVP
         ▼
┌─────────────────┐
│    FastAPI      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
└────────┬────────┘
         │
         │ Updated counts
         ▼
┌─────────────────┐
│ WebSocket Layer │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Connected Browser Users  │
└─────────────────────────┘
```

When one user changes their RSVP, connected clients can receive the updated event statistics without manually refreshing the page.

---

# 🔒 Transaction-Safe Capacity Handling

The backend does not trust frontend RSVP counters.

For a `GOING` RSVP, the backend performs the capacity check against database state.

### Processing flow

```text
1️⃣ Start database transaction
        ↓
2️⃣ Lock relevant event row
        ↓
3️⃣ Read current RSVP state
        ↓
4️⃣ Calculate current GOING count
        ↓
5️⃣ Check event capacity
        ↓
6️⃣ Create / update RSVP
        ↓
7️⃣ Commit transaction
        ↓
8️⃣ Recalculate authoritative counts
        ↓
9️⃣ Broadcast updated counts
```

This approach is designed to prevent duplicate registrations and handle concurrent final-seat requests using database transaction control.

---

# 📢 Announcements & Notifications

Organizers can publish event announcements.

Users can receive and view event-related notifications through the application.

Example workflow:

```text
Organizer
    ↓
Publish Announcement
    ↓
Backend
    ↓
Notification
    ↓
Attendee Dashboard
```

---

# 📊 Analytics

The backend provides event-level analytics endpoints for RSVP-related information.

Organizers can use the event statistics to understand registration activity.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     React + Vite    │
                    │      Frontend       │
                    │     Port 5173       │
                    └──────────┬──────────┘
                               │
                     REST / WebSocket
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    │     Port 8000       │
                    └──────────┬──────────┘
                               │
                        SQLAlchemy ORM
                               │
                               ▼
                    ┌─────────────────────┐
                    │    PostgreSQL 16    │
                    │      Database       │
                    │     Port 5432       │
                    └─────────────────────┘
```

---

# 🧰 Technology Stack

| Category | Technology |
|---|---|
| 🎨 Frontend | React 18 |
| ⚡ Build Tool | Vite |
| 🐍 Backend | FastAPI |
| 💻 Language | Python |
| 🗄️ Database | PostgreSQL 16 |
| 🔗 ORM | SQLAlchemy |
| 🔐 Authentication | JWT |
| 🔑 Password Hashing | bcrypt |
| 🌐 API | REST |
| ⚡ Real-Time | WebSockets |
| 🐳 Containerization | Docker |
| 📦 Orchestration | Docker Compose |
| 🧪 Testing | pytest |
| 🔄 CI | GitHub Actions |
| 🌱 Version Control | Git / GitHub |

---

# 📸 Application Screenshots

## 🏠 Dashboard

![Dashboard](screenshots/01-dashboard-overview.png)

The dashboard provides:

- KPI statistics
- Upcoming events
- Event information
- RSVP statistics
- Organizer workspace

---

## 📅 Event Details

![Event Details](screenshots/02-event-details.png)

Displays event information and current RSVP statistics.

---

## 🎟️ RSVP System

![RSVP System](screenshots/03-rsvp-system.png)

Users can change their RSVP status and view updated statistics.

---

## ➕ Event Creation

![Create Event](screenshots/04-create-event.png)

Organizers can create events with configurable:

- Event name
- Description
- Event type
- Date
- Start/end time
- Venue
- Capacity
- Registration deadline

---

## 🔔 Notifications

![Notifications](screenshots/05-notifications.png)

Displays event-related announcements and notifications.

---

## 🐳 Docker Services

![Docker Services](screenshots/07-docker-services.png)

The complete application runs through Docker Compose.

---

## 📚 FastAPI Documentation

![FastAPI API](screenshots/08-fastapi-api.png)

FastAPI provides interactive API documentation through Swagger UI.

---

## 📁 Project Structure

![Project Structure](screenshots/09-project-structure.png)

The repository separates frontend, backend, tests, documentation, CI, screenshots and supporting resources.

---

# 📡 API Endpoints

## 🔐 Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## 📅 Events

```text
POST   /api/events
GET    /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
GET    /api/events/{id}/counts
```

## 🎟️ RSVP

```text
POST/PUT /api/events/{id}/rsvp
DELETE   /api/events/{id}/rsvp
GET      /api/events/{id}/rsvps
GET      /api/rsvps/me
```

## 📊 Analytics

```text
GET /api/events/{id}/analytics
```

## 📢 Announcements

```text
POST /api/events/{id}/announcements
GET  /api/events/{id}/announcements
```

## 🔔 Notifications

```text
GET /api/notifications
PUT /api/notifications/{id}/read
```

## ⚡ WebSocket

```text
WS /ws/events/{id}?token=JWT
```

## ❤️ Health Check

```text
GET /health
```

---

# 🧪 Testing

The backend includes automated tests using `pytest`.

Run:

```bash
cd backend
pytest -q
```

The application was also manually tested for:

- ✅ Authentication
- ✅ Event creation
- ✅ Event listing
- ✅ Event details
- ✅ RSVP transitions
- ✅ RSVP statistics
- ✅ Announcements
- ✅ Notifications
- ✅ WebSocket updates
- ✅ Invalid form input
- ✅ Authentication failures
- ✅ Backend failure behavior
- ✅ Session persistence
- ✅ Edge-case inputs

---

# 🔄 GitHub Actions CI

The project includes automated CI using GitHub Actions.

```text
.github/
└── workflows/
    └── ci.yml
```

The workflow runs on:

```text
push
pull_request
```

### 🐍 Backend

```text
Python 3.12
     ↓
Install dependencies
     ↓
pytest
```

### ⚛️ Frontend

```text
Node.js 20
     ↓
npm ci
     ↓
npm run build
```

This verifies the backend test suite and frontend production build automatically.

---

# 🐳 Docker

The application runs as a multi-container system:

```text
┌─────────────────────────┐
│       Frontend          │
│      React + Vite       │
│       Port 5173         │
└────────────┬────────────┘
             │
             │ REST / WebSocket
             ▼
┌─────────────────────────┐
│        Backend          │
│         FastAPI         │
│       Port 8000         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
│       Port 5432         │
└─────────────────────────┘
```

---

# 🚀 Quick Start

## Prerequisites

Install:

- 🐳 Docker Desktop
- 🌱 Git

---

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd Real-Time-Cloud-Event-RSVP-Tracker
```

---

## 2️⃣ Configure Environment

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

Update `.env` with appropriate local values.

> ⚠️ Never commit the real `.env` file.

---

## 3️⃣ Start Application

```bash
docker compose up --build
```

---

## 4️⃣ Open Application

### 🎨 Frontend

```text
http://localhost:5173
```

### ⚙️ Backend

```text
http://localhost:8000
```

### 📚 API Documentation

```text
http://localhost:8000/docs
```

---

# 👤 Demo Accounts

The application contains synthetic development/demo accounts.

### 🎯 Organizer

```text
Email: organizer@example.com
Password: Organizer123!
Role: ORGANIZER
```

### 👤 Attendee

```text
Email: alice@example.com
Password: Attendee123!
Role: ATTENDEE
```

### 👤 Attendee

```text
Email: bob@example.com
Password: Attendee123!
Role: ATTENDEE
```

> ⚠️ These credentials are intended only for local demonstration and should not be used for a real deployment.

---

# 🌱 Development Seed Data

For local development/demo purposes, synthetic seed data can be created through:

```bash
curl -X POST http://localhost:8000/api/dev/seed
```

> ⚠️ The development seed endpoint should not be exposed in a production deployment.

---

# 🔐 Environment Configuration

The repository provides:

```text
.env.example
```

Example:

```text
POSTGRES_DB=event_tracker
POSTGRES_USER=event_tracker
POSTGRES_PASSWORD=your_secure_database_password

DATABASE_URL=postgresql+psycopg://event_tracker:your_secure_database_password@db:5432/event_tracker

JWT_SECRET=replace_with_a_long_random_secret

ACCESS_TOKEN_MINUTES=60

CORS_ORIGINS=http://localhost:5173

VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

The real `.env` file is excluded from Git.

---

# 📁 Project Structure

```text
Real-Time-Cloud-Event-RSVP-Tracker/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEMO_SCRIPT.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_REPORT.md
│   ├── ROADMAP.md
│   └── SCREENSHOT_CHECKLIST.md
│
├── sample_data/
├── screenshots/
├── scripts/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

# 🛡️ Security

The project implements:

- 🔐 JWT authentication
- 🔑 Password hashing
- 👥 Role-based authorization
- 🔒 Server-side ownership validation
- 🎟️ RSVP ownership checks
- 🗄️ Database-backed RSVP state
- ⚙️ Environment-based configuration
- 🚫 `.env` excluded from Git
- 🌐 CORS configuration

For production deployment, additional controls should be considered:

- HTTPS/WSS
- Rate limiting
- Secure secret management
- Managed PostgreSQL security
- Database backups
- Monitoring and alerting
- Production CORS configuration
- Removal of development-only endpoints

---

# ☁️ Cloud-Ready Architecture

The application is containerized and uses PostgreSQL through an environment-based database URL.

A future horizontally scaled architecture could use:

```text
                 🌐 CDN
                  │
                  ▼
            ⚖️ Load Balancer
                  │
          ┌───────┴───────┐
          ▼               ▼
       API #1           API #2
          │               │
          └───────┬───────┘
                  │
                  ▼
             🗄️ PostgreSQL
                  │
                  ▼
          ⚡ Shared Realtime
             Infrastructure
```

Potential scaling improvements:

- Redis Pub/Sub
- Connection pooling
- Database indexing
- Caching
- Background workers
- Queue-based notifications
- Rate limiting
- Load testing
- Horizontal API scaling
- Centralized monitoring

These are future scalability considerations, not claims about the current local deployment.

---

# 🗺️ Future Improvements

Potential future improvements include:

- ⚡ Redis Pub/Sub for multi-instance WebSocket broadcasting
- 📧 Email notifications
- 📅 Calendar integration
- 📊 Advanced organizer analytics
- 🔎 Event search and filtering
- ☁️ Automated cloud deployment
- 🧪 Load testing
- 📈 Observability and monitoring
- ⚙️ Background notification workers
- 🔐 Production secret management

---

# 💼 Engineering Highlights

This project demonstrates practical experience with:

```text
⚛️ React
🐍 FastAPI
🗄️ PostgreSQL
🔗 SQLAlchemy
🔐 JWT Authentication
👥 RBAC
🌐 REST APIs
⚡ WebSockets
🔒 Database Transactions
🎟️ RSVP Processing
🐳 Docker
🧪 pytest
🔄 GitHub Actions
🌱 Git
📚 Technical Documentation
```

---

# 🎓 Resume Project Description

### Real-Time Cloud Event RSVP Tracker

**Technologies:** React, FastAPI, PostgreSQL, SQLAlchemy, JWT, WebSockets, Docker, GitHub Actions, pytest

- Built a full-stack event management platform with React, FastAPI, PostgreSQL, JWT authentication, role-based authorization, REST APIs, and WebSockets.
- Implemented server-side RSVP processing with database-backed capacity validation and unique event/user constraints.
- Added real-time RSVP statistics, announcements, notifications, automated backend testing, Docker Compose, and GitHub Actions CI.

---

# 🏷️ Repository Topics

```text
cloud-computing
event-management
rsvp
realtime
fastapi
react
websocket
postgresql
rest-api
jwt
docker
github-actions
full-stack
python
```

---

# 📊 Project Status

| Component | Status |
|---|---|
| ⚛️ React Frontend | ✅ Complete |
| 🐍 FastAPI Backend | ✅ Complete |
| 🗄️ PostgreSQL | ✅ Integrated |
| 🔐 Authentication | ✅ Implemented |
| 👥 Authorization | ✅ Implemented |
| 📅 Event Management | ✅ Implemented |
| 🎟️ RSVP System | ✅ Implemented |
| ⚡ WebSockets | ✅ Implemented |
| 📢 Announcements | ✅ Implemented |
| 🔔 Notifications | ✅ Implemented |
| 📊 Analytics | ✅ Implemented |
| 🐳 Docker | ✅ Implemented |
| 🧪 Automated Tests | ✅ Implemented |
| 🔄 GitHub Actions CI | ✅ Implemented |
| 📚 Documentation | ✅ Complete |

---

# 👨‍💻 About This Project

**Real-Time Cloud Event RSVP Tracker** is an engineering-focused full-stack project demonstrating how **React, FastAPI, PostgreSQL, REST APIs, WebSockets, authentication, database transactions, Docker, automated testing, and CI** can work together as one complete application.

---

<p align="center">

⭐ If you find this project useful, consider giving the repository a star!

</p>

<p align="center">

<strong>Built with curiosity, engineering practice, and continuous learning. 🚀</strong>

</p>