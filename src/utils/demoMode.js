import api from "../api/axiosConfig";

/**
 * Utility to check if Demo Mode is enabled via environment variable
 */
export const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === "true";
};

/**
 * Demo user credentials definition (kept centralized for maintainability)
 */
export const DEMO_CREDENTIALS = {
  ADMIN: {
    email: "admin@gmail.com",
    password: "@Admin001",
    role: "ADMIN",
    title: "Admin",
    description:
      "Explore administrative capabilities including user management, project management, dashboards, and bug assignment.",
    redirect: "/admin",
    icon: "ShieldCheck",
  },
  DEVELOPER: {
    email: "user@gmail.com",
    password: "User@2026",
    role: "DEVELOPER",
    title: "Developer",
    description:
      "Experience the developer workflow by viewing assigned bugs and updating bug statuses.",
    redirect: "/developer",
    icon: "Code2",
  },
  TESTER: {
    email: "tester@gmail.com",
    password: "@Tester001",
    role: "TESTER",
    title: "Tester",
    description:
      "Report bugs, assign them within projects, and monitor bug progress.",
    redirect: "/tester",
    icon: "Bug",
  },
};

/**
 * Reusable demo authentication helper
 * Allows single point of update if demo endpoints change (e.g., /demo/login/admin)
 */
export const performDemoLogin = async (roleKey) => {
  const config = DEMO_CREDENTIALS[roleKey];
  if (!config) {
    throw new Error(`Invalid demo role: ${roleKey}`);
  }

  // Uses standard auth flow internally (or can switch to /demo/login/* in future)
  const res = await api.post("/auth/login", {
    email: config.email,
    password: config.password,
  });

  const user = res.data;

  // Store user info identically to standard login flow
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.accessToken);
  localStorage.setItem("role", user.role);
  localStorage.setItem("name", user.name);
  localStorage.setItem("userId", user.userId);
  localStorage.setItem("status", "ACTIVE");

  return { user, redirect: config.redirect };
};
