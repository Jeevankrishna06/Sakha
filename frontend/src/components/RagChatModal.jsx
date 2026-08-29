import React, { useState } from 'react';
import { 
  X, 
  MessageSquareText, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Building2, 
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { apiService } from '../services/api';

export default function RagChatModal({ isOpen, onClose, onSelectLeadById }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hi! I'm Sakha, your RAG sales intelligence copilot. I've indexed your Gmail threads into local vector memory. Ask me anything about active deals, overdue follow-ups, or client discussions!",
      sources: []
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sampleQueries = [
    "Which prospects are waiting for pricing right now?",
    "Who hasn't received a response in the last 3 days?",
    "Which leads asked for a security review or demo?",
    "Summarize negotiations with CloudScale Systems."
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await apiService.queryChat(q);
      const agentMsg = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: response.response,
        sources: response.sources || []
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `agent_err_${Date.now()}`,
          sender: 'agent',
          text: "I couldn't process that query. Please make sure the backend RAG pipeline is running.",
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      
      {/* Slide-over Drawer */}
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ask Sakha Copilot</h3>
              <p className="text-[11px] text-slate-400">RAG Semantic Search over Gmail Corpus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none space-y-2.5'
              }`}>
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Sources & Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Retrieved Context Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1"
                        >
                          <Building2 className="w-3 h-3 text-emerald-400" />
                          <span>{src.lead_name} ({src.company})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Sakha is searching vector memory and synthesizing answer...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries & Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
          
          {/* Quick Queries */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Sakha about your leads & emails..."
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 transition-colors active:scale-95 shadow-md shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
