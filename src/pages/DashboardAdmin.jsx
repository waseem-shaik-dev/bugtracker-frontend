import { useState, useEffect } from "react";
import { FolderOpen, Users, Bug, AlertCircle, TrendingUp, Copy } from "lucide-react";
import { getDashboard } from "../services/dashboardService";
import { StatusBadge, PriorityBadge } from "../components/admin/shared/Badge";
import { CardSkeleton, TableSkeleton } from "../components/admin/shared/Skeleton";
import HoverPopover from "../components/admin/shared/HoverPopover";
import { UserHoverContent, ProjectHoverContent, DescriptionHoverContent } from "../components/admin/shared/HoverContent";
import toast from "react-hot-toast";

function StatCard({ label, value, icon: Icon, color, bgColor, delay }) {
  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow animate-slide-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{value ?? "—"}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function BugStatusCard({ label, value, color, delay }) {
  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 flex items-center gap-4 animate-slide-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{label}</span>
      <span className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg">{value ?? 0}</span>
    </div>
  );
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDashboard();
        setStats(res.data);
        setRecentBugs(res.data?.recentBugs || []);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topCards = [
    { label: "Total Projects", value: stats?.totalProjects, icon: FolderOpen, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/30", delay: "0.05s" },
    { label: "Total Users",    value: stats?.totalUsers,    icon: Users,      color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/30", delay: "0.1s" },
    { label: "Total Bugs",     value: stats?.totalBugs,     icon: Bug,        color: "text-red-600 dark:text-red-400",       bgColor: "bg-red-50 dark:bg-red-900/30",       delay: "0.15s" },
  ];

  const statusCards = [
    { label: "In Progress", value: stats?.inProgressBugs,  color: "bg-amber-500",   delay: "0.25s" },
    { label: "Resolved",    value: stats?.resolvedBugs,    color: "bg-emerald-500", delay: "0.30s" },
    { label: "Closed",      value: stats?.closedBugs,      color: "bg-slate-400",   delay: "0.35s" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="mb-8 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live overview of your bug tracking system</p>
      </div>

      {/* Top stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CardSkeleton count={3} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {topCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Bug status breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {statusCards.map((c) => (
          <BugStatusCard key={c.label} {...c} />
        ))}
      </div>

      {/* Recent Bugs */}
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-slide-up opacity-0"
        style={{ animationDelay: "0.45s", animationFillMode: "forwards" }}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-500" />
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base">Recent Bugs</h2>
          <span className="ml-auto text-xs text-slate-400 font-mono">{recentBugs.length} bugs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-px">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton cols={8} rows={5} />
              ) : recentBugs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                    No recent bugs
                  </td>
                </tr>
              ) : (
                recentBugs.map((bug) => (
                  <tr
                    key={bug.id}
                    className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{bug.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {bug.title}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 group/desc">
                        <HoverPopover content={<DescriptionHoverContent title="Bug Description" description={bug.description} />}>
                           <span className="text-[13px] text-slate-500 dark:text-slate-400 truncate cursor-pointer border-b border-dashed border-slate-200 dark:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors duration-200 w-[180px] inline-block align-middle">
                            {bug.description || <span className="italic opacity-50">No description</span>}
                          </span>
                        </HoverPopover>
                        {bug.description && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(bug.description);
                              toast.success("Description copied!", { id: `copy-${bug.id}` });
                            }}
                            className="opacity-0 group-hover/desc:opacity-100 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                            title="Copy Description"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={bug.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={bug.priority} /></td>
                    <td className="px-4 py-3">
                      <HoverPopover content={<ProjectHoverContent project={bug.project} />}>
                        <span className="text-[13px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors border-b border-dashed border-slate-300 hover:border-blue-400 inline-block align-middle pb-0.5">
                          {bug.project?.name || "N/A"}
                        </span>
                      </HoverPopover>
                    </td>
                    <td className="px-4 py-3">
                      <HoverPopover content={<UserHoverContent user={bug.createdBy} />}>
                        <span className="text-[13px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors border-b border-dashed border-slate-300 hover:border-blue-400 inline-block align-middle pb-0.5">
                          {bug.createdBy?.name || "System"}
                        </span>
                      </HoverPopover>
                    </td>
                    <td className="px-4 py-3">
                      <HoverPopover content={<UserHoverContent user={bug.assignedTo} />}>
                        <span className="text-[13px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors border-b border-dashed border-slate-300 hover:border-blue-400 inline-block align-middle pb-0.5">
                          {bug.assignedTo?.name || "Unassigned"}
                        </span>
                      </HoverPopover>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
