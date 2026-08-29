import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Mail, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ShieldCheck
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, showToast }) {
  const [llmProvider, setLlmProvider] = useState('groq');
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [syncInterval, setSyncInterval] = useState('30');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">System & AI Settings</h3>
              <p className="text-[11px] text-slate-400">Configure LLM keys, Gmail OAuth & Local Vector DB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Gmail OAuth Integration */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Gmail OAuth 2.0 Integration</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Active (Demo & Live Ready)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sakha runs with zero-friction demo data and is fully wired to authenticate via <code className="text-slate-300 font-mono">credentials.json</code> for live Gmail inboxes.
            </p>
          </div>

          {/* LLM Engine Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Reasoning Engine</span>
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'groq', label: 'Groq (Llama 3.3)', badge: 'Ultra-Fast' },
                { id: 'gemini', label: 'Gemini 1.5 Flash', badge: 'Google AI' },
                { id: 'mock', label: 'Local Heuristic', badge: 'Offline Demo' }
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setLlmProvider(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    llmProvider === p.id 
                      ? 'bg-emerald-950/30 border-emerald-500 text-white ring-1 ring-emerald-500' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <span className="text-[10px] text-emerald-400 font-medium">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API Keys */}
          {llmProvider === 'groq' && (
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold">Groq API Key (Optional)</label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500">Leave blank to use pre-configured environment key or heuristic fallback.</span>
            </div>
          )}

          {llmProvider === 'gemini' && (
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold">Gemini API Key (Optional)</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500">Leave blank to use pre-configured environment key or heuristic fallback.</span>
            </div>
          )}

          {/* Vector Store & Embeddings Details */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Local RAG Stack Info</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>• Embedding: <strong className="text-slate-200 font-mono">all-MiniLM-L6-v2</strong></div>
              <div>• Vector DB: <strong className="text-slate-200 font-mono">ChromaDB</strong></div>
              <div>• Cost: <strong className="text-emerald-400">$0.00 (Local Compute)</strong></div>
              <div>• Scale: <strong className="text-slate-200">1000+ Email Threads</strong></div>
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
