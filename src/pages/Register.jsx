import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import ThemeToggle from "../components/shared/ThemeToggle";
import { ArrowLeft, Bug, Eye, EyeOff } from "lucide-react";


export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DEVELOPER",
  });
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
      await api.post("/auth/register", form);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white dark:bg-zinc-950 relative transition-colors duration-300">
      <div className="absolute top-6 left-6">
        <button onClick={() => navigate(-1)} className="btn-ghost text-zinc-500 dark:text-zinc-400">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-xl shadow-brand-600/30 mb-4">
            <Bug size={24} className="text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-center text-zinc-900 dark:text-white mb-2">Create Account</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">
            Get started with BugTracker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full name"
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="input"
            required
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className="input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <div className="text-brand-600 dark:text-brand-400 text-sm font-medium">{error}</div>}

          <button className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-brand-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
