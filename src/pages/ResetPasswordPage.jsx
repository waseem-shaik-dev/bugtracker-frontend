import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import ThemeToggle from "../components/shared/ThemeToggle";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setMsg("Password reset successful. Please login.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed");
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
      {msg ? (
        <div className="w-full max-w-sm flex flex-col items-center justify-center p-8 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-2">Success!</h2>
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 font-medium">{msg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-display font-bold text-center text-zinc-900 dark:text-white mb-2">Reset Password</h2>

        <div className="relative">
          <input
            name="otp"
            type={showOtp ? "text" : "password"}
            placeholder="OTP"
            onChange={handleChange}
            className="input pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowOtp(!showOtp)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {showOtp ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <input
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="New password"
            onChange={handleChange}
            className="input pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

          {error && <div className="text-brand-600 dark:text-brand-400 text-sm font-medium">{error}</div>}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
