// =============================
// FILE: src/pages/ReportBug.jsx (UPDATED)
// =============================
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function ReportBug() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "HIGH",
    projectId: "",
    assignedToUserId: "",
  });

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data));
  }, []);

  const onProjectChange = (id) => {
    setForm({ ...form, projectId: id });
    api.get(`/users/project/${id}`).then((r) => setUsers(r.data));
  };

  const submit = async () => {
    const creatorId = JSON.parse(localStorage.getItem("user")).userId;
    await api.post(`/bugs?creatorId=${creatorId}`, form);
    alert("Bug reported");
  };

  return (
    <div className="p-6">
      <h2 className="font-bold mb-4">Report Bug</h2>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <select onChange={(e) => onProjectChange(e.target.value)}>
        <option>Select project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        disabled={!form.projectId}
        onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
      >
        <option>Assign developer</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <button onClick={submit} className="btn-primary mt-2">
        Submit
      </button>
    </div>
  );
}
