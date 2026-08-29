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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden animate-slideUp"
        style={{
          background: 'rgba(13,17,23,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.5), 0 30px 100px rgba(0,0,0,0.85)'
        }}
      >
        {/* ── Modal header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-4">
            {/* Urgency flash */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-extrabold"
              style={{ background: u.bg, color: u.accent, border: `1px solid ${u.ring}` }}
            >
              {lead.urgency}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white leading-tight">{lead.name}</h2>
                <span className="text-xs" style={{ color: '#4a5568' }}>·</span>
                <span className="text-xs" style={{ color: '#8b98b4' }}>{lead.role}</span>
                <span
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide"
                  style={{ background: u.bg, color: u.accent, border: `1px solid ${u.ring}` }}
                >
                  {u.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[11px]" style={{ color: '#4a5568' }}>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />{lead.company}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />{lead.email}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{lead.last_contact}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all focus-ring"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8b98b4', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8b98b4'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body: Split view ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          {/* Left pane — Thread */}
          <div
            className="lg:col-span-5 overflow-y-auto p-5"
            style={{ background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ConversationView
              thread={lead.thread}
              prospectName={lead.name}
              company={lead.company}
            />
          </div>

          {/* Right pane — AI analysis + Draft */}
          <div className="lg:col-span-7 overflow-y-auto p-6 space-y-5">

            {/* AI Reasoning Card */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: '#f59e0b' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                    Why Sakha flagged this
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg" style={{ background: `${u.bg}`, color: u.accent }}>
                  Urgency {lead.urgency}/10
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: '#c9d1e0' }}>{lead.reason}</p>

              {/* Signal grid */}
              <div
                className="grid grid-cols-3 gap-2 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                {SIGNAL_ITEMS.map(s => {
                  let val, color;
                  if (s.bool) {
                    const v = lead.signals?.[s.key];
                    val = v ? 'Yes — Detected' : 'None';
                    color = v ? s.color : '#4a5568';
                  } else {
                    val = (lead.signals?.[s.key] ?? s.fallback) + (s.suffix || '');
                    color = s.color;
                  }
                  return (
                    <div
                      key={s.key}
                      className="rounded-xl p-2.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <span className="block text-[10px] mb-0.5" style={{ color: '#4a5568' }}>{s.label}</span>
                      <span className="text-xs font-semibold" style={{ color }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tactical next action */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(0,208,132,0.05)', border: '1px solid rgba(0,208,132,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4" style={{ color: '#00d084' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00d084' }}>
                  Recommended move
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium" style={{ color: 'rgba(0,208,132,0.85)' }}>
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
