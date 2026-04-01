import api from "../api/axiosConfig";

export const getDashboard = () => api.get("/dashboard");
export const getUserDashboard = (userId) => api.get(`/dashboard/user/${userId}`);
export const getProjectDashboard = (projectId) => api.get(`/dashboard/project/${projectId}`);
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getRecentBugs = () => api.get("/bugs/recent");
