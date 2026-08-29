import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl animate-slideUp transition-all"
      style={{
        background: 'rgba(5,8,16,0.85)',
        border: '1px solid rgba(34,211,238,0.2)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        maxWidth: '360px'
      }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(99,102,241,0.2))',
          border: '1px solid rgba(34,211,238,0.3)'
        }}
      >
        <CheckCircle2 className="w-4 h-4" style={{ color: '#22d3ee' }} />
      </div>
      <p className="text-xs font-semibold flex-1" style={{ color: '#e8ecf4' }}>{message}</p>
      <button
        onClick={onClose}
        className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors shrink-0"
        style={{ color: '#94a3b8' }}
        onMouseEnter={e => e.currentTarget.style.color = '#e8ecf4'}
        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
