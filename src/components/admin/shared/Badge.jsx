const STATUS_MAP = {
  OPEN:        { label: "Open",        cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  RESOLVED:    { label: "Resolved",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  CLOSED:      { label: "Closed",      cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

const PRIORITY_MAP = {
  LOW:      { label: "Low",      cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  MEDIUM:   { label: "Medium",   cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  HIGH:     { label: "High",     cls: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  CRITICAL: { label: "Critical", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
};

const ROLE_MAP = {
  ADMIN:     { label: "Admin",     cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  DEVELOPER: { label: "Developer", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  TESTER:    { label: "Tester",    cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
};

export function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const { label, cls } = PRIORITY_MAP[priority] || { label: priority, cls: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const { label, cls } = ROLE_MAP[role] || { label: role, cls: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
