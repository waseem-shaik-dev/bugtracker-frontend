import api from "../api/axiosConfig";

// ---------- CRUD ----------
export const getAllProjects = () => api.get("/projects");
export const getDetailedProjects = () => api.get("/projects/detailed");
export const getDetailedProjectById = (id) => api.get(`/projects/${id}`);
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (adminId, data) => api.post(`/projects?adminId=${adminId}`, data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ---------- Search / Filter ----------
export const searchProjects = (keyword) => api.get(`/projects/search?keyword=${encodeURIComponent(keyword)}`);
export const getProjectsByName = (name) => api.get(`/projects/name?name=${encodeURIComponent(name)}`);
export const getProjectsContaining = (keyword) => api.get(`/projects/contains?keyword=${encodeURIComponent(keyword)}`);
export const getProjectsWithNoUsers = () => api.get("/projects/no-users");
export const getProjectsWithNoBugs = () => api.get("/projects/no-bugs");

// ---------- By Entity ----------
export const getProjectsByUser = (userId) => api.get(`/projects/user/${userId}`);
export const getProjectsByAdmin = (adminId) => api.get(`/projects/admin/${adminId}`);
export const getUnassignedProjectsForUser = (userId) => api.get(`/projects/unassigned/user/${userId}`);

// ---------- User Assignments ----------
export const assignUsersToProject = (projectId, userIds) => api.post(`/projects/${projectId}/users`, userIds);
export const removeUsersFromProject = (projectId, userIds) => api.delete(`/projects/${projectId}/users`, { data: userIds });
export const addUserToProject = (projectId, userId) => api.post(`/projects/${projectId}/user/${userId}`);
export const removeUserFromProject = (projectId, userId) => api.delete(`/projects/${projectId}/user/${userId}`);

// ---------- IDs ----------
export const getProjectUserIds = (projectId) => api.get(`/projects/${projectId}/user-ids`);
export const getProjectBugIds = (projectId) => api.get(`/projects/${projectId}/bug-ids`);
