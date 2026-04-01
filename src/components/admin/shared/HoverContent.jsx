import React from "react";

export function UserHoverContent({ user }) {
  if (!user) return <div className="text-sm text-slate-500 p-1">Not assigned</div>;
  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <p className="text-slate-500 mb-1">Role</p>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {user.role || "USER"}
          </span>
        </div>
        <div>
          <p className="text-slate-500 mb-1">Joined</p>
          <span className="text-slate-700 dark:text-slate-300">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProjectHoverContent({ project }) {
  if (!project) return <div className="text-sm text-slate-500 p-1">No project</div>;
  return (
    <div className="flex flex-col gap-2 p-1">
      <p className="font-semibold text-slate-900 dark:text-slate-100">{project.name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
        {project.description || "No description provided."}
      </p>
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        ID: #{project.id}
      </div>
    </div>
  );
}

export function BugHoverContent({ bug }) {
  if (!bug) return <div className="text-sm text-slate-500 p-1">No bug info</div>;
  return (
    <div className="flex flex-col gap-2 p-1 min-w-[200px]">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate flex-1">{bug.title}</p>
        <span className="text-[10px] font-mono text-slate-400 ml-2">#{bug.id}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{bug.description || "No description"}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          bug.status === 'RESOLVED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
          bug.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}>
          {bug.status}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          bug.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
          bug.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' :
          'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
        }`}>
          {bug.priority}
        </span>
      </div>
    </div>
  );
}

export function BugListHoverContent({ bugs }) {
  if (!bugs || bugs.length === 0) return <div className="text-sm text-slate-500 p-1 font-medium italic">No bugs reported</div>;
  return (
    <div className="flex flex-col gap-3 p-1 max-h-[320px] overflow-y-auto min-w-[260px]">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Associated Bugs</p>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">{bugs.length}</span>
      </div>
      <div className="space-y-3">
        {bugs.map((bug) => (
          <div key={bug.id} className="pb-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 last:pb-0">
            <BugHoverContent bug={bug} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserListHoverContent({ users, title = "Team Members" }) {
  if (!users || users.length === 0) return <div className="text-sm p-3 text-center text-slate-500 italic">No members assigned</div>;
  return (
    <div className="flex flex-col gap-3 p-1 max-h-[320px] overflow-y-auto min-w-[240px]">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">{users.length}</span>
      </div>
      <div className="space-y-1">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-800/20">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tight">{user.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DescriptionHoverContent({ title, description }) {
  return (
    <div className="flex flex-col gap-2 p-1 max-h-[350px] overflow-y-auto min-w-[280px] max-w-[400px]">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
        {title || "Description"}
      </p>
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {description || <span className="italic text-slate-400">No description provided.</span>}
      </div>
    </div>
  );
}
