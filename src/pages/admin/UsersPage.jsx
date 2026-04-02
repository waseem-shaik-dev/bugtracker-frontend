import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, FolderPlus, FolderMinus, Search, X, Check, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/admin/shared/ConfirmModal";
import {
  getAllUsers, getAdmins, getDevelopers, getTesters,
  createUser, updateUser, deleteUser,
  assignProjects, removeProjects,
} from "../../services/userService";
import { getProjectsByUser, getUnassignedProjectsForUser } from "../../services/projectService";
import Modal from "../../components/admin/shared/Modal";
import ConfirmDialog from "../../components/admin/shared/ConfirmDialog";
import { RoleBadge } from "../../components/admin/shared/Badge";
import Pagination from "../../components/admin/shared/Pagination";
import { TableSkeleton } from "../../components/admin/shared/Skeleton";

const TABS = [
  { key: "ALL",       label: "All Users",  fetch: getAllUsers },
  { key: "ADMIN",     label: "Admins",     fetch: getAdmins },
  { key: "DEVELOPER", label: "Developers", fetch: getDevelopers },
  { key: "TESTER",    label: "Testers",    fetch: getTesters },
];

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", email: "", password: "", role: "DEVELOPER" };

// Super Admin Helpers
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || "super_admin@gmail.com";
const isSuperAdmin = (email) => email === SUPER_ADMIN_EMAIL;
const isCurrentUserSuperAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email === SUPER_ADMIN_EMAIL;
  } catch {
    return false;
  }
};

/* ── Assign/Unassign Overlay ── */
function AssignProjectsPanel({ user, onClose }) {
  const [mode, setMode] = useState("assign"); // "assign" | "unassign"
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
    setSelected([]);
  }, [mode]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = mode === "assign"
        ? await getUnassignedProjectsForUser(user.id)
        : await getProjectsByUser(user.id);
      setProjects(res.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!selected.length) { toast.error("Select at least one project"); return; }
    setSubmitting(true);
    try {
      if (mode === "assign") {
        await assignProjects(user.id, selected);
        toast.success("Projects assigned successfully");
      } else {
        await removeProjects(user.id, selected);
        toast.success("Projects unassigned successfully");
      }
      onClose();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-modal-in" style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100">Manage Projects</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
        </div>

        {/* Mode toggle */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[{ key: "assign", label: "Assign Projects" }, { key: "unassign", label: "Unassign Projects" }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${mode === key ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              {mode === "assign" ? "No unassigned projects available" : "No assigned projects found"}
            </div>
          ) : (
            filtered.map((p) => {
              const sel = selected.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${sel ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600"}`}>
                    {sel && <Check size={11} className="text-white" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                    {p.description && <p className="text-xs text-slate-400 truncate">{p.description}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">{selected.length} selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selected.length}
              className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 ${mode === "assign" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {submitting ? "Saving…" : mode === "assign" ? "Assign" : "Unassign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── User Form Modal ── */
function UserFormModal({ isOpen, onClose, editUser, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [specialKey, setSpecialKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userIsSuperAdmin = editUser && isSuperAdmin(editUser.email);
  const currentIsSuperAdmin = isCurrentUserSuperAdmin();

  useEffect(() => {
    setForm(editUser ? { name: editUser.name, email: editUser.email, password: "", role: editUser.role } : EMPTY_FORM);
    setSpecialKey("");
  }, [editUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editUser && !form.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (userIsSuperAdmin && !specialKey) {
      toast.error("Special key is required for Super Admin changes");
      return;
    }

    setLoading(true);
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        
        await updateUser(editUser.id, payload, userIsSuperAdmin ? specialKey : undefined);
        toast.success("User updated successfully");
      } else {
        await createUser(form);
        toast.success("User created successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
      <input
        type={key === "password" ? (showPassword ? "text" : "password") : type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition ${key === "password" ? "pr-10" : ""}`}
      />
      {key === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editUser ? "Edit User" : "Create User"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {field("Full Name", "name", "text", "John Doe")}
        {field("Email Address", "email", "email", "john@example.com")}
        {field(editUser ? "New Password (optional)" : "Password", "password", "password", "••••••••")}
        
        {userIsSuperAdmin && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <Lock size={16} className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider">Protected Account</p>
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-500/80">
                  Only the Super Admin can update their own details. A special key is required to authorize this action.
                </p>
              </div>
            </div>
            
            {!currentIsSuperAdmin ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
                <AlertTriangle size={12} />
                <span className="text-[10px] font-bold uppercase tracking-tight">You are not allowed to edit Super Admin</span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Special Key (Internal)</label>
                <input
                  type="password"
                  value={specialKey}
                  onChange={(e) => setSpecialKey(e.target.value)}
                  placeholder="Enter special key"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition shadow-inner"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          >
            <option value="ADMIN">Admin</option>
            <option value="DEVELOPER">Developer</option>
            <option value="TESTER">Tester</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
            {loading ? "Saving…" : editUser ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Main Page ── */
export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSpecialKey, setDeleteSpecialKey] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const loadUsers = async (tab = activeTab) => {
    setLoading(true);
    try {
      const res = await TABS.find((t) => t.key === tab).fetch();
      setUsers(res.data || []);
      setPage(0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(activeTab); }, [activeTab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    const isTargetSuper = isSuperAdmin(deleteTarget.email);
    const isSelfSuper = isCurrentUserSuperAdmin();

    if (isTargetSuper && !isSelfSuper) {
      toast.error("You are not allowed to delete Super Admin");
      return;
    }

    if (isTargetSuper && !deleteSpecialKey) {
      toast.error("Special key is required to delete Super Admin");
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id, isTargetSuper ? deleteSpecialKey : undefined);
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      setDeleteSpecialKey("");
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all system users and their roles</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={16} /> New User
        </button>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-slide-up opacity-0" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearch(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === key ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search users…"
              className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton cols={5} rows={7} />
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-slate-400 dark:text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                paged.map((u) => (
                  <tr key={u.id} className={`border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isSuperAdmin(u.email) ? "bg-blue-50/20 dark:bg-blue-900/10" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${isSuperAdmin(u.email) ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"} flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all`}>
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            {u.name}
                            {isSuperAdmin(u.email) && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter border border-amber-200 dark:border-amber-800/60">
                                Super Admin
                              </span>
                            )}
                          </span>
                          {isSuperAdmin(u.email) && <span className="text-[10px] text-amber-500 font-medium">Protected Account</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditTarget(u); setFormModal(true); }}
                          title={isSuperAdmin(u.email) ? "Protected action" : "Edit"}
                          className={`p-1.5 rounded-lg transition-colors ${isSuperAdmin(u.email) ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}
                        >
                          {isSuperAdmin(u.email) ? <Lock size={14} /> : <Pencil size={14} />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title={isSuperAdmin(u.email) ? "Protected action" : "Delete"}
                          className={`p-1.5 rounded-lg transition-colors ${isSuperAdmin(u.email) ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"}`}
                        >
                          <Trash2 size={14} />
                        </button>
                        {u.role === "DEVELOPER" && (
                          <>
                            <button
                              onClick={() => setAssignTarget(u)}
                              title="Assign / Unassign Projects"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              <FolderPlus size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} {search && `matching "${search}"`}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        editUser={editTarget}
        onSaved={() => loadUsers()}
      />

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => { setDeleteTarget(null); setDeleteSpecialKey(""); }}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title={isSuperAdmin(deleteTarget.email) ? "Delete Super Admin?" : "Delete User"}
          confirmText="Delete"
          type="danger"
          message={
            <div className="space-y-4">
              <p>
                {isSuperAdmin(deleteTarget.email) 
                  ? "This is a protected account. Only the Super Admin can delete this account. Please provide the special key to proceed."
                  : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
              </p>
              
              {isSuperAdmin(deleteTarget.email) && isCurrentUserSuperAdmin() && (
                <div className="mt-4 text-left">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Special Key (Required)</label>
                  <input
                    type="password"
                    autoFocus
                    value={deleteSpecialKey}
                    onChange={(e) => setDeleteSpecialKey(e.target.value)}
                    placeholder="Enter special key"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-red-200 dark:border-red-900/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                  />
                </div>
              )}

              {isSuperAdmin(deleteTarget.email) && !isCurrentUserSuperAdmin() && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-tight">Access Denied: Super Admin account is protected</span>
                </div>
              )}
            </div>
          }
        />
      )}

      {assignTarget && (
        <AssignProjectsPanel
          user={assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  );
}
