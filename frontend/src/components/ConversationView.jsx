import React from 'react';
import { Mail, ArrowUpRight, ArrowDownLeft, User, Calendar, ShieldCheck } from 'lucide-react';

export default function ConversationView({ thread, prospectName, company }) {
  if (!thread || thread.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No email messages found in this thread.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-semibold text-slate-300">
          Email Conversation Thread ({thread.length} messages)
        </span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          Cleaned & Vectorized
        </span>
      </div>

      <div className="space-y-3.5">
        {thread.map((msg, index) => {
          const isOutbound = msg.is_outbound;
          return (
            <div
              key={msg.id || index}
              className={`rounded-xl p-4 transition-all border ${
                isOutbound 
                  ? 'bg-slate-900/50 border-slate-800/80 ml-4' 
                  : 'bg-slate-950/80 border-slate-800 mr-4'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isOutbound ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isOutbound ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      {msg.sender}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                      &lt;{msg.sender_email}&gt;
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{msg.date}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {msg.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
