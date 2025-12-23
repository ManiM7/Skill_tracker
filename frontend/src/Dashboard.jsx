import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import TasksTab from "./TasksTab";
import NewTaskModal from "./NewTaskModal";

const API_BASE = "http://localhost:5000";
const PIE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899"];
const STORAGE_TOKEN = "task_skill_token";


  //  Helper: JWT Authorization Header

   function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_TOKEN);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);


    //  Load Tasks

  async function loadTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to load tasks");
        return;
      }
      setTasks(data);
    } catch (err) {
      console.error(err);
      alert("Network error while loading tasks");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  /* ===============================
     Stats
  ================================ */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  /* ===============================
     Chart Data by Category
  ================================ */
  const categoryMap = {};
  tasks.forEach((t) => {
    const cat = t.category || "Other";
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        completed: 0,
        pending: 0,
        total: 0,
      };
    }
    categoryMap[cat].total += 1;
    if (t.status === "done") {
      categoryMap[cat].completed += 1;
    } else {
      categoryMap[cat].pending += 1;
    }
  });

  const barData = Object.values(categoryMap);
  const pieData = barData.map((c) => ({
    name: c.category,
    value: c.total,
  }));

  /* ===============================
     UI
  ================================ */
  return (
    <div className="dash-root">
      <div className="dash-container">
        {/* ===== Header ===== */}
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Task &amp; Skill Tracker</h1>
            <p className="dash-subtitle">
              Welcome back, <span className="dash-username">{user.username}</span>!
            </p>
          </div>

          <div className="dash-header-actions">
            <button className="secondary-btn" onClick={onLogout}>
              ↩ Logout
            </button>
          </div>
        </header>

        {/* ===== Tabs ===== */}
        <div className="dash-tabs-row">
          <button
            className={`dash-tab-btn ${
              activeTab === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`dash-tab-btn ${
              activeTab === "tasks" ? "active" : ""
            }`}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </button>
        </div>

        {/* ===== New Task Button ===== */}
        <div className="dash-top-actions">
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            <span className="primary-btn-icon">+</span> New Task
          </button>
        </div>

        {/* ===== Main ===== */}
        <main className="dash-main">
          {activeTab === "dashboard" ? (
            <>
              {/* ===== Stats ===== */}
              <div className="dash-card dash-stats-card">
                <div className="dash-stats-row">
                  <div className="dash-stat-card">
                    <p className="dash-stat-label">Total Tasks</p>
                    <p className="dash-stat-value">{totalTasks}</p>
                  </div>

                  <div className="dash-stat-card">
                    <p className="dash-stat-label">Completed</p>
                    <p className="dash-stat-value dash-stat-value--green">
                      {completedTasks}
                    </p>
                  </div>

                  <div className="dash-stat-card">
                    <p className="dash-stat-label">Pending</p>
                    <p className="dash-stat-value dash-stat-value--orange">
                      {pendingTasks}
                    </p>
                  </div>

                  <div className="dash-stat-card">
                    <p className="dash-stat-label">Completion Rate</p>
                    <p className="dash-stat-value">
                      {completionRate}
                      <span className="dash-stat-percent">%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== Charts ===== */}
              <div className="dash-card dash-charts-row">
                <div className="dash-chart">
                  <h3 className="dash-chart-title">Tasks by Skill Category</h3>
                  <p className="dash-chart-subtitle">
                    Completed vs Pending tasks
                  </p>

                  {barData.length === 0 ? (
                    <p className="dash-empty-text">
                      No tasks yet. Create your first task.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barData}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#22c55e" />
                        <Bar dataKey="pending" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="dash-chart">
                  <h3 className="dash-chart-title">Task Distribution</h3>
                  <p className="dash-chart-subtitle">
                    Total tasks per skill
                  </p>

                  {pieData.length === 0 ? (
                    <p className="dash-empty-text">
                      No tasks yet. Create your first task.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={90}
                          label
                        >
                          {pieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          ) : (
            <TasksTab tasks={tasks} user={user} onChanged={loadTasks} />
          )}
        </main>
      </div>

      {/* ===== New Task Modal ===== */}
      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onCreated={loadTasks}
        />
      )}
    </div>
  );
}

export default Dashboard;
