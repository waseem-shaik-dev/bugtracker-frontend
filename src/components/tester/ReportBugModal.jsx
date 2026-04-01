import { useState, useEffect, useMemo } from "react";
import { X, Search, Check, Bug, Loader2, User, Folder, ShieldAlert, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAllProjects } from "../../services/projectService";
import { getUsersByProject } from "../../services/userService";
import { createBug, updateBug } from "../../services/bugService";

/* ── Generic Searchable Select Sub-Modal ── */
function SearchableSelect({ title, items, selectedId, onSelect, onClose, emptyMessage, isProject = false }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() =>
    items.filter((it) =>
      it.name?.toLowerCase().includes(search.toLowerCase()) ||
      (!isProject && it.email?.toLowerCase().includes(search.toLowerCase()))
    ), [items, search, isProject]
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-200/40 dark:bg-slate-950/60 backdrop-blur-[2px]"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[70vh] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-50 dark:border-slate-800/50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 px-6 text-center text-slate-400 text-sm italic font-medium leading-relaxed">
              {emptyMessage || "No results found"}
            </div>
          ) : (
            filtered.map((item) => {
              const active = String(selectedId) === String(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all ${
                    active ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all ${
                    active ? "bg-white dark:bg-slate-900 border-blue-500 text-blue-600" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}>
                    {item.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${active ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"}`}>
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
      </motion.div>
    </motion.div>
  );
}

export default function ReportBugModal({ isOpen, onClose, onRefresh, editBug = null }) {
  const userId = localStorage.getItem("userId");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    projectId: "",
    assignedToUserId: "",
    bugStatus: "OPEN"
  });

  const [meta, setMeta] = useState({
    projects: [],
    devs: [],
    selectedProject: null,
    selectedDev: null
  });

  const [activeSelect, setActiveSelect] = useState(null); // 'project' | 'dev'

  useEffect(() => {
    if (isOpen) {
      if (!editBug) {
        setFormData({
          title: "",
          description: "",
          priority: "MEDIUM",
          projectId: "",
          assignedToUserId: "",
          bugStatus: "OPEN"
        });
        setMeta({ projects: [], devs: [], selectedProject: null, selectedDev: null });
      }

      getAllProjects().then(res => {
        const projects = res.data || [];
        setMeta(prev => ({ ...prev, projects }));
        
        if (editBug) {
          const project = projects.find(p => p.id === editBug.project?.id || p.id === editBug.projectId);
          if (project) {
            handleProjectSelect(project, editBug.assignedTo);
          }
          
          setFormData({
            title: editBug.title || "",
            description: editBug.description || "",
            priority: editBug.priority || "MEDIUM",
            projectId: editBug.project?.id || editBug.projectId || "",
            assignedToUserId: editBug.assignedTo?.id || editBug.assignedToUserId || "",
            bugStatus: editBug.status || "OPEN"
          });
        }
      });
    }
  }, [isOpen, editBug]);

  const handleProjectSelect = async (project, initialDev = null) => {
    setFormData(prev => ({ 
      ...prev, 
      projectId: project.id, 
      assignedToUserId: initialDev?.id || "" 
    }));
    
    setMeta(prev => ({ 
      ...prev, 
      selectedProject: project, 
      selectedDev: initialDev, 
      devs: [] 
    }));
    
    try {
      const res = await getUsersByProject(project.id);
      setMeta(prev => ({ ...prev, devs: res.data || [] }));
    } catch {
      toast.error("Failed to load developers for this project");
    }
  };

  const handleDevSelect = (dev) => {
    setFormData(prev => ({ ...prev, assignedToUserId: dev.id }));
    setMeta(prev => ({ ...prev, selectedDev: dev }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || (!editBug && (!formData.projectId || !formData.assignedToUserId))) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editBug) {
        const updatePayload = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          bugStatus: formData.bugStatus
        };
        const res = await updateBug(editBug.id, updatePayload);
        toast.success("Bug updated successfully!");
        onRefresh(res.data);
      } else {
        const res = await createBug(userId, formData);
        toast.success("Bug reported successfully!");
        onRefresh(res.data);
      }
      onClose();
    } catch {
      toast.error(editBug ? "Failed to update bug" : "Failed to report bug");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-200/40 dark:bg-slate-950/60 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Bug size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                    {editBug ? "Edit Bug" : "Report New Bug"}
                  </h2>
                  <p className="text-[13px] text-slate-500">
                    {editBug ? "Update bug details to keep information accurate" : "Provide details to help developers fix it faster"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Bug Title</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Login button not responding on mobile"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the bug, steps to reproduce, and expected behavior..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Priority</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                      <ShieldAlert size={14} />
                    </div>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="CRITICAL">Critical Priority</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Bug Status (Only in Edit Mode) */}
                {editBug && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Status</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Check size={14} />
                      </div>
                      <select
                        value={formData.bugStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, bugStatus: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100 font-medium"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Selector (Hidden in Edit Mode) */}
                {!editBug && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Project</label>
                    <div 
                      onClick={() => setActiveSelect('project')}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm cursor-pointer hover:border-blue-500/50 transition-all flex items-center justify-between ${!meta.selectedProject ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Folder size={14} className="text-slate-400" />
                        <span className="truncate">{meta.selectedProject?.name || "Select project..."}</span>
                      </div>
                      <Search size={14} className="text-slate-400" />
                    </div>
                  </div>
                )}

                {/* Assigned To (Hidden in Edit Mode) */}
                {!editBug && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Assign To</label>
                    <div 
                      onClick={() => formData.projectId && setActiveSelect('dev')}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm flex items-center justify-between transition-all ${
                        !formData.projectId 
                          ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' 
                          : 'cursor-pointer hover:border-blue-500/50'
                      } ${!meta.selectedDev ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <User size={14} className="text-slate-400" />
                        <span className="truncate">{meta.selectedDev?.name || "Select developer..."}</span>
                      </div>
                      <Search size={14} className="text-slate-400" />
                    </div>
                    {!formData.projectId && <p className="text-[10px] text-slate-400 italic ml-1">Pick a project first</p>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title || (!editBug && (!formData.projectId || !formData.assignedToUserId))}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{editBug ? "Updating..." : "Reporting..."}</span>
                    </>
                  ) : (
                    <span>{editBug ? "Update Bug" : "Submit Bug"}</span>
                  )}
                </button>
              </div>
            </form>

            {/* Inner Selection Modals */}
            <AnimatePresence>
              {activeSelect === 'project' && (
                <SearchableSelect
                  title="Select Project"
                  items={meta.projects}
                  selectedId={formData.projectId}
                  onSelect={handleProjectSelect}
                  onClose={() => setActiveSelect(null)}
                  isProject
                />
              )}
              {activeSelect === 'dev' && (
                <SearchableSelect
                  title="Assign Developer"
                  items={meta.devs}
                  selectedId={formData.assignedToUserId}
                  onSelect={handleDevSelect}
                  onClose={() => setActiveSelect(null)}
                  emptyMessage={`No developers are currently assigned to project "${meta.selectedProject?.name || 'this project'}"`}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
