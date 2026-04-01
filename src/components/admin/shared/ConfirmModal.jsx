import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger",
  loading = false
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 animate-modal-in overflow-hidden">
        
        {/* Subtle background glow */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isDanger ? "bg-red-500" : "bg-amber-500"} opacity-50`} />

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl ${isDanger ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-amber-50 dark:bg-amber-900/20 text-amber-500"} flex items-center justify-center mb-6 shadow-sm`}>
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>

          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h2>
          
          <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-8 whitespace-pre-wrap">
            {message}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent active:scale-[0.98] disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center ${
                isDanger 
                  ? "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none" 
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
