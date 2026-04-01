import { useState, useEffect, useMemo } from "react";
import { Search, FolderSync } from "lucide-react";
import toast from "react-hot-toast";
import { getProjectsByUser } from "../../services/projectService";
import HoverPopover from "../../components/admin/shared/HoverPopover";
import { UserHoverContent, UserListHoverContent, BugListHoverContent, DescriptionHoverContent } from "../../components/admin/shared/HoverContent";
import Pagination from "../../components/admin/shared/Pagination";
import { TableSkeleton } from "../../components/admin/shared/Skeleton";

const PAGE_SIZE = 10;

export default function DeveloperProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getProjectsByUser(userId);
      setProjects(res.data || []);
      setPage(0);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">My Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of projects you are currently assigned to</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-slide-up opacity-0" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
        {/* Search bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search projects…"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
          <button 
            onClick={load}
            className="ml-auto p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Refresh projects"
          >
            <FolderSync size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <TableSkeleton cols={2} rows={6} />
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-14 text-center text-slate-400 dark:text-slate-500">
                    No assigned projects found
                  </td>
                </tr>
              ) : (
                paged.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                          {(p.name || "P").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <HoverPopover content={<DescriptionHoverContent title="Project Description" description={p.description} />}>
                        <span className="text-[13px] text-slate-500 dark:text-slate-400 truncate cursor-pointer border-b border-dashed border-slate-200 dark:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors duration-200 w-[240px] inline-block align-middle">
                          {p.description || <span className="italic opacity-50">No description available</span>}
                        </span>
                      </HoverPopover>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
