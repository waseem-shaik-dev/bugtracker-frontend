import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import ThemeToggle from "../components/shared/ThemeToggle";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(90);
  const [showOtp, setShowOtp] = useState(false);



  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/verify-otp", { email, otp });
      setSuccess("Account verified successfully. Please login.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post(`/auth/resend-otp?email=${email}`);
      setTimer(90);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
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

      {success ? (
        <div className="w-full max-w-sm flex flex-col items-center justify-center p-8 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-2">Verified!</h2>
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 font-medium">{success}</p>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-display font-bold text-center text-zinc-900 dark:text-white mb-2">Verify your email</h2>
          <p className="text-sm text-center text-zinc-500 mb-6">
            OTP sent to <b>{email}</b>. Valid for 5 minutes.
          </p>

          <form onSubmit={verifyOtp} className="space-y-4">
          <div className="relative">
            <input
              value={otp}
              type={showOtp ? "text" : "password"}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="input pr-10 text-center tracking-widest"
              maxLength={6}
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

            {error && <div className="text-brand-600 dark:text-brand-400 text-sm font-medium">{error}</div>}

            <button disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
          </form>

          <div className="text-center text-sm mt-4">
            {timer > 0 ? (
              <span className="text-zinc-500">Resend in {formatTime(timer)}</span>
            ) : (
              <button onClick={resendOtp} className="text-brand-500 font-medium hover:text-brand-600">
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
