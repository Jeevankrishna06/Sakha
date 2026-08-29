import React from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  MessageSquareText, 
  Settings, 
  CheckCircle2,
  Mail,
  Zap
} from 'lucide-react';

export default function Navbar({ 
  onOpenChat, 
  onOpenSettings, 
  onSync, 
  isSyncing, 
  lastSyncTime,
  llmProvider = 'groq'
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Sakha
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                AI Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Intelligent Sales Follow-Up Agent
            </p>
          </div>
        </div>

        {/* Center/Right: Actions & Indicators */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Gmail Live Connection Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Gmail:</span>
            <span className="font-semibold text-slate-200">Connected</span>
          </div>

          {/* Sync Trigger */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all hover:border-slate-700 active:scale-95 disabled:opacity-50"
            title="Sync inbox and re-index conversation embeddings"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isSyncing ? 'Indexing Inbox...' : 'Sync Inbox'}
            </span>
          </button>

          {/* Ask Sakha (RAG Sales Assistant) */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-all hover:shadow-emerald-900/40 active:scale-95 ring-1 ring-emerald-400/30"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Ask Sakha</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors active:scale-95"
            title="Configure LLM & Gmail settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
