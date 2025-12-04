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

const API_BASE = "http://localhost:5000";
const PIE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899"];

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState([]);

  async function loadTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { "X-User-Id": user.id },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        return;
      }
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks", err);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleNewTask() {
    const title = window.prompt("Task title (e.g. React practice)");
    if (!title) return;

    const category =
      window.prompt("Skill / Category (e.g. React, Java, DSA)") || "General";

    
      const status = "todo";

try {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": user.id,
    },
    body: JSON.stringify({ title, category, status }),
  });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error creating task");
        return;
      }
      loadTasks();
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Error adding task", err);
    }
  }

  function handleManageCategories() {
    alert("Manage Categories page coming soon!");
  }

  // ====== Stats ======
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ====== Chart data by category ======
  const categoryMap = {};
  tasks.forEach((t) => {
    const cat = t.category || "Other";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, completed: 0, pending: 0, total: 0 };
    }
    categoryMap[cat].total += 1;
    if (t.status === "done") {
      categoryMap[cat].completed += 1;
    } else {
      categoryMap[cat].pending += 1;
    }
  });

  const skillChartData = Object.values(categoryMap);
  const pieData = skillChartData.map((c) => ({
    name: c.category,
    value: c.total,
  }));

  return (
    <div className="dash-root">
      <div className="dash-container">
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Task &amp; Skill Tracker</h1>
            <p className="dash-subtitle">
              Welcome back,{" "}
              <span className="dash-username">{user.username}</span>!
            </p>
          </div>
          <div className="dash-header-actions">
            
            <button
              type="button"
              className="secondary-btn"
              onClick={onLogout}
            >
              ↩&nbsp; Logout
            </button>
          </div>
        </header>


        <div className="dash-tabs-row">
          <button
            type="button"
            className={`dash-tab-btn ${
              activeTab === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${
              activeTab === "tasks" ? "active" : ""
            }`}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </button>
        </div>


        <div className="dash-top-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={handleNewTask}
          >
            <span className="primary-btn-icon">+</span> New Task
          </button>
        </div>

        <main className="dash-main">
          {activeTab === "dashboard" ? (
            <>

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

              <div className="dash-card dash-charts-row">
                <div className="dash-chart">
                  <h3 className="dash-chart-title">
                    Tasks by Skill Category
                  </h3>
                  <p className="dash-chart-subtitle">
                    Comparison of completed vs pending tasks
                  </p>

                  {skillChartData.length === 0 ? (
                    <p className="dash-empty-text">
                      No tasks yet. Create your first task to see this chart.
                    </p>
                  ) : (
                    <div className="dash-chart-inner">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={skillChartData}>
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="completed"
                            name="Completed"
                            fill="#22c55e"
                          />
                          <Bar
                            dataKey="pending"
                            name="Pending"
                            fill="#f97316"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                <div className="dash-chart">
                  <h3 className="dash-chart-title">Task Distribution</h3>
                  <p className="dash-chart-subtitle">
                    Total tasks per skill category
                  </p>

                  {pieData.length === 0 ? (
                    <p className="dash-empty-text">
                      No tasks yet. Create your first task to see this chart.
                    </p>
                  ) : (
                    <div className="dash-chart-inner dash-chart-inner--pie">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label={(entry) =>
                              `${entry.name}: ${entry.value}`
                            }
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${entry.name}`}
                                fill={
                                  PIE_COLORS[index % PIE_COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <TasksTab tasks={tasks}  user={user} onChanged={loadTasks}  />
          )}
        </main>
      </div>
    </div>
  );

}
export default Dashboard;
