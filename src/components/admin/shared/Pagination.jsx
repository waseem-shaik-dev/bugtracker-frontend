import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn = "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  const active = "bg-blue-600 text-white shadow-sm";
  const inactive = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
  const arrow = "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-1">
      <button
        className={`${btn} ${arrow}`}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        <ChevronLeft size={16} />
      </button>

      {start > 0 && (
        <>
          <button className={`${btn} ${inactive}`} onClick={() => onPageChange(0)}>1</button>
          {start > 1 && <span className="text-slate-400 px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${btn} ${p === page ? active : inactive}`}
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="text-slate-400 px-1">…</span>}
          <button className={`${btn} ${inactive}`} onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className={`${btn} ${arrow}`}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
