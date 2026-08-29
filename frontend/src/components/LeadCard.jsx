import React from 'react';
import {
  Building2, Clock, ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';

function getUrgency(score) {
  if (score >= 9) return { accent: '#ef4444', label: 'CRITICAL',  bg: 'rgba(239,68,68,0.08)',   ring: 'rgba(239,68,68,0.25)' };
  if (score >= 7) return { accent: '#f97316', label: 'HIGH',       bg: 'rgba(249,115,22,0.08)',  ring: 'rgba(249,115,22,0.25)' };
  if (score >= 4) return { accent: '#f59e0b', label: 'MEDIUM',     bg: 'rgba(245,158,11,0.08)',  ring: 'rgba(245,158,11,0.25)' };
  return          { accent: '#3b82f6', label: 'LOW',          bg: 'rgba(59,130,246,0.08)',   ring: 'rgba(59,130,246,0.25)' };
}

// Initials avatar color palette
const AVATAR_COLORS = [
  '#00d084','#f97316','#3b82f6','#a855f7','#f59e0b','#ef4444','#06b6d4'
];
function getInitials(name = '') {
  return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}
function getAvatarColor(name = '') {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function LeadCard({ lead, onSelectLead, onQuickDraft }) {
  const u = getUrgency(lead.urgency);
  const initials = getInitials(lead.name);
  const avatarColor = getAvatarColor(lead.name);

  // Progress bar width for urgency
  const barWidth = `${lead.urgency * 10}%`;

  return (
    <div
      className="relative group rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 card-hover overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 1px rgba(0,0,0,0.4)'
      }}
    >
      {/* Subtle top gradient bar (urgency color) */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-300"
        style={{ background: `linear-gradient(90deg, ${u.accent}66, transparent)` }}
      />

      {/* ── Row 1: Avatar + name + score ── */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: `${avatarColor}22`, color: avatarColor, border: `1px solid ${avatarColor}33` }}
        >
          {initials}
        </div>

        {/* Name + role + company */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold leading-tight text-white group-hover:text-white truncate">
              {lead.name}
            </h3>
            <span className="text-[11px] truncate" style={{ color: '#4a5568' }}>
              {lead.role}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <Building2 className="w-3 h-3 shrink-0" style={{ color: '#4a5568' }} />
            <span className="text-xs font-medium truncate" style={{ color: '#8b98b4' }}>
              {lead.company}
            </span>
            {lead.deal_size && (
              <>
                <span style={{ color: '#4a5568' }}>·</span>
                <span className="text-xs font-semibold" style={{ color: '#00d084' }}>
                  {lead.deal_size}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Urgency badge */}
        <div
          className="flex flex-col items-end shrink-0"
        >
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
            style={{ background: u.bg, color: u.accent, border: `1px solid ${u.ring}` }}
          >
            <span className="text-base font-extrabold leading-none">{lead.urgency}</span>
            <span className="text-[10px] opacity-70">/10</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest mt-0.5" style={{ color: u.accent }}>
            {u.label}
          </span>
        </div>
      </div>

      {/* Urgency progress bar */}
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: barWidth, background: `linear-gradient(90deg, ${u.accent}, ${u.accent}88)` }}
        />
      </div>

      {/* ── Tags row ── */}
      <div className="flex items-center gap-1.5 flex-wrap -mt-1">
        <span
          className="px-2 py-0.5 rounded-md text-[11px] font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#8b98b4', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {lead.category}
        </span>
        {lead.status === 'Awaiting Response' && (
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Waiting on Us
          </span>
        )}
        {lead.signals?.unanswered_promise && (
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            Broken Promise
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto" style={{ color: '#4a5568' }}>
          <Clock className="w-3 h-3" />
          <span className="text-[11px]">{lead.last_contact}</span>
        </div>
      </div>

      {/* ── WHY box ── */}
      <div
        className="rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#f59e0b' }}>
            Sakha flagged:
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#8b98b4' }}>
          {lead.reason}
        </p>
      </div>

      {/* ── NEXT ACTION box ── */}
      <div
        className="rounded-xl p-3"
        style={{ background: 'rgba(0,208,132,0.05)', border: '1px solid rgba(0,208,132,0.12)' }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d084' }} />
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#00d084' }}>
            Next action:
          </span>
        </div>
        <p className="text-xs font-medium leading-relaxed" style={{ color: 'rgba(0,208,132,0.85)' }}>
          {lead.next_action}
        </p>
      </div>

      {/* ── CTA Row ── */}
      <div
        className="flex gap-2 pt-1 mt-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => onSelectLead(lead)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#c9d1e0', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#c9d1e0'; }}
        >
          <span>View Thread</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onQuickDraft(lead)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #00d084, #00a86b)',
            boxShadow: '0 4px 16px rgba(0,208,132,0.2)'
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,208,132,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,208,132,0.2)'; e.currentTarget.style.transform = ''; }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Draft</span>
        </button>
      </div>
    </div>
  );
}
