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
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Mail className="w-6 h-6" style={{ color: '#4a5568' }} />
        </div>
        <p className="text-sm" style={{ color: '#4a5568' }}>No messages in this thread.</p>
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
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b98b4' }}>
          Thread · {thread.length} message{thread.length !== 1 ? 's' : ''}
        </span>
        <div
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg"
          style={{ background: 'rgba(0,208,132,0.07)', color: '#00d084', border: '1px solid rgba(0,208,132,0.15)' }}
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
                className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={
                  isOut
                    ? { background: 'rgba(0,208,132,0.12)', color: '#00d084', border: '1px solid rgba(0,208,132,0.2)' }
                    : { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }
                }
              >
                {initials}
              </div>

              {/* Bubble */}
              <div
                className={`flex-1 rounded-2xl p-3.5 ${isOut ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={{
                  background: isOut ? 'rgba(0,208,132,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isOut ? 'rgba(0,208,132,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  maxWidth: '90%'
                }}
              >
                {/* Bubble header */}
                <div
                  className="flex items-center justify-between gap-2 mb-2 pb-2"
                  style={{ borderBottom: `1px solid ${isOut ? 'rgba(0,208,132,0.1)' : 'rgba(255,255,255,0.05)'}` }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold" style={{ color: isOut ? '#00d084' : '#f0f4fc' }}>
                      {msg.sender}
                    </span>
                    <span
                      className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md"
                      style={
                        isOut
                          ? { background: 'rgba(0,208,132,0.1)', color: '#00d084' }
                          : { background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }
                      }
                    >
                      {isOut
                        ? <><ArrowUpRight className="w-2.5 h-2.5" />Sent</>
                        : <><ArrowDownLeft className="w-2.5 h-2.5" />Received</>
                      }
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#2d3748' }}>
                    <Calendar className="w-2.5 h-2.5" />
                    {msg.date}
                  </span>
                </div>

                {/* Body */}
                <p
                  className="text-xs leading-relaxed whitespace-pre-line"
                  style={{ color: isOut ? 'rgba(0,208,132,0.85)' : '#8b98b4' }}
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
