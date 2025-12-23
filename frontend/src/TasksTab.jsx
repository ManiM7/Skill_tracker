import { useState, useMemo } from "react";

const API_BASE = "http://localhost:5000";
const STORAGE_TOKEN = "task_skill_token";

// 🔹 Helper – same idea as in Dashboard.jsx
function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_TOKEN);
  const base = { "Content-Type": "application/json" };
  if (!token) return base;
  return {
    ...base,
    Authorization: `Bearer ${token}`,
  };
}

function TasksTab({ tasks, user, onChanged }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueCategories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category || "Other"))),
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const isDone = t.status === "done";
        const isPending = !isDone;

        const matchCategory =
          categoryFilter === "all" || t.category === categoryFilter;

        let matchStatus = true;
        if (statusFilter === "pending") {
          matchStatus = isPending;
        } else if (statusFilter === "completed") {
          matchStatus = isDone;
        }
        return matchCategory && matchStatus;
      }),
    [tasks, categoryFilter, statusFilter]
  );

  async function handleToggleStatus(task) {
    const isDone = task.status === "done";
    const newStatus = isDone ? "todo" : "done";

    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error updating task status");
        return;
      }

      if (onChanged) onChanged();
    } catch (err) {
      console.error("Error updating status", err);
      alert("Server error updating task status");
    }
  }

  async function handleDeleteTask(task) {
    const sure = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );
    if (!sure) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(), // no need for body
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Error deleting task");
        return;
      }

      if (onChanged) onChanged();
    } catch (err) {
      console.error("Error deleting task", err);
      alert("Server error deleting task");
    }
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header-row">
        <div>
          <h2 className="dash-card-title">Task List</h2>
          <p className="dash-card-subtitle">
            View and manage all your tasks
          </p>
        </div>
      </div>

      <div className="dash-filters-row">
        <div className="dash-filter-group">
          <label className="dash-filter-label">Filter by Category</label>
          <select
            className="dash-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-filter-group">
          <label className="dash-filter-label">Filter by Status</label>
          <select
            className="dash-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending / To Do</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="dash-empty-wrapper">
          <p className="dash-empty-text">
            No tasks found matching your filters.
          </p>
        </div>
      ) : (
        <div className="task-list-container">
          <ul className="task-list">
            {filteredTasks.map((t) => {
              const isDone = t.status === "done";
              return (
                <li key={t.id} className="task-row">
                  <div className="task-row-left">
                    <span
                      className={
                        "task-status-icon " +
                        (isDone ? "task-status-icon--done" : "")
                      }
                      title={
                        isDone
                          ? "Click to mark as pending"
                          : "Click to mark as completed"
                      }
                      onClick={() => handleToggleStatus(t)}
                    >
                      {isDone ? "✓" : "•"}
                    </span>

                    <div className="task-text">
                      <p
                        className={
                          "task-title " +
                          (isDone ? "task-title--completed" : "")
                        }
                      >
                        {t.title}
                      </p>

                      <div className="task-tags">
                        <span className="task-pill task-pill-category">
                          {t.category}
                        </span>
                        <span
                          className={
                            "task-pill task-pill-status " +
                            (isDone
                              ? "task-pill-status--completed"
                              : "task-pill-status--pending")
                          }
                        >
                          {isDone ? "completed" : "pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="task-row-actions">
                    <button
                      type="button"
                      className="task-icon-btn task-icon-btn--danger"
                      title="Delete task"
                      onClick={() => handleDeleteTask(t)}
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TasksTab;
