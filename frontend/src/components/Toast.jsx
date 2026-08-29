import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 border border-emerald-500/40 text-slate-100 rounded-xl shadow-2xl shadow-emerald-950/50 animate-slideUp">
      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <p className="text-xs font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
