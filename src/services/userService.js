import api from "../api/axiosConfig";

// ---------- CRUD ----------
export const getAllUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data, specialKey) => {
  const url = specialKey ? `/users/${id}?specialKey=${specialKey}` : `/users/${id}`;
  return api.put(url, data);
};
export const deleteUser = (id, specialKey) => {
  const url = specialKey ? `/users/${id}?specialKey=${specialKey}` : `/users/${id}`;
  return api.delete(url);
};

// ---------- By Role ----------
export const getAdmins = () => api.get("/users/admins");
export const getDevelopers = () => api.get("/users/developers");
export const getTesters = () => api.get("/users/testers");
export const getUsersByRole = (role) => api.get(`/users/role/${role}`);

// ---------- By Project ----------
export const getUsersByProject = (projectId) => api.get(`/users/project/${projectId}`);
export const getUnassignedUsersForProject = (projectId) => api.get(`/users/unassigned/project/${projectId}`);

// ---------- Project Assignments ----------
export const assignProjects = (userId, projectIds) => api.post(`/users/${userId}/projects`, projectIds);
export const removeProjects = (userId, projectIds) => api.delete(`/users/${userId}/projects`, { data: projectIds });
export const assignProject = (userId, projectId) => api.post(`/users/${userId}/projects/${projectId}`);
export const removeProject = (userId, projectId) => api.delete(`/users/${userId}/projects/${projectId}`);

// ---------- IDs ----------
export const getUserProjectIds = (userId) => api.get(`/users/${userId}/project-ids`);
export const getCreatedBugIds = (userId) => api.get(`/users/${userId}/created-bug-ids`);
export const getAssignedBugIds = (userId) => api.get(`/users/${userId}/assigned-bug-ids`);
