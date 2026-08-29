import React from 'react';
import {
  Sparkles,
  RefreshCw,
  MessageSquareText,
  Settings,
  Activity,
  Zap,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  onOpenChat,
  onOpenSettings,
  onSync,
  isSyncing,
  lastSyncTime,
  llmProvider = 'groq',
  isLive = false
}) {
  return (
    <header
      style={{ background: 'rgba(6,9,15,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="sticky top-0 z-30 backdrop-blur-2xl px-5 lg:px-8 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Icon mark */}
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00d084 0%, #00a86b 60%, #00816a 100%)',
              boxShadow: '0 0 0 1px rgba(0,208,132,0.3), 0 4px 16px rgba(0,208,132,0.25)'
            }}
          >
            <Zap className="w-4.5 h-4.5 text-slate-950" strokeWidth={2.5} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-white leading-none">
                Sakha
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: 'rgba(0,208,132,0.1)',
                  color: '#00d084',
                  border: '1px solid rgba(0,208,132,0.2)'
                }}
              >
                AI
              </span>
            </div>
            <p className="text-[11px] hidden sm:block mt-0.5 leading-none" style={{ color: '#4a5568' }}>
              Sales Intelligence
            </p>
          </div>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">

          {/* Gmail status pill */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#8b98b4'
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-ping"
                style={{ background: '#00d084', opacity: 0.6 }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: '#00d084' }}
              />
            </span>
            <span>Gmail</span>
            <span className="text-white font-medium">Connected</span>
            {isLive && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(0,208,132,0.15)',
                  color: '#00d084',
                  border: '1px solid rgba(0,208,132,0.3)',
                  animation: 'pulse 2s infinite'
                }}
              >
                LIVE
              </span>
            )}
          </div>

          {/* Model info pill */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: 'rgba(168,85,247,0.07)',
              border: '1px solid rgba(168,85,247,0.15)',
              color: '#a855f7'
            }}
          >
            <Activity className="w-3 h-3" />
            <span className="font-medium capitalize">{llmProvider}</span>
          </div>

          {/* Sync Inbox */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="focus-ring flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#c9d1e0'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              style={{ color: '#00d084' }}
            />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Ask Sakha */}
          <button
            onClick={onOpenChat}
            className="focus-ring flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00d084, #00a86b)',
              boxShadow: '0 4px 20px rgba(0,208,132,0.25), 0 0 0 1px rgba(0,208,132,0.3)'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,208,132,0.4), 0 0 0 1px rgba(0,208,132,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,208,132,0.25), 0 0 0 1px rgba(0,208,132,0.3)'; e.currentTarget.style.transform = ''; }}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Ask Sakha</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="focus-ring p-2 rounded-xl transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b98b4' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#f0f4fc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8b98b4'; }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
