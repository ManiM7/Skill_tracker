import { useState, useEffect } from "react";
import { Routes, Route } from "react"
import Dashboard from "./Dashboard";
import NewTaskModal from "./NewTaskModal";

const API_BASE = "http://localhost:5000";
const STORAGE_USER = "task_skill_user";
const STORAGE_TOKEN = "task_skill_token";

function App() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ IMPORTANT

  /* =========================
     RESTORE SESSION ON REFRESH
  ========================== */
  useEffect(() => {
  try {
    const storedUser = localStorage.getItem(STORAGE_USER);
    const token = localStorage.getItem(STORAGE_TOKEN);

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  } catch (err) {
    console.error(err);
  } finally {
    setAuthLoading(false);
  }
}, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      if (mode === "login") {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Login failed");
          return;
        }

        const { user: loggedUser, accessToken } = data;

        localStorage.setItem(STORAGE_TOKEN, accessToken);
        localStorage.setItem(STORAGE_USER, JSON.stringify(loggedUser));
        setUser(loggedUser);
        setMessage("Logged in successfully");
      } else {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Registration failed");
          return;
        }

        setMessage("Registered successfully. Please login.");
        setMode("login");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
    }
  }

  /* =========================
     LOGOUT
  ========================== */
  function handleLogout() {
    setUser(null);
    setPassword("");
    setMode("login");
    setMessage("Logged out");
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
  }

  /* =========================
     🔒 STEP 3 — BLOCK UI
  ========================== */
  if (authLoading) {
    return (
      <div className="app-root">
        <p style={{ textAlign: "center", marginTop: "40vh" }}>
          Loading...
        </p>
      </div>
    );
  }

  /* =========================
     DASHBOARD PROTECTION
  ========================== */
  const token = localStorage.getItem(STORAGE_TOKEN);
  if (user && token) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  /* =========================
     LOGIN / REGISTER UI
  ========================== */
  return (
    <div className="app-root">
      <div className="auth-card">
        <h1 className="auth-title">Task &amp; Skill Tracker</h1>
        <p className="auth-subtitle">
          Track your tasks and monitor your skill progress
        </p>

        <div className="tab-row">
          <button
            type="button"
            className={`tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {mode === "register" && (
            <div className="field">
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="submit-btn" type="submit">
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {message && (
          <p style={{ textAlign: "center", marginTop: 12 }}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default App;
