import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BugTable from "../components/BugTable";
import api from "../api/axiosConfig";
import { MOCK_BUGS } from "../api/mockData";

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function BugList() {
  const role = localStorage.getItem("role");
  const [bugs, setBugs] = useState(MOCK_BUGS);
  const [filtered, setFiltered] = useState(MOCK_BUGS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/bugs")
      .then((r) => {
        setBugs(r.data);
        setFiltered(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = bugs;
    if (search)
      result = result.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()),
      );
    if (status !== "ALL") result = result.filter((b) => b.status === status);
    if (priority !== "ALL")
      result = result.filter((b) => b.priority === priority);
    setFiltered(result);
  }, [search, status, priority, bugs]);

  const handleStatusUpdate = (bugId, newStatus) => {
    setBugs((prev) =>
      prev.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)),
    );
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 animate-fade-up">
          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-zinc-100">
            Bug Tracker
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            All bugs across your projects
          </p>
        </div>

        {/* Filters */}
        <div
          className="card p-4 mb-6 flex flex-wrap gap-3 items-center animate-fade-up stagger-1 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bugs…"
            className="input max-w-xs"
          />

          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${status === s ? "bg-brand-500 text-white border-brand-500" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-brand-400"}`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${priority === p ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-transparent" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"}`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-zinc-400 font-mono">
            {filtered.length} bugs
          </span>
        </div>

        {/* Table */}
        <div
          className="card overflow-hidden animate-fade-up stagger-2 opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-400">
              <span className="animate-spin text-2xl mr-3">⟳</span> Loading
              bugs…
            </div>
          ) : (
            <BugTable
              bugs={filtered}
              onStatusUpdate={handleStatusUpdate}
              showActions={role === "DEVELOPER" || role === "ADMIN"}
            />
          )}
        </div>
      </main>
    </div>
  );
}
