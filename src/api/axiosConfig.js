import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Add Authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // // Automatically attach userId to bug GET requests if not already present
  // const userId = JSON.parse(localStorage.getItem("user"))?.userId;
  // if (
  //   userId &&
  //   config.method === "get" &&
  //   config.url?.startsWith("/bugs") &&
  //   !config.url.includes("assignedToUserId")
  // ) {
  //   config.url += config.url.includes("?")
  //     ? `&assignedToUserId=${userId}`
  //     : `?assignedToUserId=${userId}`;
  // }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);

export default api;
