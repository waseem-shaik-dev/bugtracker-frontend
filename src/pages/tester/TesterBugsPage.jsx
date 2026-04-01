import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Bug, Plus, ArrowUpDown, X, Check, Calendar, UserCheck, UserX, Copy, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { 
  getBugsByCreator, 
  getDetailedBugById 
} from "../../services/bugService";
import { getDevelopers, getTesters } from "../../services/userService";
import { getAllProjects } from "../../services/projectService";
import HoverPopover from "../../components/admin/shared/HoverPopover";
import { StatusBadge, PriorityBadge } from "../../components/admin/shared/Badge";
import Pagination from "../../components/admin/shared/Pagination";
import { TableSkeleton } from "../../components/admin/shared/Skeleton";
import { UserHoverContent, ProjectHoverContent, DescriptionHoverContent } from "../../components/admin/shared/HoverContent";
import ConfirmModal from "../../components/admin/shared/ConfirmModal";
import ReportBugModal from "../../components/tester/ReportBugModal";
import { updateBugStatus, updateBugPriority, assignBug, unassignBug, deleteBug } from "../../services/bugService";

/* ── Assign Bug Modal (Exact same as Admin) ── */
function AssignModal({ bug, developers, onClose, onAssigned }) {
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() =>
    developers.filter((d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase())
    ), [developers, search]
  );

  const handle = async () => {
    if (!selectedId) { toast.error("Select a developer"); return; }
    setLoading(true);
    try {
      await assignBug(bug.id, Number(selectedId));
      onAssigned(bug.id);
      toast.success("Bug assigned");
      onClose();
    } catch {
      toast.error("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-modal-in flex flex-col overflow-hidden max-h-[85vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Assign Bug</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[300px] truncate">{bug.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/50">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search developer..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-[300px]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No developers found.</div>
          ) : (
            filtered.map((d) => {
              const active = selectedId === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${
                    active ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    active ? "bg-white dark:bg-slate-900 border-blue-500 text-blue-600" : "bg-slate-100 dark:bg-slate-800 border-slate-100 text-slate-500"
                  }`}>
                    {d.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"}`}>{d.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{d.email}</p>
                  </div>
                  {active && <Check size={14} className="text-blue-600" />}
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handle} disabled={loading || !selectedId} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
            {loading ? "Assigning…" : "Assign Developer"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── Reusable Searchable Selection Modal (Internal) ── */
function SearchableFilterModal({ title, items, selectedId, onSelect, onClose, isProject = false }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() =>
    items.filter((it) =>
      it.name?.toLowerCase().includes(search.toLowerCase()) ||
      (!isProject && it.email?.toLowerCase().includes(search.toLowerCase()))
    ), [items, search, isProject]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-modal-in flex flex-col overflow-hidden max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/50">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isProject ? "Search projects..." : "Search by name or email..."}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-[320px]">
          <div
            onClick={() => { onSelect(""); onClose(); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border transition-all ${
              !selectedId ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <span className={`text-sm font-semibold ${!selectedId ? "text-blue-600" : "text-slate-500"}`}>All Options</span>
            {!selectedId && <Check size={14} className="text-blue-600" />}
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No results found</div>
          ) : (
            filtered.map((item) => {
              const active = String(selectedId) === String(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all ${
                    active ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                    active ? "bg-white dark:bg-slate-900 border-blue-500 text-blue-600" : "bg-slate-100 dark:bg-slate-800 border-slate-100 text-slate-500"
                  }`}>
                    {item.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"}`}>
                      {item.name}
                    </p>
                    {item.email && <p className="text-[11px] text-slate-400 truncate">{item.email}</p>}
                  </div>
                  {active && <Check size={14} className="text-blue-600" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function TesterBugsPage() {
  const userId = localStorage.getItem("userId");
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ developers: [], projects: [] });

  // Filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterDev, setFilterDev] = useState("");
  
  // UI state
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [unassignConfirm, setUnassignConfirm] = useState(null); // { id, title, devName }
  const [selectModal, setSelectModal] = useState(null);
  const [editBugTarget, setEditBugTarget] = useState(null);
  const [deleteBugTarget, setDeleteBugTarget] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [devsRes, projectsRes] = await Promise.all([getDevelopers(), getAllProjects()]);
        setMeta({ developers: devsRes.data || [], projects: projectsRes.data || [] });
      } catch (err) {
        toast.error("Failed to load reference data");
      }
    };
    fetchMeta();
    loadBugs();
  }, []);

  const loadBugs = async () => {
    setLoading(true);
    try {
      const res = await getBugsByCreator(userId);
      setBugs(res.data || []);
    } catch {
      toast.error("Failed to load bugs");
    } finally {
      setLoading(false);
    }
  };

  const refreshBug = async (id) => {
    try {
      const res = await getDetailedBugById(id);
      if (res.data) setBugs(prev => prev.map(b => b.id === id ? res.data : b));
    } catch {
      toast.error("Refresh failed");
    }
  };

  const handleDeleteBug = async () => {
    if (!deleteBugTarget) return;
    setLoading(true);
    try {
      await deleteBug(deleteBugTarget.id);
      toast.success("Bug deleted successfully");
      setBugs(prev => prev.filter(b => b.id !== deleteBugTarget.id));
      setDeleteBugTarget(null);
    } catch {
      toast.error("Failed to delete bug");
    } finally {
      setLoading(false);
    }
  };

  const executeUnassign = async () => {
    if (!unassignConfirm) return;
    setLoading(true);
    try {
      await unassignBug(unassignConfirm.id);
      refreshBug(unassignConfirm.id);
      toast.success("Bug unassigned");
      setUnassignConfirm(null);
    } catch {
      toast.error("Failed to unassign");
    } finally {
      setLoading(false);
    }
  };

  // Frontend filtering
  const filtered = useMemo(() => {
    let list = [...bugs];
    const q = search.toLowerCase();
    if (q) list = list.filter(b => b.title?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q));
    if (filterStatus) list = list.filter(b => b.status === filterStatus);
    if (filterPriority) list = list.filter(b => b.priority === filterPriority);
    if (filterProject) list = list.filter(b => b.project?.id === Number(filterProject));
    if (filterDev) list = list.filter(b => b.assignedTo?.id === Number(filterDev));

    list.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [bugs, search, filterStatus, filterPriority, filterProject, filterDev, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleUnassign = (bug) => {
    setUnassignConfirm({
      id: bug.id,
      title: bug.title,
      devName: bug.assignedTo?.name || "the assigned developer"
    });
  };


  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortBtn = ({ field, label }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 group">
      {label}
      <ArrowUpDown size={12} className={`transition-colors ${sortField === field ? "text-blue-500" : "text-slate-300 group-hover:text-slate-500"}`} />
    </button>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Bugs Reported by You</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your reported issues</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {filtered.length} bug{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            <span>Report Bug</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm animate-slide-up opacity-0" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Filter size={14} className="text-blue-500" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Refine View</span>
          {(search || filterStatus || filterPriority || filterProject || filterDev) && (
            <button
              onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); setFilterProject(""); setFilterDev(""); }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="col-span-1 lg:col-span-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Project Filter */}
          <button
            onClick={() => setSelectModal({ title: "Filter by Project", items: meta.projects, selectedId: filterProject, isProject: true, onSelect: setFilterProject })}
            className={`col-span-1 text-[13px] px-3 py-2.5 border rounded-xl text-left truncate flex items-center justify-between transition-all ${
              filterProject ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 text-blue-700" : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <span className="truncate">{filterProject ? `Project: ${meta.projects.find(p => String(p.id) === String(filterProject))?.name}` : "All Projects"}</span>
            <ArrowUpDown size={10} className="opacity-40" />
          </button>

          {/* Developer Filter */}
          <button
            onClick={() => setSelectModal({ title: "Filter by Assignee", items: meta.developers, selectedId: filterDev, onSelect: setFilterDev })}
            className={`col-span-1 text-[13px] px-3 py-2.5 border rounded-xl text-left truncate flex items-center justify-between transition-all ${
              filterDev ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 text-blue-700" : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <span className="truncate">{filterDev ? `Dev: ${meta.developers.find(d => String(d.id) === String(filterDev))?.name}` : "All Developers"}</span>
            <ArrowUpDown size={10} className="opacity-40" />
          </button>

          {/* Status */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="col-span-1 text-[13px] px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none transition-all">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Priority */}
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="col-span-1 text-[13px] px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none transition-all">
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-px">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <SortBtn field="title" label="Title" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <TableSkeleton cols={9} rows={8} />
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-20 text-center text-slate-400 dark:text-slate-500 font-medium font-display">
                    No bugs match your current filters.
                  </td>
                </tr>
              ) : (
                paged.map((bug) => (
                  <tr key={bug.id} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{bug.id}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">{bug.title}</p>
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
                    <td className="px-4 py-3">
                      <StatusBadge status={bug.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={bug.priority} />
                    </td>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditBugTarget(bug)}
                          title="Edit bug"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteBugTarget(bug)}
                          title="Delete bug"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={() => setAssignTarget(bug)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          title="Assign developer"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button 
                          onClick={() => handleUnassign(bug)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                          title="Unassign developer"
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          bug={assignTarget}
          developers={meta.developers}
          onClose={() => setAssignTarget(null)}
          onAssigned={(id) => refreshBug(id)}
        />
      )}

      {unassignConfirm && (
        <ConfirmModal
          isOpen={!!unassignConfirm}
          onClose={() => setUnassignConfirm(null)}
          onConfirm={executeUnassign}
          title="Unassign Developer"
          message={`Are you sure you want to unassign ${unassignConfirm.devName} from bug: "${unassignConfirm.title}"?\n\nThis action will leave the bug without an assigned developer.`}
          confirmText="Unassign"
          loading={loading}
          type="danger"
        />
      )}

      {/* Select Filter Modal */}
      {selectModal && (
        <SearchableFilterModal
          {...selectModal}
          onClose={() => setSelectModal(null)}
        />
      )}

      <ReportBugModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onRefresh={(newBug) => {
          setBugs(prev => [newBug, ...prev]);
        }}
      />

      {editBugTarget && (
        <ReportBugModal
          isOpen={!!editBugTarget}
          onClose={() => setEditBugTarget(null)}
          editBug={editBugTarget}
          onRefresh={(updatedBug) => {
            setBugs(prev => prev.map(b => b.id === updatedBug.id ? updatedBug : b));
          }}
        />
      )}

      {deleteBugTarget && (
        <ConfirmModal
          isOpen={!!deleteBugTarget}
          onClose={() => setDeleteBugTarget(null)}
          onConfirm={handleDeleteBug}
          loading={loading}
          title="Delete Bug?"
          message={`Are you sure you want to delete this bug: "${deleteBugTarget.title}"? This action cannot be undone.`}
          confirmText="Delete Bug"
          type="danger"
        />
      )}
    </div>
  );
}
