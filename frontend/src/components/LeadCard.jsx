import React from 'react';
import { 
  Building2, 
  Mail, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function LeadCard({ lead, onSelectLead, onQuickDraft }) {
  const getUrgencyBadge = (score) => {
    if (score >= 9) {
      return {
        bg: 'bg-red-500/10 text-red-400 border-red-500/30',
        bar: 'bg-red-500',
        label: 'CRITICAL',
        dot: 'bg-red-500'
      };
    } else if (score >= 7) {
      return {
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        bar: 'bg-orange-500',
        label: 'HIGH PRIORITY',
        dot: 'bg-orange-500'
      };
    } else if (score >= 4) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        bar: 'bg-amber-500',
        label: 'MEDIUM',
        dot: 'bg-amber-500'
      };
    } else {
      return {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        bar: 'bg-blue-500',
        label: 'LOW / NURTURE',
        dot: 'bg-blue-500'
      };
    }
  };

  const badge = getUrgencyBadge(lead.urgency);

  return (
    <div className="group relative rounded-xl glass-card p-5 transition-all duration-200 hover:bg-slate-900/90 hover:border-slate-700/80 hover:shadow-xl hover:shadow-slate-950/40 flex flex-col justify-between">
      
      <div>
        {/* Top Header: Contact Info + Urgency Score Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                {lead.name}
              </h3>
              <span className="text-xs text-slate-400">· {lead.role}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {lead.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {lead.last_contact}
              </span>
              {lead.deal_size && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-emerald-400">
                    {lead.deal_size}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Urgency Pill & Score */}
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${badge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
              <span>{lead.urgency} / 10</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              {badge.label}
            </span>
          </div>
        </div>

        {/* Category Pill */}
        <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
            {lead.category}
          </span>
          {lead.status === 'Awaiting Response' && (
            <span className="px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[11px] font-semibold border border-red-500/20">
              Waiting on Us
            </span>
          )}
          {lead.signals?.unanswered_promise && (
            <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[11px] font-semibold border border-orange-500/20">
              Broken Promise Flag
            </span>
          )}
        </div>

        {/* WHY: AI Explainable Reasoning Box */}
        <div className="mb-3.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Why Sakha flagged this:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lead.reason}
          </p>
        </div>

        {/* WHAT: Tactical Next Action */}
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Action:</span>
          </div>
          <p className="text-xs text-emerald-200/90 font-medium">
            {lead.next_action}
          </p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-1">
        <button
          onClick={() => onSelectLead(lead)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          <span>View Conversation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onQuickDraft(lead)}
          className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm shadow-emerald-950 transition-all hover:shadow-emerald-900/30 active:scale-95"
          title="Review and generate Gmail draft"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prepare Draft</span>
        </button>
      </div>

    </div>
  );
}
