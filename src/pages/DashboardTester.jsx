import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import BugTable from "../components/BugTable";
import api from "../api/axiosConfig";
import { MOCK_BUGS } from "../api/mockData";

export default function DashboardTester() {
  
  const [bugs, setBugs] = useState(MOCK_BUGS);
   const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userId;
  const name = user.name || "Tester";

  useEffect(() => {
    if (!userId) return;
    api
      .get("/bugs/detailed/creator/{userId}")
      .then((r) => setBugs(r.data))
      .catch(() => {});
  }, []);

  const reported = bugs.length;
  const open = bugs.filter((b) => b.status === "OPEN").length;
  const resolved = bugs.filter(
    (b) => b.status === "RESOLVED" || b.status === "CLOSED",
  ).length;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-zinc-100">
              Tester View
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Track what you've reported
            </p>
          </div>
          <Link to="/report" className="btn-primary">
            + Report Bug
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Reported",
              value: reported,
              color: "text-zinc-900 dark:text-zinc-100",
              delay: "0.05s",
            },
            {
              label: "Open",
              value: open,
              color: "text-sky-600 dark:text-sky-400",
              delay: "0.1s",
            },
            {
              label: "Resolved",
              value: resolved,
              color: "text-emerald-600 dark:text-emerald-400",
              delay: "0.15s",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card p-5 animate-fade-up opacity-0"
              style={{ animationDelay: s.delay, animationFillMode: "forwards" }}
            >
              <p className="label">{s.label}</p>
              <p className={`font-display font-bold text-3xl mt-1 ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div
          className="card p-6 mb-6 bg-gradient-to-br from-brand-500 to-brand-700 border-0 animate-fade-up stagger-3 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <h3 className="font-display font-bold text-xl text-white mb-1">
            Found a bug?
          </h3>
          <p className="text-brand-100 text-sm mb-4">
            Report it now so developers can get on it fast.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-brand-50 transition-colors"
          >
            Report New Bug →
          </Link>
        </div>

        {/* Bug list */}
        <div
          className="card overflow-hidden animate-fade-up stagger-4 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              All Reported Bugs
            </h2>
          </div>
          <BugTable bugs={bugs} showActions={false} />
        </div>
      </main>
    </div>
  );
}
