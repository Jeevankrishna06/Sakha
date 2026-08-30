import React, { useRef, useState } from 'react';
import { Building2, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LeadCard({ lead, onSelectLead, onQuickDraft, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const isCritical = lead.urgency >= 9;
  const barWidth = `${lead.urgency * 10}%`;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovered: false });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12; // tilt angle max 6deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setMousePos({ x, y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, isHovered: false });
  };

  const initials = lead.name
    ? lead.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '??';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 w-full"
    >
      <div
        className={`rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between gap-4 relative transform-style-3d ${
          isDark
            ? isCritical
              ? 'bg-[#141214] border border-red-500/40 text-white'
              : 'bg-[#121214] border border-white/10 text-white'
            : isCritical
              ? 'bg-white border border-red-500/40 text-black shadow-md'
              : 'bg-white border border-black/10 text-black shadow-md'
        }`}
        style={{
          transform: mousePos.isHovered
            ? `rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) translateY(-8px) scale(1.02)`
            : 'rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
          boxShadow: isDark
            ? mousePos.isHovered
              ? isCritical
                ? '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 20px rgba(239, 68, 68, 0.15)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.15)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : mousePos.isHovered
              ? isCritical
                ? '0 25px 50px -12px rgba(239, 68, 68, 0.2), 0 10px 20px rgba(0,0,0,0.08)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.1)'
              : '0 6px 20px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)'
        }}
      >
        {/* ── 3D Floating Avatar + Info + Score ── */}
        <div className="flex items-start gap-3.5 translate-z-20">
          {/* 3D Embossed Avatar */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black shadow-md ${
              isDark
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-black/5 text-black border border-black/15'
            }`}
            style={{
              boxShadow: isDark
                ? '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
            }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className={`text-base font-extrabold tracking-tight truncate ${isDark ? 'text-white' : 'text-black'}`}>
                {lead.name}
              </h3>
              <span className={`text-xs truncate font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {lead.role}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs">
              <Building2 className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <span className={`truncate font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{lead.company}</span>
              {lead.deal_size && (
                <>
                  <span className="text-zinc-400">·</span>
                  <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {lead.deal_size}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 3D Urgency Badge (Red if Critical, Monochrome otherwise) */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black shadow-sm ${
                isCritical
                  ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                  : isDark
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-black/5 text-black border border-black/15'
              }`}
              style={{
                boxShadow: isCritical
                  ? '0 4px 12px rgba(239,68,68,0.2)'
                  : isDark
                    ? '0 4px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 4px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)'
              }}
            >
              <span className="text-sm font-black">{lead.urgency}</span>
              <span className="text-[9px] opacity-60 font-bold uppercase">/10</span>
            </div>
            <span
              className={`text-[9px] font-extrabold tracking-widest mt-1 uppercase ${
                isCritical ? 'text-red-500' : isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              {isCritical ? 'CRITICAL' : lead.urgency >= 7 ? 'HIGH' : lead.urgency >= 4 ? 'MEDIUM' : 'LOW'}
            </span>
          </div>
        </div>

        {/* Progress Bar (Red if Critical, Monochrome otherwise) */}
        <div className={`h-[3px] rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCritical ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : isDark ? 'bg-white' : 'bg-black'
            }`}
            style={{ width: barWidth }}
          />
        </div>

        {/* Signal Tags (Black & White with Critical / Continued exceptions) */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] translate-z-10">
          <span className={`px-2.5 py-0.5 rounded-lg font-medium border ${
            isDark ? 'bg-white/5 text-zinc-300 border-white/10' : 'bg-black/5 text-zinc-700 border-black/10'
          }`}>
            {lead.category}
          </span>
          
          {/* Continued Exception (Amber) */}
          {lead.status === 'Awaiting Response' && (
            <span className="px-2.5 py-0.5 rounded-lg font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Awaiting Reply
            </span>
          )}

          {/* Critical Exception (Red) */}
          {lead.signals?.unanswered_promise && (
            <span className="px-2.5 py-0.5 rounded-lg font-bold bg-red-500/15 text-red-500 border border-red-500/30">
              Broken Promise
            </span>
          )}

          <div className={`flex items-center gap-1 ml-auto text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Clock className="w-3 h-3" />
            <span>{lead.last_contact}</span>
          </div>
        </div>

        {/* Flag Reason Context Box with 3D Depth */}
        <div
          className={`p-3.5 rounded-2xl border text-xs space-y-1 translate-z-10 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/10'
          }`}
          style={{
            boxShadow: isDark
              ? 'inset 0 1px 2px rgba(0,0,0,0.4)'
              : 'inset 0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div className={`flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            <AlertCircle className="w-3 h-3 text-current" />
            <span>Context & Intent</span>
          </div>
          <p className={`leading-relaxed font-normal ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {lead.reason}
          </p>
        </div>

        {/* Recommended Action Box with 3D Depth */}
        <div
          className={`p-3.5 rounded-2xl border text-xs space-y-1 translate-z-20 ${
            isDark ? 'bg-white/[0.06] border-white/15' : 'bg-black/[0.04] border-black/15'
          }`}
          style={{
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)'
          }}
        >
          <div className={`flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            <Sparkles className="w-3 h-3 text-current" />
            <span>Recommended Next Step</span>
          </div>
          <p className={`font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-black'}`}>
            {lead.next_action}
          </p>
        </div>

        {/* Action Buttons (3D Tactile Push Buttons) */}
        <div className="flex items-center gap-2 pt-1 mt-auto translate-z-30">
          <button
            onClick={() => onSelectLead(lead)}
            className={`btn-3d flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-white border-white/15'
                : 'bg-black/5 hover:bg-black/10 text-black border-black/15'
            }`}
          >
            <span>View Thread</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            onClick={() => onQuickDraft(lead)}
            className={`btn-3d flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-100'
                : 'bg-black text-white hover:bg-zinc-800'
            }`}
            style={{
              boxShadow: isDark
                ? '0 4px 12px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.4)'
                : '0 4px 12px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
}
