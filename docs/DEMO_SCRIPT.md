# Demo

1. `docker compose up --build`
2. `curl -X POST http://localhost:8000/api/dev/seed`
3. Browser A: organizer login.
4. Browser B: Alice login.
5. Browser C: Bob login.
6. Alice -> GOING; show organizer counter changes.
7. Bob -> GOING; show second update.
8. Alice -> MAYBE; show counts update.
9. Organizer publishes announcement; attendees receive notification.
10. Create a capacity-1 event and demonstrate `409 Capacity reached`.
11. Attempt unauthorized event update; show `403`.
12. Run `cd backend && pytest -q`.
