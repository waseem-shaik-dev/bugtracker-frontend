import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Code2, Bug, ArrowRight, Loader2, KeyRound,
  Sparkles, CheckCircle2, Layers, Cpu, Mail, Globe, Share2
} from "lucide-react";
import ThemeToggle from "../shared/ThemeToggle";
import { DEMO_CREDENTIALS, performDemoLogin } from "../../utils/demoMode";

// Custom SVG Icons for GitHub and LinkedIn to avoid lucide version mismatches
const GithubIcon = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export default function DemoLanding({ onShowManualLogin }) {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState("");

  const handleDemoLogin = async (roleKey) => {
    setError("");
    setLoadingRole(roleKey);
    try {
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
      borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
      btnClass: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/25",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">

      {/* ── Background Gradients ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/15 dark:bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/15 rounded-full blur-[120px]" />
        {/* Grid dot pattern — subtle in light, more visible in dark */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] opacity-20 dark:opacity-25" />
      </div>

      {/* ── Header Bar ── */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bug className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              BugTracker
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 backdrop-blur-md">
              Demo Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {onShowManualLogin && (
            <button
              onClick={onShowManualLogin}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md transition-all"
            >
              <KeyRound size={14} />
              Manual Login
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-300 mb-6 backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="text-blue-500 dark:text-blue-400 animate-pulse" />
            <span>Interactive Demo Experience</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Explore{" "}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
              BugTracker
            </span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Experience a complete role-based bug tracking platform built with Spring Boot, React, PostgreSQL and JWT Authentication.
          </p>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* 3 Role Cards */}
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
                className={`group relative rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-xl shadow-sm hover:shadow-xl ${card.borderHover}`}
              >
                {/* Card Hover Glow */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Icon + Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-slate-700 dark:text-white" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${card.badgeClass}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-3 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    {card.description}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => handleDemoLogin(card.key)}
                    disabled={isAnyLoading}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${card.btnClass} ${isAnyLoading && !isLoading ? "opacity-40 cursor-not-allowed" : ""}`}
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

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-slate-400 dark:text-slate-500 text-xs font-medium"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">Spring Boot + JWT Auth</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400">PostgreSQL Database</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-indigo-500" />
            <span className="text-slate-600 dark:text-slate-400">Role-Based Access Control</span>
          </div>
        </motion.div>
      </main>

      {/* ── Footer — Credits & Contact ── */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-slate-800/70 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Left — Branding */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Crafted &amp; Designed by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent font-bold">
                Shaik Waseem
              </span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Full-Stack Developer · Open to opportunities
            </p>
          </div>

          {/* Right — Contact Links */}
          <div className="flex items-center gap-3">
            {/* GitHub */}
            <a
              href="https://github.com/waseem-shaik-dev"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub — waseem-shaik-dev"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-slate-700 dark:hover:text-white transition-all duration-200 shadow-sm"
            >
              <GithubIcon size={15} className="flex-shrink-0" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/waseem-shaik-75a064357/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn — Waseem Shaik"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] dark:hover:bg-[#0A66C2] dark:hover:text-white transition-all duration-200 shadow-sm"
            >
              <LinkedinIcon size={15} className="flex-shrink-0" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>

            {/* Gmail */}
            <a
              href="mailto:waseemshaikdev@gmail.com"
              title="Email — waseemshaikdev@gmail.com"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-500 dark:hover:text-white transition-all duration-200 shadow-sm"
            >
              <Mail size={15} className="flex-shrink-0" />
              <span className="hidden sm:inline">Email</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
