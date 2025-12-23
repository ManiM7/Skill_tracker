// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "http://localhost:5000";
// const STORAGE_TOKEN = "task_skill_token";

// function NewTaskPage() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [error, setError] = useState("");

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     if (!title || !category) {
//       setError("All fields required");
//       return;
//     }

//     const res = await fetch(`${API_BASE}/tasks`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem(STORAGE_TOKEN)}`
//       },
//       body: JSON.stringify({
//         title,
//         category,
//         status: "todo"
//       })
//     });

//     if (!res.ok) {
//       setError("Failed to create task");
//       return;
//     }

//     navigate("/"); // back to dashboard
//   }

//   return (
//     <div className="page-center">
//       <form className="task-form" onSubmit={handleSubmit}>
//         <h2>Create New Task</h2>

//         <input
//           placeholder="Task title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         <input
//           placeholder="Skill category"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         />

//         {error && <p>{error}</p>}

//         <button type="submit">Create</button>
//         <button type="button" onClick={() => navigate("/")}>
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// }

// export default NewTaskPage;
