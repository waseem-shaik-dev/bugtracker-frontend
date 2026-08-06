import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Code2, Bug, ArrowRight, Loader2, KeyRound, Sparkles, CheckCircle2, Layers, Cpu } from "lucide-react";
import ThemeToggle from "../shared/ThemeToggle";
import { DEMO_CREDENTIALS, performDemoLogin } from "../../utils/demoMode";

export default function DemoLanding({ onShowManualLogin }) {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState("");

  const handleDemoLogin = async (roleKey) => {
    setError("");
    setLoadingRole(roleKey);

    try {
      // Minimum duration for smooth "Preparing Demo..." animation
      const [result] = await Promise.all([
        performDemoLogin(roleKey),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      navigate(result.redirect);
    } catch (err) {
      console.error("Demo login failed", err);
      setError(err.response?.data?.error || "Failed to start demo session. Please try again.");
      setLoadingRole(null);
    }
  };

  const cards = [
    {
      key: "ADMIN",
      title: DEMO_CREDENTIALS.ADMIN.title,
      description: DEMO_CREDENTIALS.ADMIN.description,
      buttonText: "Explore as Admin",
      icon: ShieldCheck,
      badge: "Full Control",
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      accentColor: "blue",
      borderHover: "hover:border-blue-500/50 hover:shadow-blue-500/10",
      btnClass: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      key: "DEVELOPER",
      title: DEMO_CREDENTIALS.DEVELOPER.title,
      description: DEMO_CREDENTIALS.DEVELOPER.description,
      buttonText: "Explore as Developer",
      icon: Code2,
      badge: "Issue Resolution",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      accentColor: "emerald",
      borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      key: "TESTER",
      title: DEMO_CREDENTIALS.TESTER.title,
      description: DEMO_CREDENTIALS.TESTER.description,
      buttonText: "Explore as Tester",
      icon: Bug,
      badge: "Bug Reporting",
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      accentColor: "amber",
      borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
      btnClass: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/25",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Gradients & Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
      </div>

      {/* Header Bar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bug className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-xl tracking-tight text-white">
              BugTracker
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md">
              Demo Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {onShowManualLogin && (
            <button
              onClick={onShowManualLogin}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 backdrop-blur-md transition-all"
            >
              <KeyRound size={14} />
              Manual Login
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 mb-6 backdrop-blur-md shadow-inner">
            <Sparkles size={14} className="text-blue-400 animate-pulse" />
            <span>Interactive Demo Experience</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6">
            Explore <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">BugTracker</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Experience a complete role-based bug tracking platform built with Spring Boot, React, PostgreSQL and JWT Authentication.
          </p>
        </motion.div>

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto w-full">
          {cards.map((card, idx) => {
            const IconComponent = card.icon;
            const isLoading = loadingRole === card.key;
            const isAnyLoading = loadingRole !== null;

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-xl ${card.borderHover}`}
              >
                {/* Card Top Accent Glow */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${card.badgeClass}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-bold text-2xl text-white mb-3 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="relative z-10 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => handleDemoLogin(card.key)}
                    disabled={isAnyLoading}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                      card.btnClass
                    } ${
                      isAnyLoading && !isLoading ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Preparing Demo...</span>
                      </>
                    ) : (
                      <>
                        <span>{card.buttonText}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Highlights Footer Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-xs font-medium"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Spring Boot + JWT Auth</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-blue-400" />
            <span>PostgreSQL Database</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-indigo-400" />
            <span>Role-Based Access Control</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        BugTracker Demo Environment • Explore without credential entry
      </footer>
    </div>
  );
}
