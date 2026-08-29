import React from 'react';
import {
  X, Building2, Mail, Clock, Sparkles, AlertCircle,
  Flame, ShieldCheck
} from 'lucide-react';
import ConversationView from './ConversationView';
import DraftEditor from './DraftEditor';

function getUrgency(score) {
  if (score >= 9) return { accent: '#ef4444', label: 'CRITICAL', bg: 'rgba(239,68,68,0.1)', ring: 'rgba(239,68,68,0.3)' };
  if (score >= 7) return { accent: '#f97316', label: 'HIGH',     bg: 'rgba(249,115,22,0.1)', ring: 'rgba(249,115,22,0.3)' };
  if (score >= 4) return { accent: '#f59e0b', label: 'MEDIUM',   bg: 'rgba(245,158,11,0.1)', ring: 'rgba(245,158,11,0.3)' };
  return          { accent: '#3b82f6', label: 'LOW',      bg: 'rgba(59,130,246,0.1)',  ring: 'rgba(59,130,246,0.3)' };
}

const SIGNAL_ITEMS = [
  { key: 'buying_intent',        label: 'Buying Intent',   color: '#00d084', fallback: 'High' },
  { key: 'response_lag_days',    label: 'Response Lag',    color: '#f59e0b', suffix: ' days' },
  { key: 'unanswered_promise',   label: 'Broken Promise',  color: '#ef4444', bool: true }
];

export default function LeadDetailModal({ lead, onClose, showToast }) {
  if (!lead) return null;
  const u = getUrgency(lead.urgency);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      style={{ background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(16px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-slideUp"
        style={{
          background: 'rgba(255,255,255,0.035)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* Gradient border wrapper effect */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none" 
          style={{ 
            padding: '1px', 
            background: 'linear-gradient(to bottom right, rgba(255,255,255,0.15), rgba(255,255,255,0.02))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
          }} 
        />
        
        {/* ── Modal header ── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0 relative"
          style={{ 
            background: 'rgba(5, 8, 16, 0.4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            borderLeft: `3px solid ${u.accent}`
          }}
        >
          <div className="flex items-center gap-4">
            {/* Urgency flash */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-extrabold shadow-inner"
              style={{ 
                background: `linear-gradient(135deg, ${u.bg}, rgba(5,8,16,0.5))`, 
                color: u.accent, 
                border: `1px solid ${u.ring}`,
                boxShadow: `inset 0 0 10px ${u.bg}`
              }}
            >
              {lead.urgency}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg font-semibold tracking-tight text-[#e8ecf4] leading-tight">{lead.name}</h2>
                <span className="text-xs" style={{ color: '#475569' }}>·</span>
                <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{lead.role}</span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ml-1 uppercase"
                  style={{ 
                    background: u.bg, 
                    color: u.accent, 
                    border: `1px solid ${u.ring}`,
                    boxShadow: `inset 0 0 8px ${u.bg}`
                  }}
                >
                  {u.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium" style={{ color: '#94a3b8' }}>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />{lead.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />{lead.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />{lead.last_contact}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              color: '#94a3b8', 
              border: '1px solid rgba(255,255,255,0.06)' 
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; 
              e.currentTarget.style.color = '#e8ecf4';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; 
              e.currentTarget.style.color = '#94a3b8'; 
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body: Split view ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto relative z-10"
          style={{ minHeight: 0 }}
        >
          {/* Left pane — Thread */}
          <div
            className="lg:col-span-5 overflow-y-auto p-6"
            style={{ 
              background: 'rgba(5,8,16,0.3)', 
              borderRight: '1px solid rgba(255,255,255,0.06)' 
            }}
          >
            <ConversationView
              thread={lead.thread}
              prospectName={lead.name}
              company={lead.company}
            />
          </div>

          {/* Right pane — AI analysis + Draft */}
          <div className="lg:col-span-7 overflow-y-auto p-6 space-y-6">

            {/* AI Reasoning Card */}
            <div
              className="rounded-xl p-5 space-y-4"
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4" style={{ color: '#6366f1' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>
                    Why Sakha flagged this
                  </span>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: `${u.bg}`, color: u.accent, border: `1px solid ${u.ring}` }}>
                  Urgency {lead.urgency}/10
                </span>
              </div>

              <p className="text-[13px] leading-relaxed" style={{ color: '#e8ecf4' }}>{lead.reason}</p>

              {/* Signal grid */}
              <div
                className="grid grid-cols-3 gap-3 pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {SIGNAL_ITEMS.map(s => {
                  let val, color;
                  if (s.bool) {
                    const v = lead.signals?.[s.key];
                    val = v ? 'Yes — Detected' : 'None';
                    color = v ? s.color : '#94a3b8';
                  } else {
                    val = (lead.signals?.[s.key] ?? s.fallback) + (s.suffix || '');
                    color = s.color;
                  }
                  return (
                    <div
                      key={s.key}
                      className="rounded-lg p-3 transition-colors"
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(8px)'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                      <span className="block text-[10px] uppercase font-semibold tracking-wider mb-1" style={{ color: '#475569' }}>{s.label}</span>
                      <span className="text-[13px] font-medium" style={{ color }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tactical next action */}
            <div
              className="relative rounded-xl p-5 overflow-hidden"
              style={{ 
                background: 'linear-gradient(to right, rgba(34,211,238,0.03), rgba(16,185,129,0.03))'
              }}
            >
              <div 
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                  padding: '1px',
                  background: 'linear-gradient(to right, rgba(34,211,238,0.3), rgba(16,185,129,0.3))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }}
              />
              <div className="flex items-center gap-2.5 mb-2 relative z-10">
                <Sparkles className="w-4 h-4" style={{ color: '#22d3ee' }} />
                <span className="text-xs font-bold uppercase tracking-widest bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #22d3ee, #10b981)' }}>
                  Recommended move
                </span>
              </div>
              <p className="text-[13px] leading-relaxed font-medium relative z-10" style={{ color: '#e8ecf4' }}>
                {lead.next_action}
              </p>
            </div>

            {/* AI Draft Editor */}
            <DraftEditor lead={lead} onDraftCreated={() => {}} showToast={showToast} />

          </div>
        </div>
      </div>
    </div>
  );
}
