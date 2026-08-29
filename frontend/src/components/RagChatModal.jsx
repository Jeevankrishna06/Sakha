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
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer */}
      <div
        className="flex flex-col w-full max-w-md h-full animate-slideUp"
        style={{
          background: 'rgba(13,17,23,0.98)',
          borderLeft: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '-20px 0 80px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00d084, #00a86b)',
                boxShadow: '0 4px 16px rgba(0,208,132,0.25)'
              }}
            >
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Ask Sakha</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#4a5568' }}>RAG Semantic Search · Gmail Corpus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8b98b4', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8b98b4'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={
                  msg.sender === 'agent'
                    ? { background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.25)' }
                    : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {msg.sender === 'agent'
                  ? <Bot className="w-3.5 h-3.5" style={{ color: '#00d084' }} />
                  : <User className="w-3.5 h-3.5" style={{ color: '#8b98b4' }} />
                }
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[84%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                }`}
                style={
                  msg.sender === 'user'
                    ? { background: 'rgba(0,208,132,0.12)', color: '#e0faf2', border: '1px solid rgba(0,208,132,0.2)' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#c9d1e0', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Sources */}
                {msg.sources?.length > 0 && (
                  <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: '#4a5568' }}>
                      Sources
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#8b98b4', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <Building2 className="w-2.5 h-2.5" style={{ color: '#00d084' }} />
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
            <div className="flex gap-3 items-start">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.25)' }}
              >
                <Bot className="w-3.5 h-3.5" style={{ color: '#00d084' }} />
              </div>
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm text-xs"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#4a5568' }}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: '#00d084' }} />
                <span>Searching vector memory…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-4 pb-4 pt-3 space-y-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Quick queries */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {SAMPLE_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#8b98b4', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,208,132,0.08)'; e.currentTarget.style.color = '#00d084'; e.currentTarget.style.border = '1px solid rgba(0,208,132,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8b98b4'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; }}
              >
                <ChevronRight className="w-3 h-3" />
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask about your leads & emails…"
              className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f0f4fc'
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,208,132,0.35)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,208,132,0.07)'; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = ''; }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-white transition-all active:scale-95 disabled:opacity-40 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #00d084, #00a86b)',
                boxShadow: '0 4px 16px rgba(0,208,132,0.25)'
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,208,132,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,208,132,0.25)'; }}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
