import React from 'react';
import {
  X, Building2, Mail, Clock, Sparkles, AlertCircle,
  Flame, ShieldCheck
} from 'lucide-react';
import ConversationView from './ConversationView';
import DraftEditor from './DraftEditor';

export default function LeadDetailModal({ lead, onClose, showToast, theme = 'dark' }) {
  if (!lead) return null;
  const isDark = theme === 'dark';
  const isCritical = lead.urgency >= 9;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      style={{
        background: isDark ? 'rgba(5, 5, 8, 0.88)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)'
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden animate-slideUp border shadow-2xl ${
          isDark
            ? 'bg-[#121214] border-white/15 text-white'
            : 'bg-white border-black/10 text-black'
        }`}
        style={{
          boxShadow: isDark
            ? '0 30px 60px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)'
            : '0 30px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)'
        }}
      >
        {/* ── Modal Header ── */}
        <div
          className={`flex items-center justify-between px-7 py-5 shrink-0 border-b ${
            isDark ? 'border-white/10 bg-[#161619]' : 'border-black/10 bg-[#f8f8fa]'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Urgency Score Pill */}
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-base font-black shadow-sm ${
                isCritical
                  ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                  : isDark
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-black/5 text-black border border-black/15'
              }`}
            >
              {lead.urgency}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg font-bold tracking-tight leading-tight">
                  {lead.name}
                </h2>
                <span className="opacity-40">·</span>
                <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{lead.role}</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ml-1 uppercase border ${
                    isCritical
                      ? 'bg-red-500/20 text-red-500 border-red-500/30'
                      : isDark
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-black/5 text-black border-black/15'
                  }`}
                >
                  {isCritical ? 'CRITICAL' : lead.urgency >= 7 ? 'HIGH' : lead.urgency >= 4 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
              <div className={`flex items-center gap-4 text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 opacity-60" />{lead.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 opacity-60" />{lead.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-60" />{lead.last_contact}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`btn-3d w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-zinc-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body: Split Pane View ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          {/* Left Pane — Thread History */}
          <div className={`lg:col-span-5 overflow-y-auto p-6 border-r ${
            isDark ? 'border-white/10 bg-[#0e0e11]' : 'border-black/10 bg-[#fbfbfd]'
          }`}>
            <ConversationView
              thread={lead.thread}
              prospectName={lead.name}
              company={lead.company}
            />
          </div>

          {/* Right Pane — AI Analysis & Draft Studio */}
          <div className={`lg:col-span-7 overflow-y-auto p-6 space-y-6 ${
            isDark ? 'bg-[#141417]' : 'bg-[#ffffff]'
          }`}>

            {/* AI Reasoning Context Card */}
            <div className={`rounded-2xl p-5 space-y-4 border ${
              isDark ? 'bg-[#18181b] border-white/10' : 'bg-[#f4f4f6] border-black/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Why Sakha Flagged This Lead
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${
                  isDark ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'
                }`}>
                  Urgency {lead.urgency}/10
                </span>
              </div>

              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{lead.reason}</p>

              {/* Signals Grid */}
              <div className={`grid grid-cols-3 gap-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold opacity-60">Buying Intent</span>
                  <div className="text-xs font-bold">{lead.signals?.buying_intent || 'High'}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold opacity-60">Response Lag</span>
                  <div className="text-xs font-bold text-amber-500">{(lead.signals?.response_lag_days ?? 2) + ' days'}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold opacity-60">Broken Promise</span>
                  <div className={`text-xs font-bold ${lead.signals?.unanswered_promise ? 'text-red-500' : 'opacity-70'}`}>
                    {lead.signals?.unanswered_promise ? 'Yes — Detected' : 'None'}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Draft Studio Component */}
            <DraftEditor
              lead={lead}
              onDraftCreated={() => {}}
              showToast={showToast}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
