import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const status = localStorage.getItem("status");

  if (!token || status !== "ACTIVE") {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const dashMap = {
      ADMIN: "/admin",
      DEVELOPER: "/developer",
      TESTER: "/tester",
    };
    return <Navigate to={dashMap[role] || "/"} replace />;
  }

  return children;
}
