import api from "../api/axiosConfig";

// ---------- CRUD ----------
export const getAllBugs = () => api.get("/bugs");
export const getBugById = (id) => api.get(`/bugs/${id}`);
export const createBug = (creatorId, data) => api.post(`/bugs?creatorId=${creatorId}`, data);
export const updateBug = (id, data) => api.put(`/bugs/${id}`, data);
export const deleteBug = (id) => api.delete(`/bugs/${id}`);

// ---------- Filtered GET (backend) ----------
export const getBugsByStatus = (status) => api.get(`/bugs/status/${status}`);
export const getBugsByPriority = (priority) => api.get(`/bugs/priority/${priority}`);
export const getBugsByProject = (projectId) => api.get(`/bugs/project/${projectId}`);
export const getBugsByDeveloper = (userId) => api.get(`/bugs/developer/${userId}`);
export const getBugsByCreator = (userId) => api.get(`/bugs/creator/${userId}`);
export const getRecentBugs = () => api.get("/bugs/recent");

// ---------- Detailed (nested DTOs) ----------
export const getDetailedBugs = () => api.get("/bugs/detailed");
export const getDetailedBugsByProject = (projectId) => api.get(`/bugs/detailed/project/${projectId}`);
export const getDetailedBugsByDeveloper = (userId) => api.get(`/bugs/detailed/developer/${userId}`);
export const getDetailedBugsByCreator = (userId) => api.get(`/bugs/detailed/creator/${userId}`);
export const getDetailedBugById = (id) => api.get(`/bugs/${id}`);

// ---------- Status / Priority Updates ----------
export const updateBugStatus = (bugId, status) => api.put("/bugs/status", { bugId, status });
export const updateBugPriority = (bugId, priority) => api.put(`/bugs/${bugId}/priority?priority=${priority}`);
export const bulkUpdateStatus = (bugIds, status) => api.put(`/bugs/bulk/status?status=${status}`, bugIds);

// ---------- Assignment ----------
export const assignBug = (bugId, developerId) => api.post("/bugs/assign", { bugId, developerId });
export const reassignBug = (bugId, developerId) => api.put(`/bugs/${bugId}/reassign/${developerId}`);
export const unassignBug = (bugId) => api.put(`/bugs/${bugId}/unassign`);
export const bulkAssignBugs = (bugIds, developerId) => api.post(`/bugs/bulk/assign?developerId=${developerId}`, bugIds);

// ---------- Filter ----------
export const filterBugs = (params, filterBody) =>
  api.post(`/bugs/filter?page=${params.page}&size=${params.size}&sortBy=${params.sortBy || "createdAt"}&direction=${params.direction || "DESC"}`, filterBody);
