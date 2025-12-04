import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";

const API_BASE = "http://localhost:5000";
const STORAGE_KEY = "task_skill_user";

function App() {
  const [mode, setMode] = useState("login"); // 
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); 

  // 🔹 Load user from localStorage on first render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error("Error reading stored user", err);
    }
  }, []);


  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

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
        setUser(data);
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
        setUser(data);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
    }
  }

  function handleLogout() {
    setUser(null);
    setPassword("");
    setMessage("Logged out");
    setMode("login");
    localStorage.removeItem(STORAGE_KEY); 
  }

  // If logged in → show dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Otherwise show authe card
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
                placeholder="johndoe"
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
              placeholder="you@example.com"
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
              placeholder="********"
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
          <p
            style={{
              textAlign: "center",
              marginTop: "12px",
              color: "#4b5563",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
