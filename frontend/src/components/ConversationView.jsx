import React from 'react';
import { Mail, ArrowUpRight, ArrowDownLeft, Calendar, ShieldCheck } from 'lucide-react';

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ConversationView({ thread, prospectName, company }) {
  if (!thread || thread.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-white">
          <Mail className="w-6 h-6" />
        </div>
        <p className="text-sm text-zinc-400">No messages in this thread.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Thread · {thread.length} message{thread.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 text-white border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vectorized</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {thread.map((msg, index) => {
          const isOut = msg.is_outbound;
          const initials = isOut ? 'ME' : getInitials(msg.sender);

          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 ${isOut ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  isOut ? 'bg-white text-black font-extrabold' : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                {initials}
              </div>

              {/* Bubble */}
              <div
                className={`flex-1 rounded-2xl p-3.5 ${
                  isOut
                    ? 'bg-white/10 border border-white/20 text-white rounded-tr-sm'
                    : 'bg-[#18181b] border border-white/10 text-zinc-200 rounded-tl-sm'
                }`}
                style={{ maxWidth: '90%' }}
              >
                {/* Bubble Header */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white">
                      {msg.sender}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                      {isOut
                        ? <><ArrowUpRight className="w-2.5 h-2.5" />Sent</>
                        : <><ArrowDownLeft className="w-2.5 h-2.5" />Received</>
                      }
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                    <Calendar className="w-2.5 h-2.5" />
                    {msg.date}
                  </span>
                </div>

                {/* Body */}
                <p className="text-xs leading-relaxed whitespace-pre-line text-zinc-300">
                  {msg.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
