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
      className="relative group rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.1), 0 12px 30px -10px ${u.accent}33, 0 4px 20px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.4)';
      }}
    >
      {/* Subtle top gradient bar (urgency color) */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 opacity-80 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${u.accent}, transparent)` }}
      />

      {/* ── Row 1: Avatar + name + score ── */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 p-[2px]"
          style={{ background: `linear-gradient(135deg, ${avatarColor}99, rgba(255,255,255,0.05))` }}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
               style={{ background: '#050810', color: avatarColor }}>
            {initials}
          </div>
        </div>

        {/* Name + role + company */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold leading-tight truncate" style={{ color: '#e8ecf4' }}>
              {lead.name}
            </h3>
            <span className="text-xs truncate font-medium" style={{ color: '#94a3b8' }}>
              {lead.role}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#475569' }} />
            <span className="text-[13px] font-normal truncate" style={{ color: '#94a3b8' }}>
              {lead.company}
            </span>
            {lead.deal_size && (
              <>
                <span style={{ color: '#475569' }}>·</span>
                <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                  {lead.deal_size}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Urgency badge */}
        <div className="flex flex-col items-end shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm"
            style={{ 
              background: u.bg, 
              color: u.accent, 
              border: `1px solid ${u.ring}`,
              boxShadow: `inset 0 0 12px ${u.accent}15`
            }}
          >
            <span className="text-lg font-black leading-none">{lead.urgency}</span>
            <span className="text-[10px] opacity-70 font-bold uppercase tracking-wider">/10</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] mt-1.5" style={{ color: u.accent }}>
            {u.label}
          </span>
        </div>
      </div>

      {/* Urgency progress bar */}
      <div className="h-[3px] rounded-full overflow-hidden mt-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 relative"
          style={{ 
            width: barWidth, 
            background: `linear-gradient(90deg, ${u.accent}66, ${u.accent})`,
            boxShadow: `0 0 10px ${u.accent}80` 
          }}
        />
      </div>

      {/* ── Tags row ── */}
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: 'rgba(255,255,255,0.035)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {lead.category}
        </span>
        {lead.status === 'Awaiting Response' && (
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Waiting on Us
          </span>
        )}
        {lead.signals?.unanswered_promise && (
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            Broken Promise
          </span>
        )}
        <div className="flex items-center gap-1.5 ml-auto font-medium" style={{ color: '#475569' }}>
          <Clock className="w-3 h-3" />
          <span className="text-[11px] text-[#94a3b8]">{lead.last_contact}</span>
        </div>
      </div>

      <div className="w-full h-px my-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* ── WHY box ── */}
      <div
        className="rounded-r-xl rounded-l-sm p-3 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(90deg, rgba(245,158,11,0.08), rgba(255,255,255,0.02))', 
          border: '1px solid rgba(255,255,255,0.04)',
          borderLeft: '3px solid #f59e0b'
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
            Sakha flagged
          </span>
        </div>
        <p className="text-[13px] leading-relaxed font-medium" style={{ color: '#94a3b8' }}>
          {lead.reason}
        </p>
      </div>

      {/* ── NEXT ACTION box ── */}
      <div
        className="rounded-r-xl rounded-l-sm p-3 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(255,255,255,0.02))', 
          border: '1px solid rgba(255,255,255,0.04)',
          borderLeft: '3px solid #6366f1'
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#22d3ee' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#22d3ee' }}>
            Next action
          </span>
        </div>
        <p className="text-[13px] font-medium leading-relaxed" style={{ color: '#e8ecf4' }}>
          {lead.next_action}
        </p>
      </div>

      {/* ── CTA Row ── */}
      <div
        className="flex gap-3 pt-2 mt-auto"
      >
        <button
          onClick={() => onSelectLead(lead)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{ 
            background: 'rgba(255,255,255,0.035)', 
            color: '#e8ecf4', 
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; 
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'; 
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; 
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; 
          }}
        >
          <span>View Thread</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          onClick={() => onQuickDraft(lead)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.4)'; 
            e.currentTarget.style.transform = 'translateY(-1px)'; 
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25)'; 
            e.currentTarget.style.transform = ''; 
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Draft</span>
        </button>
      </div>
    </div>
  );
}
