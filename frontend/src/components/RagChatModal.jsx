import React, { useState, useRef, useEffect } from 'react';
import {
  X, Sparkles, Bot, User, Building2, Send, RefreshCw, ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';

const SAMPLE_QUERIES = [
  'Which prospects need pricing follow-up?',
  "Who hasn't replied in 3+ days?",
  'Which leads asked for a demo?',
  'Summarize top deals by urgency.'
];

export default function RagChatModal({ isOpen, onClose, onSelectLeadById }) {
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{
    id: 'welcome',
    sender: 'agent',
    text: "Hi! I'm Sakha — your RAG sales intelligence copilot. I've indexed your Gmail threads into local vector memory.\n\nAsk me anything about active deals, overdue follow-ups, or prospect discussions.",
    sources: []
  }]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (text) => {
    const q = (text || query).trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { id: `u_${Date.now()}`, sender: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await apiService.queryChat(q);
      setMessages(prev => [...prev, {
        id: `a_${Date.now()}`,
        sender: 'agent',
        text: res.response,
        sources: res.sources || []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        sender: 'agent',
        text: "I couldn't process that query. Make sure the backend RAG pipeline is running.",
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end animate-fadeIn"
      style={{ background: 'rgba(5, 8, 16, 0.75)', backdropFilter: 'blur(12px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer */}
      <div
        className="flex flex-col w-full max-w-md h-full animate-slideUp relative"
        style={{
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid',
          borderImageSource: 'linear-gradient(to bottom, rgba(99,102,241,0.8), rgba(34,211,238,0.4), rgba(5,8,16,0))',
          borderImageSlice: 1,
          boxShadow: '-20px 0 80px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0 relative z-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', opacity: 0.2 }} />
              <div className="absolute inset-0" style={{ border: '1px solid rgba(99,102,241,0.5)', borderRadius: '0.75rem' }} />
              <Sparkles className="w-4.5 h-4.5" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8ecf4] leading-tight tracking-wide">Ask Sakha</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>RAG Semantic Search · Gmail Corpus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.035)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8ecf4'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Fade Gradient */}
        <div className="absolute top-[68px] left-0 right-0 h-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(5,8,16,0.8), transparent)' }} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 relative">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden"
              >
                {msg.sender === 'agent' ? (
                  <>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.1))' }} />
                    <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(34,211,238,0.4)', borderRadius: '9999px' }} />
                    <Bot className="w-4 h-4" style={{ color: '#22d3ee' }} />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' }} />
                    <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(99,102,241,0.4)', borderRadius: '9999px' }} />
                    <User className="w-4 h-4" style={{ color: '#6366f1' }} />
                  </>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[82%] p-3.5 text-[13px] leading-relaxed shadow-sm relative overflow-hidden ${
                  msg.sender === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'
                }`}
                style={
                  msg.sender === 'user'
                    ? { 
                        background: 'rgba(99,102,241,0.15)', 
                        color: '#e8ecf4', 
                        border: '1px solid rgba(99,102,241,0.25)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
                      }
                    : { 
                        background: 'rgba(255,255,255,0.035)', 
                        color: '#e8ecf4', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)'
                      }
                }
              >
                <div className="whitespace-pre-line relative z-10">{msg.text}</div>

                {/* Sources */}
                {msg.sources?.length > 0 && (
                  <div className="mt-3 pt-3 space-y-1.5 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: '#94a3b8' }}>
                      Sources
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-default"
                          style={{ background: 'rgba(255,255,255,0.035)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8ecf4'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <Building2 className="w-3 h-3" style={{ color: '#22d3ee' }} />
                          {src.lead_name} · {src.company}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 items-start animate-fadeIn">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden"
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.1))' }} />
                <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(34,211,238,0.4)', borderRadius: '9999px' }} />
                <Bot className="w-4 h-4" style={{ color: '#22d3ee' }} />
              </div>
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-tl-sm text-[13px]"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}
              >
                <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#22d3ee' }} />
                <span>Searching vector memory…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-4 pb-5 pt-3 space-y-3 relative z-10"
          style={{ background: 'rgba(5, 8, 16, 0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Quick queries */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SAMPLE_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-all shrink-0"
                style={{ background: 'rgba(255,255,255,0.035)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#e8ecf4'; e.currentTarget.style.border = '1px solid rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <ChevronRight className="w-3 h-3" style={{ color: '#6366f1' }} />
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask about your leads & emails…"
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e8ecf4'
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15), inset 0 0 20px rgba(99,102,241,0.05)'; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = ''; }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-12 h-12 flex items-center justify-center rounded-xl text-white transition-all active:scale-95 disabled:opacity-40 shrink-0 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.2)'
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              <Send className="w-5 h-5 relative z-10" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
