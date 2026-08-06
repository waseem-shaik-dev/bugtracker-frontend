// =============================
// FILE: src/components/BugTable.jsx
// =============================
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../api/axiosConfig";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function StatusBadge({ status }) {
  const cls =
    {
      OPEN: "badge-open",
      IN_PROGRESS: "badge-in_progress",
      RESOLVED: "badge-resolved",
      CLOSED: "badge-closed",
    }[status] || "badge-closed";

  const dot =
    {
      OPEN: "bg-sky-500",
      IN_PROGRESS: "bg-amber-500",
      RESOLVED: "bg-emerald-500",
      CLOSED: "bg-zinc-400",
    }[status] || "bg-zinc-400";

  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse-dot`} />
      {status?.replace("_", " ")}
    </span>
  );
}

function PriorityTag({ priority }) {
  const cls =
    {
      LOW: "priority-low",
      MEDIUM: "priority-medium",
      HIGH: "priority-high",
      CRITICAL: "priority-critical",
    }[priority] || "priority-low";

  const icons = { LOW: "▼", MEDIUM: "●", HIGH: "▲", CRITICAL: "⚠" };

  return (
    <span className={cls}>
      {icons[priority]} {priority}
    </span>
  );
}

export default function BugTable({
  bugs,
  onStatusUpdate,
  showActions = false,
  isAdmin = false,
  projectDevelopers = {},
  onAssignDeveloper,
}) {
  const [updating, setUpdating] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [openAssignDropdown, setOpenAssignDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [projectDevsMap, setProjectDevsMap] = useState({});
  const [loadingDevs, setLoadingDevs] = useState({});

  const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const isUserAdmin = isAdmin || userRole === "ADMIN";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".assign-dropdown-container") && !e.target.closest(".assign-dropdown-btn")) {
        setOpenAssignDropdown(null);
      }
      if (!e.target.closest(".status-dropdown-container") && !e.target.closest(".status-dropdown-btn")) {
        setOpenStatusDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (bugId, newStatus) => {
    setUpdating(bugId);
    try {
      await api.put(`/bugs/${bugId}/status`, { bugId, status: newStatus });
      onStatusUpdate && onStatusUpdate(bugId, newStatus);
    } catch (err) {
      onStatusUpdate && onStatusUpdate(bugId, newStatus);
    } finally {
      setUpdating(null);
      setOpenStatusDropdown(null);
    }
  };

  const handleOpenAssignPortal = async (bug, buttonElement) => {
    if (openAssignDropdown === bug.id) {
      setOpenAssignDropdown(null);
      return;
    }
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      // Use fixed positioning (viewport-relative) since portal mounts to body
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
    setOpenAssignDropdown(bug.id);

    const projectId = bug.project?.id ?? bug.projectId ?? null;
    if (!projectId) {
      console.warn("Bug has no projectId, cannot fetch developers", bug);
      return;
    }

    // Always re-fetch so fresh data is shown (avoids stale/empty cache)
    setLoadingDevs((prev) => ({ ...prev, [bug.id]: true }));
    try {
      const res = await api.get(`/users/project/${projectId}`);
      const devList = Array.isArray(res.data) ? res.data : [];
      setProjectDevsMap((prev) => ({ ...prev, [projectId]: devList }));
    } catch (err) {
      console.error("Failed to fetch developers for project", projectId, err);
      setProjectDevsMap((prev) => ({ ...prev, [projectId]: [] }));
    } finally {
      setLoadingDevs((prev) => ({ ...prev, [bug.id]: false }));
    }
  };

  const handleAssignDeveloper = async (bug, dev) => {
    setUpdating(bug.id);
    try {
      await api.post(`/bugs/assign`, { bugId: bug.id, developerId: dev.id });
      bug.assignedTo = dev;
      bug.assignedToName = dev.name;
      onAssignDeveloper && onAssignDeveloper(bug.id, dev.id || dev);
    } catch (err) {
      try {
        await api.put(`/bugs/${bug.id}/reassign/${dev.id}`);
        bug.assignedTo = dev;
        bug.assignedToName = dev.name;
        onAssignDeveloper && onAssignDeveloper(bug.id, dev.id || dev);
      } catch (e) {
        alert("Failed to assign developer");
      }
    } finally {
      setUpdating(null);
      setOpenAssignDropdown(null);
    }
  };

  const handleUnassignDeveloper = async (bug) => {
    const isAssigned = Boolean(bug.assignedTo || bug.assignedToName || bug.assignedToId);
    if (!isAssigned) return;

    setUpdating(bug.id);
    try {
      await api.put(`/bugs/${bug.id}/unassign`);
      bug.assignedTo = null;
      bug.assignedToName = null;
      onAssignDeveloper && onAssignDeveloper(bug.id, null);
    } catch (err) {
      try {
        await api.post(`/bugs/unassign`, { bugId: bug.id });
        bug.assignedTo = null;
        bug.assignedToName = null;
        onAssignDeveloper && onAssignDeveloper(bug.id, null);
      } catch (e) {
        alert("Failed to unassign developer");
      }
    } finally {
      setUpdating(null);
      setOpenAssignDropdown(null);
    }
  };

  if (!bugs || bugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-600">
        <div className="text-5xl mb-3">🐛</div>
        <p className="font-display font-semibold text-lg">No bugs found</p>
        <p className="text-sm mt-1">The tracker is clean.</p>
      </div>
    );
  }

  const headers = [
    "ID",
    "Title",
    "Priority",
    "Status",
    "Assigned To",
    "Created",
  ];
  if (showActions) headers.push("Action");
  if (isUserAdmin) headers.push("Assign Developer");

  const currentOpenBug = bugs.find((b) => b.id === openAssignDropdown);
  const currentProjectId = currentOpenBug?.project?.id || currentOpenBug?.projectId;
  const devList = (currentProjectId && projectDevsMap[currentProjectId]) || projectDevelopers[openAssignDropdown] || projectDevelopers[currentProjectId] || [];

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-center">
            {headers.map((h) => (
              <th key={h} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {bugs.map((bug, i) => {
            const assignedName = bug.assignedTo?.name || bug.assignedToName;
            const isAssigned = Boolean(bug.assignedTo || bug.assignedToName || bug.assignedToId);

            return (
              <tr
                key={bug.id}
                className={`border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors animate-fade-up opacity-0`}
                style={{
                  animationDelay: `${i * 0.04}s`,
                  animationFillMode: "forwards",
                }}
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  #{bug.id}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 max-w-xs truncate">
                  {bug.title}
                </td>
                <td className="px-4 py-3">
                  <PriorityTag priority={bug.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={bug.status} />
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                  {assignedName || "Unassigned"}
                </td>
                <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs font-mono whitespace-nowrap">
                  {bug.createdAt
                    ? new Date(bug.createdAt).toLocaleDateString()
                    : "—"}
                </td>

                {/* Status Update */}
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="relative status-dropdown-container">
                      <button
                        onClick={() =>
                          setOpenStatusDropdown(
                            openStatusDropdown === bug.id ? null : bug.id,
                          )
                        }
                        disabled={updating === bug.id}
                        className="btn-secondary text-xs py-1.5 px-3 status-dropdown-btn"
                      >
                        {updating === bug.id ? "…" : "Update Status ↓"}
                      </button>

                      {openStatusDropdown === bug.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 card shadow-xl z-50 overflow-hidden animate-fade-up">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(bug.id, s)}
                              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                                bug.status === s
                                  ? "text-brand-500"
                                  : "text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {s.replace("_", " ")}
                              {bug.status === s && " ✓"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                )}

                {/* Assign / Unassign Developer */}
                {isUserAdmin && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 relative assign-dropdown-container">
                      <button
                        onClick={(e) => handleOpenAssignPortal(bug, e.currentTarget)}
                        disabled={updating === bug.id}
                        className="btn-primary text-xs py-1.5 px-3 assign-dropdown-btn"
                      >
                        {updating === bug.id
                          ? "…"
                          : assignedName
                            ? `Assigned: ${assignedName}`
                            : "Assign ↓"}
                      </button>

                      <button
                        onClick={() => handleUnassignDeveloper(bug)}
                        disabled={updating === bug.id || !isAssigned}
                        className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={!isAssigned ? "No developer assigned" : "Unassign developer"}
                      >
                        Unassign
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Portal for Assign Developer dropdown — fixed so it stays in viewport */}
      {openAssignDropdown &&
        createPortal(
          <div
            className="card shadow-xl z-[9999] max-h-60 overflow-y-auto assign-dropdown-container"
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: 220,
              border: "1px solid rgba(100,116,139,0.2)",
            }}
          >
            {loadingDevs[openAssignDropdown] ? (
              <div className="px-3 py-4 text-xs text-zinc-400 text-center flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                Loading developers…
              </div>
            ) : devList.length === 0 ? (
              <div className="px-3 py-4 text-xs text-zinc-400 text-center">
                No developers in this project
              </div>
            ) : (
              <div className="py-1">
                <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  Assign Developer
                </p>
                {devList.map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => handleAssignDeveloper(currentOpenBug, dev)}
                    className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {(dev.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate">{dev.name}</span>
                      {dev.email && (
                        <span className="text-[10px] text-zinc-400 truncate">{dev.email}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

