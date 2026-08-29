import React from 'react';
import { Mail, ArrowUpRight, ArrowDownLeft, Calendar, ShieldCheck } from 'lucide-react';

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ConversationView({ thread, prospectName, company }) {
  if (!thread || thread.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Mail className="w-6 h-6" style={{ color: '#6366f1' }} />
        </div>
        <p className="text-sm" style={{ color: '#94a3b8' }}>No messages in this thread.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          Thread · {thread.length} message{thread.length !== 1 ? 's' : ''}
        </span>
        <div
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg backdrop-blur-md"
          style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}
        >
          <ShieldCheck className="w-3 h-3" />
          Vectorized
        </div>
      </div>

      {/* Messages */}
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
                className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm"
                style={
                  isOut
                    ? { background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)', backgroundImage: 'linear-gradient(to bottom right, rgba(99,102,241,0.1), rgba(34,211,238,0.05))' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#e8ecf4', border: '1px solid rgba(255,255,255,0.12)', backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.02), rgba(255,255,255,0.05))' }
                }
              >
                {initials}
              </div>

              {/* Bubble */}
              <div
                className={`flex-1 rounded-2xl p-3.5 backdrop-blur-xl ${isOut ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={{
                  background: isOut ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isOut ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                  maxWidth: '90%'
                }}
              >
                {/* Bubble header */}
                <div
                  className="flex items-center justify-between gap-2 mb-2 pb-2"
                  style={{ borderBottom: `1px solid ${isOut ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)'}` }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold" style={{ color: isOut ? '#6366f1' : '#e8ecf4' }}>
                      {msg.sender}
                    </span>
                    <span
                      className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-md"
                      style={
                        isOut
                          ? { background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }
                          : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {isOut
                        ? <><ArrowUpRight className="w-2.5 h-2.5" />Sent</>
                        : <><ArrowDownLeft className="w-2.5 h-2.5" />Received</>
                      }
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.03)', color: '#475569' }}>
                    <Calendar className="w-2.5 h-2.5" />
                    {msg.date}
                  </span>
                </div>

                {/* Body */}
                <p
                  className="text-xs leading-relaxed whitespace-pre-line"
                  style={{ color: isOut ? '#e8ecf4' : '#94a3b8' }}
                >
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
