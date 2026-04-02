import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import ThemeToggle from "../components/shared/ThemeToggle";
import { Bug, Eye, EyeOff } from "lucide-react";

const ROLE_REDIRECTS = {
  ADMIN: "/admin",
  DEVELOPER: "/developer",
  TESTER: "/tester",
};


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      const user = res.data;

      // store full object (needed for role, id, token)
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.accessToken);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("status", "ACTIVE");

      navigate(ROLE_REDIRECTS[user.role] || "/bugs");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";

      if (msg === "Account not verified") {
        navigate("/verify-otp", { state: { email: form.email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex transition-colors duration-300">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-50 dark:bg-zinc-900 flex-col justify-between p-12 relative overflow-hidden border-r border-zinc-200 dark:border-zinc-800">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #60a5fa 0%, transparent 40%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Bug size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-zinc-900 dark:text-white">
              BugTracker
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display font-bold text-5xl text-zinc-900 dark:text-white leading-tight mb-4">
            Track every
            <br />
            bug. Ship with
            <br />
            confidence.
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            Role-based bug tracking for modern teams.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-zinc-500 text-sm">
          <span>⚡ Real-time</span>
          <span>🔐 Role-based</span>
          <span>🎯 Priority filters</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Bug size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-zinc-900 dark:text-white">BugTracker</span>
          </div>

          <h2 className="font-display font-bold text-3xl mb-1">Welcome back</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
            Sign in to your workspace
          </p>


          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-4 py-3 rounded-xl text-sm border border-brand-200 dark:border-brand-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm">
            <Link to="/forgot-password" className="text-brand-500">
              Forgot password?
            </Link>
          </div>

          <p className="text-center mt-6 text-sm">
            New to BugTracker?{" "}
            <Link to="/register" className="text-brand-500 font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
