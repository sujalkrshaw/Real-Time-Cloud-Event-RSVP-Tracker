import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import { subscribe } from "./services/realtime";
import Stats from "./components/Stats";

const initial = {
  event_name: "",
  description: "",
  event_type: "Workshop",
  event_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  online_link: "",
  maximum_capacity: 100,
  registration_deadline: "",
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  const [counts, setCounts] = useState(null);
  const [mine, setMine] = useState(null);

  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("login");

  const [auth, setAuth] = useState({
    name: "",
    email: "organizer@example.com",
    password: "Organizer123!",
  });

  const [form, setForm] = useState(initial);

  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
  });

  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  /* =========================================================
     AUTHENTICATION
     ========================================================= */

  useEffect(() => {
    if (!token) return;

    api("/api/auth/me")
      .then(setUser)
      .catch(() => logout());

    load();
  }, [token]);

  async function load() {
    try {
      const data = await api("/api/events");

      setEvents(data);

      if (!selected && data.length > 0) {
        setSelected(data[0]);
      }
    } catch (e) {
      setMsg(e.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setSelected(null);
    setEvents([]);
    setCounts(null);
    setMine(null);
    setNotes([]);
    setMsg("");
  }

  async function handleAuth(e) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    try {
      const r = await api(
        `/api/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          body: JSON.stringify(
            mode === "login"
              ? {
                  email: auth.email,
                  password: auth.password,
                }
              : auth
          ),
        }
      );

      localStorage.setItem("token", r.access_token);

      setToken(r.access_token);
      setUser(r.user);
      setMsg("");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function seed() {
    try {
      const base =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8000";

      const response = await fetch(
        `${base}/api/dev/seed`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        let message = `HTTP ${response.status}`;

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {}

        throw new Error(message);
      }

      setMsg(
        "Demo data is ready. Use the organizer credentials shown below."
      );
    } catch (e) {
      setMsg(e.message);
    }
  }

  /* =========================================================
     SELECTED EVENT + REALTIME
     ========================================================= */

  useEffect(() => {
    if (!token || !selected) return;

    let stop = () => {};

    (async () => {
      try {
        const eventCounts = await api(
          `/api/events/${selected.id}/counts`
        );

        setCounts(eventCounts);

        const rs = await api("/api/rsvps/me");

        setMine(
          rs.find(
            (x) => x.event_id === selected.id
          )?.status || null
        );

        stop = subscribe(
          selected.id,
          token,
          (m) => {
            if (m.type === "RSVP_UPDATED") {
              setCounts(m.counts);
            }

            if (m.type === "ANNOUNCEMENT") {
              setMsg(
                `New announcement: ${m.title}`
              );
            }
          }
        );
      } catch (e) {
        setMsg(e.message);
      }
    })();

    return () => stop();
  }, [selected, token]);

  /* =========================================================
     RSVP
     ========================================================= */

  async function rsvp(status) {
    if (!selected) return;

    setRsvpLoading(true);
    setMsg("");

    try {
      const r = await api(
        `/api/events/${selected.id}/rsvp`,
        {
          method: mine ? "PUT" : "POST",
          body: JSON.stringify({
            status,
          }),
        }
      );

      setMine(r.rsvp.status);
      setCounts(r.counts);

      setMsg("RSVP updated successfully.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setRsvpLoading(false);
    }
  }

  /* =========================================================
     EVENT CREATION + VALIDATION
     ========================================================= */

  async function create(e) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    // Required fields
    if (
      !form.event_name.trim() ||
      !form.description.trim() ||
      !form.event_date ||
      !form.start_time ||
      !form.end_time ||
      !form.venue.trim() ||
      !form.registration_deadline
    ) {
      setMsg(
        "Please complete all required event fields."
      );

      setLoading(false);
      return;
    }

    // Capacity validation
    const capacity = Number(
      form.maximum_capacity
    );

    if (
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      setMsg(
        "Capacity must be a positive whole number."
      );

      setLoading(false);
      return;
    }

    // Time validation
    if (form.end_time <= form.start_time) {
      setMsg(
        "End time must be later than start time."
      );

      setLoading(false);
      return;
    }

    // Registration deadline validation
    const deadline = new Date(
      form.registration_deadline
    );

    const eventDateTime = new Date(
      `${form.event_date}T${form.start_time}`
    );

    if (Number.isNaN(deadline.getTime())) {
      setMsg(
        "Please enter a valid registration deadline."
      );

      setLoading(false);
      return;
    }

    if (deadline >= eventDateTime) {
      setMsg(
        "Registration deadline must be before the event starts."
      );

      setLoading(false);
      return;
    }

    try {
      await api("/api/events", {
        method: "POST",
        body: JSON.stringify({
          ...form,

          event_name:
            form.event_name.trim(),

          description:
            form.description.trim(),

          venue:
            form.venue.trim(),

          maximum_capacity:
            capacity,
        }),
      });

      setMsg(
        "Event created successfully."
      );

      setForm(initial);

      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ANNOUNCEMENTS
     ========================================================= */

  async function announce(e) {
    e.preventDefault();

    if (!selected) return;

    setMsg("");

    try {
      await api(
        `/api/events/${selected.id}/announcements`,
        {
          method: "POST",
          body: JSON.stringify(
            announcement
          ),
        }
      );

      setAnnouncement({
        title: "",
        message: "",
      });

      setMsg(
        "Announcement published successfully."
      );
    } catch (e) {
      setMsg(e.message);
    }
  }

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

  async function loadNotes() {
    try {
      setNotes(
        await api("/api/notifications")
      );
    } catch (e) {
      setMsg(e.message);
    }
  }

  /* =========================================================
     DERIVED DASHBOARD DATA
     ========================================================= */

  const publishedEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.status !== "CANCELLED"
      ),
    [events]
  );

  const totalCapacity = useMemo(
    () =>
      publishedEvents.reduce(
        (sum, event) =>
          sum +
          Number(
            event.maximum_capacity || 0
          ),
        0
      ),
    [publishedEvents]
  );

  const isOrganizer =
    user?.role === "ORGANIZER" ||
    user?.role === "ADMIN";

  /* =========================================================
     LOGIN SCREEN
     ========================================================= */

  if (!token) {
    return (
      <main className="shell narrow">
        <div className="card login-card">

          <div className="brand-mark">
            ☁
          </div>

          <div className="login-heading">
            <span className="eyebrow">
              CLOUD EVENT PLATFORM
            </span>

            <h1>
              Cloud Event
              <br />
              RSVP Tracker
            </h1>

            <p>
              A real-time event management
              platform for organizers and
              participants.
            </p>
          </div>

          <button
            className="secondary full-width"
            onClick={seed}
          >
            ✨ Create Demo Environment
          </button>

          <div className="demo-credentials">
            <strong>
              Demo organizer
            </strong>

            <span>
              organizer@example.com
            </span>

            <span>
              Organizer123!
            </span>
          </div>

          {msg && (
            <div className="notice">
              {msg}
            </div>
          )}

          <form onSubmit={handleAuth}>

            {mode === "register" && (
              <div className="field">

                <label>
                  Name
                </label>

                <input
                  placeholder="Your full name"
                  value={auth.name}
                  onChange={(e) =>
                    setAuth({
                      ...auth,
                      name:
                        e.target.value,
                    })
                  }
                  required
                />

              </div>
            )}

            <div className="field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={auth.email}
                onChange={(e) =>
                  setAuth({
                    ...auth,
                    email:
                      e.target.value,
                  })
                }
                required
              />

            </div>

            <div className="field">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={auth.password}
                onChange={(e) =>
                  setAuth({
                    ...auth,
                    password:
                      e.target.value,
                  })
                }
                required
              />

            </div>

            <button
              type="submit"
              className="primary full-width"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign in →"
                : "Create account →"}
            </button>

          </form>

          <button
            type="button"
            className="link-button"
            onClick={() =>
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>

        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
     ========================================================= */

  return (
    <main className="shell">

      {/* HEADER */}

      <header className="top dashboard-header">

        <div className="brand-area">

          <div className="brand-icon">
            ☁
          </div>

          <div>

            <span className="eyebrow">
              EVENT OPERATIONS
            </span>

            <h1>
              Cloud Event
              <span className="brand-highlight">
                {" "}Hub
              </span>
            </h1>

          </div>

        </div>

        <div className="user-area">

          <div className="user-info">

            <strong>
              {user?.name || "User"}
            </strong>

            <span>
              {user?.role}
            </span>

          </div>

          <button
            className="secondary"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* GLOBAL MESSAGE */}

      {msg && (
        <div className="notice">
          <span>
            ●
          </span>

          {msg}
        </div>
      )}

      {/* KPI CARDS */}

      <section className="dashboard-kpis">

        <div className="kpi-card">

          <span className="kpi-icon">
            📅
          </span>

          <div>
            <span>
              Total Events
            </span>

            <strong>
              {publishedEvents.length}
            </strong>
          </div>

        </div>

        <div className="kpi-card">

          <span className="kpi-icon">
            🎟️
          </span>

          <div>
            <span>
              Total Capacity
            </span>

            <strong>
              {totalCapacity}
            </strong>
          </div>

        </div>

        <div className="kpi-card">

          <span className="kpi-icon">
            ⚡
          </span>

          <div>
            <span>
              Realtime Status
            </span>

            <strong className="status-online">
              Live
            </strong>
          </div>

        </div>

        <div className="kpi-card">

          <span className="kpi-icon">
            👤
          </span>

          <div>
            <span>
              Account
            </span>

            <strong>
              {user?.role || "USER"}
            </strong>
          </div>

        </div>

      </section>

      {/* EVENTS + DETAILS */}

      <section className="dashboard-grid">

        {/* EVENT LIST */}

        <aside className="card event-sidebar">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                SCHEDULE
              </span>

              <h2>
                Upcoming Events
              </h2>

            </div>

            <button
              className="icon-button"
              onClick={load}
              title="Refresh events"
            >
              ↻
            </button>

          </div>

          <div className="event-list">

            {publishedEvents.length === 0 ? (

              <div className="empty-state">

                <div>
                  📅
                </div>

                <strong>
                  No events yet
                </strong>

                <span>
                  Create your first event
                  below.
                </span>

              </div>

            ) : (

              publishedEvents.map(
                (event) => (

                  <button
                    key={event.id}
                    className={`event-card ${
                      selected?.id ===
                      event.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelected(event)
                    }
                  >

                    <div className="event-card-top">

                      <span className="event-type">
                        {event.event_type}
                      </span>

                      <span
                        className={`event-status ${String(
                          event.status
                        ).toLowerCase()}`}
                      >
                        {event.status}
                      </span>

                    </div>

                    <strong>
                      {event.event_name}
                    </strong>

                    <span className="event-meta">
                      📅 {event.event_date}
                    </span>

                    <span className="event-meta">
                      🕐 {event.start_time}
                      {" – "}
                      {event.end_time}
                    </span>

                  </button>

                )
              )

            )}

          </div>

        </aside>

        {/* EVENT DETAILS */}

        <section className="card event-details">

          {selected ? (

            <>

              <div className="event-detail-header">

                <div>

                  <span className="event-type large">
                    {selected.event_type}
                  </span>

                  <h2>
                    {selected.event_name}
                  </h2>

                  <p>
                    {selected.description}
                  </p>

                </div>

                <span className="live-badge">
                  ● LIVE
                </span>

              </div>

              <div className="event-information">

                <div>
                  <span>
                    DATE
                  </span>

                  <strong>
                    {selected.event_date}
                  </strong>
                </div>

                <div>
                  <span>
                    TIME
                  </span>

                  <strong>
                    {selected.start_time}
                    {" – "}
                    {selected.end_time}
                  </strong>
                </div>

                <div>
                  <span>
                    LOCATION
                  </span>

                  <strong>
                    {selected.venue}
                  </strong>
                </div>

                <div>
                  <span>
                    CAPACITY
                  </span>

                  <strong>
                    {selected.maximum_capacity}
                  </strong>
                </div>

              </div>

              <Stats c={counts} />

              <div className="rsvp-section">

                <div>

                  <span className="eyebrow">
                    YOUR RESPONSE
                  </span>

                  <h3>
                    {mine
                      ? `Current status: ${mine}`
                      : "Are you attending?"}
                  </h3>

                </div>

                <div className="actions">

                  <button
                    className={
                      mine === "GOING"
                        ? "primary"
                        : ""
                    }
                    disabled={
                      rsvpLoading
                    }
                    onClick={() =>
                      rsvp("GOING")
                    }
                  >
                    ✓ Going
                  </button>

                  <button
                    className={
                      mine === "MAYBE"
                        ? "primary"
                        : "secondary"
                    }
                    disabled={
                      rsvpLoading
                    }
                    onClick={() =>
                      rsvp("MAYBE")
                    }
                  >
                    Maybe
                  </button>

                  <button
                    className={
                      mine ===
                      "NOT_GOING"
                        ? "primary"
                        : "secondary"
                    }
                    disabled={
                      rsvpLoading
                    }
                    onClick={() =>
                      rsvp("NOT_GOING")
                    }
                  >
                    Not Going
                  </button>

                </div>

              </div>

              <div className="realtime-info">

                <span className="pulse-dot" />

                Live WebSocket updates
                enabled

              </div>

              {selected.online_link && (
                <a
                  href={
                    selected.online_link
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="online-link"
                >
                  Join online event →
                </a>
              )}

            </>

          ) : (

            <div className="welcome-panel">

              <div className="welcome-icon">
                ☁
              </div>

              <h2>
                Welcome to Cloud Event Hub
              </h2>

              <p>
                Select an event from the
                schedule to view details,
                availability and RSVP
                options.
              </p>

            </div>

          )}

        </section>

      </section>

      {/* ORGANIZER AREA */}

      {isOrganizer && (

        <section className="management-section">

          <div className="section-title">

            <span className="eyebrow">
              MANAGEMENT
            </span>

            <h2>
              Organizer Workspace
            </h2>

            <p>
              Create events and communicate
              with registered participants.
            </p>

          </div>

          <div className="management-grid">

            {/* CREATE EVENT */}

            <form
              className="card management-card"
              onSubmit={create}
            >

              <div className="card-title">

                <span className="title-icon">
                  ＋
                </span>

                <div>

                  <h3>
                    Create Event
                  </h3>

                  <p>
                    Publish a new event to
                    the platform.
                  </p>

                </div>

              </div>

              <div className="form-grid">

                <div className="field full">

                  <label>
                    Event name
                  </label>

                  <input
                    value={
                      form.event_name
                    }
                    placeholder="e.g. AI Engineering Workshop"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_name:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field full">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    placeholder="Describe the event..."
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Event type
                  </label>

                  <select
                    value={
                      form.event_type
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_type:
                          e.target.value,
                      })
                    }
                  >

                    <option>
                      Workshop
                    </option>

                    <option>
                      Seminar
                    </option>

                    <option>
                      Hackathon
                    </option>

                    <option>
                      Conference
                    </option>

                    <option>
                      Exhibition
                    </option>

                    <option>
                      Webinar
                    </option>

                  </select>

                </div>

                <div className="field">

                  <label>
                    Venue
                  </label>

                  <input
                    value={
                      form.venue
                    }
                    placeholder="Innovation Hall"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        venue:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.event_date
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_date:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      form.maximum_capacity
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maximum_capacity:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Start time
                  </label>

                  <input
                    type="time"
                    value={
                      form.start_time
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_time:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    End time
                  </label>

                  <input
                    type="time"
                    value={
                      form.end_time
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_time:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="field full">

                  <label>
                    Online meeting link
                  </label>

                  <input
                    type="url"
                    value={
                      form.online_link
                    }
                    placeholder="https://..."
                    onChange={(e) =>
                      setForm({
                        ...form,
                        online_link:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field full">

                  <label>
                    Registration deadline
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.registration_deadline
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        registration_deadline:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              <button
                className="primary full-width"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Event →"}
              </button>

            </form>

            {/* RIGHT MANAGEMENT COLUMN */}

            <div className="management-right">

              {/* ANNOUNCEMENT */}

              {selected && (

                <form
                  className="card management-card"
                  onSubmit={announce}
                >

                  <div className="card-title">

                    <span className="title-icon">
                      📢
                    </span>

                    <div>

                      <h3>
                        Publish Announcement
                      </h3>

                      <p>
                        Notify participants about
                        important updates.
                      </p>

                    </div>

                  </div>

                  <div className="field">

                    <label>
                      Title
                    </label>

                    <input
                      value={
                        announcement.title
                      }
                      placeholder="Important event update"
                      onChange={(e) =>
                        setAnnouncement({
                          ...announcement,
                          title:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>

                  <div className="field">

                    <label>
                      Message
                    </label>

                    <textarea
                      value={
                        announcement.message
                      }
                      placeholder="Write your announcement..."
                      onChange={(e) =>
                        setAnnouncement({
                          ...announcement,
                          message:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>

                  <button className="primary">
                    Publish Announcement →
                  </button>

                </form>

              )}

              {/* NOTIFICATIONS */}

              <section className="card notifications-card">

                <div className="card-title">

                  <span className="title-icon">
                    🔔
                  </span>

                  <div>

                    <h3>
                      Notifications
                    </h3>

                    <p>
                      Recent platform activity.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="secondary small-button"
                    onClick={loadNotes}
                  >
                    Load
                  </button>

                </div>

                <div className="notifications-list">

                  {notes.length === 0 ? (

                    <div className="empty-notifications">
                      No notifications loaded.
                    </div>

                  ) : (

                    notes.map((n) => (

                      <div
                        className="notification-item"
                        key={n.id}
                      >

                        <span>
                          ●
                        </span>

                        <div>

                          <strong>
                            {n.type}
                          </strong>

                          <p>
                            {n.message}
                          </p>

                        </div>

                      </div>

                    ))

                  )}

                </div>

              </section>

            </div>

          </div>

        </section>

      )}

      {/* FOOTER */}

      <footer className="app-footer">

        <span>
          Cloud Event Hub
        </span>

        <span>
          Real-time event management ·
          FastAPI · React · PostgreSQL ·
          WebSocket
        </span>

      </footer>

    </main>
  );
}