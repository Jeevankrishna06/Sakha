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

export default function RagChatModal({ isOpen, onClose, onSelectLeadById, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{
    id: 'welcome',
    sender: 'agent',
    text: "Hi! I'm Sakha Copilot — your RAG sales intelligence engine. I've indexed your Gmail threads into vector memory.\n\nAsk me anything about active deals, overdue follow-ups, or prospect discussions.",
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
      style={{
        background: isDark ? 'rgba(5, 5, 8, 0.82)' : 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(16px)'
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer Container */}
      <div
        className={`flex flex-col w-full max-w-lg h-full animate-slideUp border-l shadow-2xl relative ${
          isDark ? 'bg-[#0e0e11] border-white/15 text-white' : 'bg-white border-black/10 text-black'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 shrink-0 border-b ${
          isDark ? 'border-white/10 bg-[#121214]' : 'border-black/10 bg-[#f8f8fa]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-9 px-2 rounded-xl flex items-center justify-center bg-white border border-black/10 shadow-sm">
              <img src="/logo.jpeg" alt="Sakha" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Ask Sakha</h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>RAG Semantic Search · ChromaDB Vector Memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`btn-3d w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-zinc-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-sm ${
                  msg.sender === 'agent'
                    ? 'bg-white text-black p-1 border border-black/10'
                    : isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-black/10 text-black border border-black/20'
                }`}
              >
                {msg.sender === 'agent' ? (
                  <img src="/logo.jpeg" alt="AI" className="w-full h-full object-contain" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] p-4 text-xs sm:text-[13px] leading-relaxed rounded-2xl ${
                  msg.sender === 'user'
                    ? isDark
                      ? 'bg-white text-black rounded-tr-sm font-medium'
                      : 'bg-black text-white rounded-tr-sm font-medium'
                    : isDark
                      ? 'bg-[#18181b] text-zinc-200 rounded-tl-sm border border-white/10'
                      : 'bg-[#f4f4f6] text-zinc-800 rounded-tl-sm border border-black/10'
                }`}
              >
                <div className="whitespace-pre-line font-normal leading-relaxed">{msg.text}</div>

                {/* Sources List */}
                {msg.sources?.length > 0 && (
                  <div className={`mt-3 pt-3 space-y-2 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Referenced Conversations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectLeadById && onSelectLeadById(src.lead_id || src.id)}
                          className={`btn-3d flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                            isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-black/5 hover:bg-black/10 text-black border-black/10'
                          }`}
                        >
                          <Building2 className="w-3 h-3 opacity-60" />
                          <span>{src.lead_name} · {src.company}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-start animate-fadeIn">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white p-1 border border-black/10">
                <img src="/logo.jpeg" alt="Loading" className="w-full h-full object-contain animate-pulse" />
              </div>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm text-xs border ${
                isDark ? 'bg-[#18181b] border-white/10 text-zinc-400' : 'bg-[#f4f4f6] border-black/10 text-zinc-600'
              }`}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Searching vector memory…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Footer Area */}
        <div className={`shrink-0 px-6 pb-6 pt-3 space-y-3 border-t ${
          isDark ? 'bg-[#121214] border-white/10' : 'bg-[#f8f8fa] border-black/10'
        }`}>
          
          {/* Quick Query Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {SAMPLE_QUERIES.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className={`btn-3d flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all shrink-0 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10' : 'bg-black/5 hover:bg-black/10 text-zinc-700 border-black/10'
                }`}
              >
                <ChevronRight className="w-3 h-3 opacity-70" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Prompt Form Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask about your leads & emails…"
              className={`flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm border focus:outline-none transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white'
                  : 'bg-black/5 border-black/10 text-black placeholder:text-zinc-400 focus:border-black'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`btn-3d w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 disabled:opacity-30 shrink-0 font-bold shadow-md ${
                isDark ? 'text-black bg-white hover:bg-zinc-100' : 'text-white bg-black hover:bg-zinc-800'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
