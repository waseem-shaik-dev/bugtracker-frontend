import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown, Loader2, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { getDetailedBugsByDeveloper, updateBugStatus } from "../../services/bugService";
import HoverPopover from "../../components/admin/shared/HoverPopover";
import { StatusBadge, PriorityBadge } from "../../components/admin/shared/Badge";
import Pagination from "../../components/admin/shared/Pagination";
import { TableSkeleton } from "../../components/admin/shared/Skeleton";
import { UserHoverContent, ProjectHoverContent, DescriptionHoverContent } from "../../components/admin/shared/HoverContent";

const PAGE_SIZE = 10;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function StatusUpdateDropdown({ bug, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(bug.status);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setLoading(true);
    setCurrentStatus(newStatus);
    try {
      await updateBugStatus(bug.id, newStatus);
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      onUpdate(bug.id, newStatus);
    } catch (err) {
      toast.error("Failed to update status");
      setCurrentStatus(bug.status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-full min-w-[140px]">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={loading}
        className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
          loading 
            ? "bg-slate-50 border-slate-200 text-slate-400" 
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm"
        }`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 size={12} className="animate-spin text-blue-500" />
        </div>
      )}
      {!loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ArrowUpDown size={10} />
        </div>
      )}
    </div>
  );
}

export default function DeveloperBugsPage() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);

  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getDetailedBugsByDeveloper(userId);
        setBugs(res.data || []);
      } catch (err) {
        toast.error("Failed to load your bugs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleLocalUpdate = (bugId, newStatus) => {
    setBugs((prev) =>
      prev.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b))
    );
  };

  // Frontend filtering + sorting
  const filtered = useMemo(() => {
    let list = [...bugs];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter((b) => b.title?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      
      // Handle nested fields if any (though not used currently for sort)
      if (sortField === "projectName") {
        av = a.project?.name || "";
        bv = b.project?.name || "";
      }

      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [bugs, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortBtn = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 group"
    >
      {label}
      <ArrowUpDown
        size={12}
        className={`transition-colors ${
          sortField === field ? "text-blue-500" : "text-slate-300 group-hover:text-slate-500"
        }`}
      />
    </button>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Assigned Bugs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and resolve the tasks assigned to you</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by title…"
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            {filtered.length} total
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-slide-up opacity-0" 
        style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-px">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <SortBtn field="title" label="Title" />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <SortBtn field="projectName" label="Project" />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[180px]">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <TableSkeleton cols={9} rows={6} />
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500">
                    <Bug size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No assigned bugs found</p>
                    <p className="text-xs mt-1">Try adjusting your search or check back later</p>
                  </td>
                </tr>
              ) : (
                paged.map((bug) => (
                  <tr key={bug.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{bug.id}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {bug.title}
                      </p>
                    </td>
                     <td className="px-6 py-4">
                      <div className="flex items-center gap-3 group/desc">
                        <HoverPopover content={<DescriptionHoverContent title={bug.title} description={bug.description} />}>
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
                    <td className="px-6 py-4">
                      <HoverPopover content={<ProjectHoverContent project={bug.project} />}>
                        <span className="text-[13px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors border-b border-dashed border-slate-300 hover:border-blue-400 inline-block align-middle pb-0.5">
                          {bug.project?.name || "N/A"}
                        </span>
                      </HoverPopover>
                    </td>
                    <td className="px-6 py-4">
                      <HoverPopover content={<UserHoverContent user={bug.createdBy} />}>
                        <span className="text-[13px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors border-b border-dashed border-slate-300 hover:border-blue-400 inline-block align-middle pb-0.5">
                          {bug.createdBy?.name || "Tester"}
                        </span>
                      </HoverPopover>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={bug.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bug.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(bug.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusUpdateDropdown bug={bug} onUpdate={handleLocalUpdate} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{paged.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> bugs
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
