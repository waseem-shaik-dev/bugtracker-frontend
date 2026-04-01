// =============================
// FILE: src/components/BugTable.jsx
// =============================
import { useState, useRef, useEffect } from "react";
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
  const assignButtonRef = useRef(null);

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

  const handleAssignDeveloper = async (bugId, developerId) => {
    setUpdating(bugId);
    try {
      await api.post(`/bugs/assign`, { bugId, developerId });
      onAssignDeveloper && onAssignDeveloper(bugId, developerId);
    } catch (err) {
      alert("Failed to assign developer");
    } finally {
      setUpdating(null);
      setOpenAssignDropdown(null);
    }
  };

  // Compute dropdown position relative to viewport
  const openAssignPortal = (bugId, buttonRef) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setOpenAssignDropdown(bugId);
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
  if (isAdmin) headers.push("Assign Developer");

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-center">
            {headers.map((h) => (
              <th key={h} className="px-2 py-4 text-center align-bottom">
                <div className="writing-mode-vertical text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {h}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {bugs.map((bug, i) => (
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
                {bug.assignedToName || "—"}
              </td>
              <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs font-mono whitespace-nowrap">
                {bug.createdAt
                  ? new Date(bug.createdAt).toLocaleDateString()
                  : "—"}
              </td>

              {/* Status Update */}
              {showActions && (
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenStatusDropdown(
                          openStatusDropdown === bug.id ? null : bug.id,
                        )
                      }
                      disabled={updating === bug.id}
                      className="btn-secondary text-xs py-1.5 px-3"
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

              {/* Assign Developer */}
              {isAdmin && (
                <td className="px-4 py-3 text-center">
                  <div className="relative" ref={assignButtonRef}>
                    <button
                      onClick={() => openAssignPortal(bug.id, assignButtonRef)}
                      disabled={updating === bug.id}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {updating === bug.id
                        ? "…"
                        : bug.assignedToName
                          ? `Assigned: ${bug.assignedToName}`
                          : "Assign ↓"}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Portal for Assign Developer dropdown */}
      {openAssignDropdown &&
        createPortal(
          <div
            className="card shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-up"
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: 192,
            }}
          >
            {(projectDevelopers[openAssignDropdown] || []).map((dev) => (
              <button
                key={dev.id}
                onClick={() =>
                  handleAssignDeveloper(openAssignDropdown, dev.id)
                }
                className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {dev.name}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
