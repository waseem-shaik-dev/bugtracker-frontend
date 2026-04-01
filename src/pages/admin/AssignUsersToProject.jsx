// =============================
// FILE: src/pages/admin/AssignUsersToProject.jsx
// =============================
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function AssignUsersToProject() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data));
  }, []);

  const loadUsers = (id) => {
    setProjectId(id);
    api.get(`/users/unassigned/project/${id}`).then((r) => setUsers(r.data));
  };

  const assign = async () => {
    await api.post(`/projects/${projectId}/users`, selected);
    alert("Assigned");
  };

  return (
    <div className="p-6">
      <h2 className="font-bold mb-4">Assign Users to Project</h2>

      <select onChange={(e) => loadUsers(e.target.value)}>
        <option>Select project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="mt-4">
        {users.map((u) => (
          <label key={u.id} className="block">
            <input
              type="checkbox"
              value={u.id}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelected((prev) =>
                  e.target.checked
                    ? [...prev, val]
                    : prev.filter((i) => i !== val),
                );
              }}
            />
            {u.name}
          </label>
        ))}
      </div>

      <button onClick={assign} className="btn-primary mt-3">
        Assign Selected
      </button>
    </div>
  );
}
