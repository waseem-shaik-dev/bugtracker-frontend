import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Admin layout + pages
import AdminLayout from "./layouts/AdminLayout";
import TesterLayout from "./layouts/TesterLayout";
import DeveloperLayout from "./layouts/DeveloperLayout";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardDeveloper from "./pages/DashboardDeveloper";
import DeveloperBugsPage from "./pages/developer/DeveloperBugsPage";
import DeveloperProjectsPage from "./pages/developer/DeveloperProjectsPage";
import DashboardTester from "./pages/tester/DashboardTester";
import TesterBugsPage from "./pages/tester/TesterBugsPage";
import UsersPage from "./pages/admin/UsersPage";
import ProjectsPage from "./pages/admin/Projectspage";
import BugsPage from "./pages/admin/BugsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Protected: Developer (nested inside DeveloperLayout) ── */}
        <Route
          path="/developer"
          element={
            <ProtectedRoute allowedRoles={["DEVELOPER"]}>
              <DeveloperLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardDeveloper />} />
          <Route path="projects" element={<DeveloperProjectsPage />} />
          <Route path="bugs" element={<DeveloperBugsPage />} />
        </Route>

        {/* ── Protected: Tester (nested inside TesterLayout) ── */}
        <Route
          path="/tester"
          element={
            <ProtectedRoute allowedRoles={["TESTER"]}>
              <TesterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardTester />} />
          <Route path="bugs" element={<TesterBugsPage />} />
        </Route>

        <Route
          path="/my-bugs"
          element={<Navigate to="/developer/bugs" replace />}
        />

        {/* ── Protected: Admin (nested inside AdminLayout) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="bugs" element={<BugsPage />} />
          {/* Legacy redirect */}
          <Route path="assign" element={<Navigate to="/admin/projects" replace />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
