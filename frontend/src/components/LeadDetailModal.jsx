import React from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Flame,
  ShieldCheck
} from 'lucide-react';
import ConversationView from './ConversationView';
import DraftEditor from './DraftEditor';

export default function LeadDetailModal({ lead, onClose, showToast }) {
  if (!lead) return null;

  const getUrgencyBadge = (score) => {
    if (score >= 9) return { bg: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'CRITICAL' };
    if (score >= 7) return { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', label: 'HIGH' };
    if (score >= 4) return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'MEDIUM' };
    return { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30', label: 'LOW' };
  };

  const badge = getUrgencyBadge(lead.urgency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white">
                  {lead.name}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  · {lead.role}
                </span>
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${badge.bg}`}>
                  {lead.urgency}/10 {badge.label}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {lead.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {lead.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Last contact {lead.last_contact}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Pane (5 Cols): Email Thread Timeline */}
          <div className="lg:col-span-5 p-5 overflow-y-auto bg-slate-950/30">
            <ConversationView 
              thread={lead.thread} 
              prospectName={lead.name}
              company={lead.company}
            />
          </div>

          {/* Right Pane (7 Cols): Sakha AI Copilot Analysis & Draft Composer */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-5 bg-slate-900/40">
            
            {/* AI Reasoning Summary */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Flame className="w-4 h-4" />
                  <span>Why Sakha Flagged This Lead</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Urgency: {lead.urgency}/10
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {lead.reason}
              </p>

              {/* Detected Signals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block">Buying Intent:</span>
                  <span className="font-semibold text-emerald-400">{lead.signals?.buying_intent || 'High'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block">Response Lag:</span>
                  <span className="font-semibold text-amber-400">{lead.signals?.response_lag_days || 3} days</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block">Broken Promise:</span>
                  <span className={`font-semibold ${lead.signals?.unanswered_promise ? 'text-red-400' : 'text-slate-400'}`}>
                    {lead.signals?.unanswered_promise ? 'Yes (Detected)' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tactical Next Action */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Recommended Tactical Move</span>
              </div>
              <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                {lead.next_action}
              </p>
            </div>

            {/* AI Draft Editor Component */}
            <DraftEditor 
              lead={lead} 
              onDraftCreated={() => {}}
              showToast={showToast}
            />

          </div>

        </div>

      </div>

    </div>
  );
}
