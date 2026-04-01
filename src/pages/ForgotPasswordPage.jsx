import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import ThemeToggle from "../components/shared/ThemeToggle";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      await api.post(`/auth/forgot-password?email=${email}`);
      setMsg("OTP sent to your email");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Request failed");
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
          <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 font-medium">{msg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-display font-bold text-center text-zinc-900 dark:text-white mb-2">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

          {error && <div className="text-brand-600 dark:text-brand-400 text-sm font-medium">{error}</div>}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>
      )}
    </div>
  );
}
