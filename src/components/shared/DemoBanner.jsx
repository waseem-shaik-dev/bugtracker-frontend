import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { isDemoMode } from "../../utils/demoMode";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("demoBannerDismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  if (!isDemoMode() || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem("demoBannerDismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-blue-500/15 to-emerald-500/15 border-b border-amber-500/20 dark:border-amber-500/30 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 justify-center sm:justify-start">
        <span className="flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Demo Environment
        </span>
        <span className="truncate text-[12px] opacity-90">
          This is a demonstration environment. Changes are made only for demonstration purposes.
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors shrink-0"
        title="Dismiss demo banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}
