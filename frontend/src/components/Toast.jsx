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
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl animate-slideUp"
      style={{
        background: 'rgba(13,17,23,0.97)',
        border: '1px solid rgba(0,208,132,0.25)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,208,132,0.1)',
        backdropFilter: 'blur(16px)',
        maxWidth: '360px'
      }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.25)' }}
      >
        <CheckCircle2 className="w-4 h-4" style={{ color: '#00d084' }} />
      </div>
      <p className="text-xs font-semibold flex-1" style={{ color: '#f0f4fc' }}>{message}</p>
      <button
        onClick={onClose}
        className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors shrink-0"
        style={{ color: '#4a5568' }}
        onMouseEnter={e => e.currentTarget.style.color = '#f0f4fc'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a5568'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
