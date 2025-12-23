import { useState } from "react";

const API_BASE = "http://localhost:5000";
const STORAGE_TOKEN = "task_skill_token";

function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_TOKEN);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function NewTaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if(!category){
      setError("please select a skill category");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(), 
        body: JSON.stringify({
          title,
          category,
          status: "todo",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Server error");
        return;
      }

      onCreated();   // reload tasks
      onClose();     // close modal
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p className="modal-subtitle">
          Add a new task to track your progress.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Task Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your task"
          />

          <label>Skill Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>
              Select category
            </option>
            <option>React</option>
            <option>Python</option>
            <option>DSA</option>
            <option>DB</option>
          </select>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;
