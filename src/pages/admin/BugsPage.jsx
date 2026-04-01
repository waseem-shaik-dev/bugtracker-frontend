import { useState, useEffect, useMemo } from "react";
import { Search, Filter, UserCheck, UserX, ArrowUpDown, X, Check, Copy, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDetailedBugs, getDetailedBugsByDeveloper, getDetailedBugsByCreator, getDetailedBugsByProject,
  getDetailedBugById, updateBugStatus, updateBugPriority, assignBug, unassignBug, deleteBug
} from "../../services/bugService";
import HoverPopover from "../../components/admin/shared/HoverPopover";
import { getDevelopers, getAllUsers, getTesters } from "../../services/userService";
import { getAllProjects } from "../../services/projectService";
import { StatusBadge, PriorityBadge } from "../../components/admin/shared/Badge";
import Pagination from "../../components/admin/shared/Pagination";
import { TableSkeleton } from "../../components/admin/shared/Skeleton";
import Modal from "../../components/admin/shared/Modal";
import { UserHoverContent, ProjectHoverContent, DescriptionHoverContent } from "../../components/admin/shared/HoverContent";
import ConfirmModal from "../../components/admin/shared/ConfirmModal";
import ReportBugModal from "../../components/tester/ReportBugModal";

/* ── Searchable Single-Select Modal ── */
function SearchableSelectModal({ title, items, selectedId, onSelect, onClose, isProject = false }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() =>
    items.filter((it) =>
      (isProject ? it.name : it.name)?.toLowerCase().includes(search.toLowerCase()) ||
      (!isProject && it.email?.toLowerCase().includes(search.toLowerCase()))
    ), [items, search, isProject]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-modal-in flex flex-col overflow-hidden max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Select an option to filter bugs</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/50">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isProject ? "Search projects…" : "Search by name or email…"}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-[320px]">
          <div
            onClick={() => { onSelect(""); onClose(); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border transition-all ${
              !selectedId ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <span className={`text-sm font-semibold ${!selectedId ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}>
              Show All (No Filter)
            </span>
            {!selectedId && <Check size={14} className="text-blue-600" />}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No results found.</div>
          ) : (
            filtered.map((item) => {
              const active = String(selectedId) === String(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${
                    active ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    active ? "bg-white dark:bg-slate-900 border-blue-500 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
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
const STATUSES  = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];


/* ── Assign Bug Modal ── */
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
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Assign Bug</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[300px] truncate">{bug.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/50">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search developer by name or email…"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* List */}
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
                    active 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    active 
                      ? "bg-white dark:bg-slate-900 border-blue-500 text-blue-600 dark:text-blue-400" 
                      : "bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    {d.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"}`}>
                      {d.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{d.email}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    active ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-700"
                  }`}>
                    {active && <Check size={12} className="text-white font-bold" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handle} 
            disabled={loading || !selectedId} 
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {loading ? "Assigning…" : "Assign Developer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function BugsPage() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [testers, setTesters] = useState([]);
  const [projects, setProjects] = useState([]);

  // Backend filters
  const [filterDev, setFilterDev]         = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [filterProject, setFilterProject] = useState("");

  // Frontend filters
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus]     = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir]     = useState("desc");
  const [page, setPage]           = useState(0);

  // Modal
  const [assignTarget, setAssignTarget] = useState(null);
  const [unassignConfirm, setUnassignConfirm] = useState(null); // { id, title, devName }
  const [editBugTarget, setEditBugTarget] = useState(null);
  const [deleteBugTarget, setDeleteBugTarget] = useState(null);
  const [selectModal, setSelectModal] = useState(null); // { type, title, items, selectedId, onSelect }

  // Load reference data
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [devsRes, projectsRes, testersRes] = await Promise.all([
          getDevelopers(),
          getAllProjects(),
          getTesters()
        ]);
        setDevelopers(devsRes.data || []);
        setProjects(projectsRes.data || []);
        setTesters(testersRes.data || []);
      } catch (err) {
        toast.error("Failed to load metadata");
      }
    };
    fetchMeta();
  }, []);

  // Load bugs whenever backend filter changes
  useEffect(() => {
    loadBugs();
  }, [filterDev, filterCreator, filterProject]);

  const loadBugs = async () => {
    setLoading(true);
    setPage(0);
    try {
      let res;
      if (filterDev)     res = await getDetailedBugsByDeveloper(filterDev);
      else if (filterCreator) res = await getDetailedBugsByCreator(filterCreator);
      else if (filterProject) res = await getDetailedBugsByProject(filterProject);
      else               res = await getDetailedBugs();
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
      if (res.data) {
        setBugs((prev) => prev.map((b) => b.id === id ? res.data : b));
      }
    } catch {
      toast.error("Failed to refresh bug details");
    }
  };

  const handleUnassign = (bug) => {
    setUnassignConfirm({
      id: bug.id,
      title: bug.title,
      devName: bug.assignedTo?.name || "the assigned developer"
    });
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

  const clearBackendFilters = () => {
    setFilterDev("");
    setFilterCreator("");
    setFilterProject("");
  };

  // Frontend filtering + sorting
  const filtered = useMemo(() => {
    let list = [...bugs];
    const q = search.toLowerCase();
    if (q) list = list.filter((b) => b.title?.toLowerCase().includes(q));
    if (filterStatus)   list = list.filter((b) => b.status === filterStatus);
    if (filterPriority) list = list.filter((b) => b.priority === filterPriority);
    list.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [bugs, search, filterStatus, filterPriority, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortBtn = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 group"
    >
      {label}
      <ArrowUpDown size={12} className={`transition-colors ${sortField === field ? "text-blue-500" : "text-slate-300 group-hover:text-slate-500"}`} />
    </button>
  );

  const activeBackendFilter = filterDev || filterCreator || filterProject;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Bugs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage all reported bugs</p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          {filtered.length} bug{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 mb-4 animate-slide-up opacity-0" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-blue-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Filters</span>
          {(activeBackendFilter || filterStatus || filterPriority || search) && (
            <button
              onClick={() => { clearBackendFilters(); setFilterStatus(""); setFilterPriority(""); setSearch(""); }}
              className="ml-auto text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Developer Filter */}
          <button
            onClick={() => setSelectModal({
              type: "dev",
              title: "Filter by Developer",
              items: developers,
              selectedId: filterDev,
              onSelect: (id) => { setFilterDev(id); setFilterCreator(""); setFilterProject(""); }
            })}
            className={`col-span-1 text-[13px] px-3 py-2 border rounded-xl transition-all duration-200 text-left truncate flex items-center justify-between ${
              filterDev ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm" : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <span className="truncate">{filterDev ? `Dev: ${developers.find(d => String(d.id) === String(filterDev))?.name}` : "All Developers"}</span>
            <ArrowUpDown size={10} className="ml-1 opacity-40 shrink-0" />
          </button>

          {/* Creator Filter */}
          <button
            onClick={() => setSelectModal({
              type: "creator",
              title: "Filter by Creator",
              items: testers,
              selectedId: filterCreator,
              onSelect: (id) => { setFilterCreator(id); setFilterDev(""); setFilterProject(""); }
            })}
            className={`col-span-1 text-[13px] px-3 py-2 border rounded-xl transition-all duration-200 text-left truncate flex items-center justify-between ${
              filterCreator ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm" : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <span className="truncate">{filterCreator ? `Creator: ${testers.find(t => String(t.id) === String(filterCreator))?.name}` : "All Creators"}</span>
            <ArrowUpDown size={10} className="ml-1 opacity-40 shrink-0" />
          </button>

          {/* Project Filter */}
          <button
            onClick={() => setSelectModal({
              type: "project",
              title: "Filter by Project",
              items: projects,
              selectedId: filterProject,
              isProject: true,
              onSelect: (id) => { setFilterProject(id); setFilterDev(""); setFilterCreator(""); }
            })}
            className={`col-span-1 text-[13px] px-3 py-2 border rounded-xl transition-all duration-200 text-left truncate flex items-center justify-between ${
              filterProject ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm" : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <span className="truncate">{filterProject ? `Proj: ${projects.find(p => String(p.id) === String(filterProject))?.name}` : "All Projects"}</span>
            <ArrowUpDown size={10} className="ml-1 opacity-40 shrink-0" />
          </button>

          {/* Frontend: Status */}
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} className="col-span-1 text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>

          {/* Frontend: Priority */}
          <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(0); }} className="col-span-1 text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Frontend: Search */}
          <div className="relative col-span-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search title…"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-slide-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton cols={9} rows={8} />
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-slate-400 dark:text-slate-500">
                    No bugs found
                  </td>
                </tr>
              ) : (
                paged.map((bug) => (
                  <tr key={bug.id} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{bug.id}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{bug.title}</p>
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
                      <HoverPopover content={<ProjectHoverContent project={bug.project || projects.find(p => p.id === bug.projectId)} />}>
                        <span className="text-[13px] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors border-b border-dashed border-slate-300 hover:border-blue-400 inline-block align-middle pb-0.5">
                          {bug.project?.name || projects.find((p) => p.id === bug.projectId)?.name || `#${bug.projectId}`}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditBugTarget(bug)}
                          title="Edit bug"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteBugTarget(bug)}
                          title="Delete bug"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setAssignTarget(bug)}
                          title="Assign developer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => handleUnassign(bug)}
                          title="Unassign developer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {Math.min(paged.length, PAGE_SIZE)} of {filtered.length}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          bug={assignTarget}
          developers={developers}
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
          message={`Are you sure you want to unassign ${unassignConfirm.devName} from bug: "${unassignConfirm.title}"?\n\nThis will leave the bug without an assigned developer.`}
          confirmText="Unassign"
          loading={loading}
          type="danger"
        />
      )}

      {selectModal && (
        <SearchableSelectModal
          title={selectModal.title}
          items={selectModal.items}
          selectedId={selectModal.selectedId}
          isProject={selectModal.isProject}
          onSelect={selectModal.onSelect}
          onClose={() => setSelectModal(null)}
        />
      )}

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
