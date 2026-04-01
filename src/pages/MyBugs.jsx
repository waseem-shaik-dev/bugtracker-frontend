import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BugTable from "../components/BugTable";
import api from "../api/axiosConfig";

export default function MyBugs() {
  const userId = JSON.parse(localStorage.getItem("user"))?.userId;
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/bugs/detailed/developer/${userId}`)
      .then((res) => setBugs(res.data))
      .catch((err) => console.error(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleStatusUpdate = (bugId, newStatus) => {
    setBugs((prev) =>
      prev.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)),
    );
  };

  const open = bugs.filter((b) => b.status === "OPEN").length;
  const inProgress = bugs.filter((b) => b.status === "IN_PROGRESS").length;
  const resolved = bugs.filter((b) => b.status === "RESOLVED").length;
  const critical = bugs.filter((b) => b.priority === "CRITICAL").length;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 animate-fade-up">
          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-zinc-100">
            My Bugs
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Bugs assigned to you — update their status as you work
          </p>
        </div>

        {/* Quick stats */}
        <div
          className="flex gap-3 mb-6 flex-wrap animate-fade-up stagger-1 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          {[
            {
              label: "Open",
              value: open,
              bg: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
            },
            {
              label: "In Progress",
              value: inProgress,
              bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
            },
            {
              label: "Resolved",
              value: resolved,
              bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
            },
            {
              label: "Critical",
              value: critical,
              bg: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${s.bg}`}
            >
              <span className="font-display font-bold text-xl">{s.value}</span>
              <span className="font-medium opacity-80">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          className="card overflow-hidden animate-fade-up stagger-2 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              Assigned to Me
            </h2>
            <span className="text-xs font-mono text-zinc-400">
              {bugs.length} bugs
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-400">
              <span className="animate-spin text-2xl mr-3">⟳</span> Loading your
              bugs…
            </div>
          ) : (
            <BugTable
              bugs={bugs}
              onStatusUpdate={handleStatusUpdate}
              showActions={true}
            />
          )}
        </div>
      </main>
    </div>
  );
}
