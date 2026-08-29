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
      style={{
        background: 'rgba(5, 8, 16, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}
      className="sticky top-0 z-30 px-5 lg:px-8 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Icon mark */}
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #22d3ee 100%)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 0 0 1px rgba(99,102,241,0.3), 0 4px 16px rgba(99,102,241,0.25)'
            }}
          >
            <Zap className="w-4.5 h-4.5 text-white drop-shadow-md" strokeWidth={2.5} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-[#e8ecf4] leading-none">
                Sakha
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99,102,241,0.25)'
                }}
              >
                AI
              </span>
            </div>
            <p className="text-[11px] hidden sm:block mt-1 leading-none" style={{ color: '#475569' }}>
              Sales Intelligence
            </p>
          </div>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Gmail status pill */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-colors"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#94a3b8'
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-ping"
                style={{ background: '#22d3ee', opacity: 0.6 }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }}
              />
            </span>
            <span>Gmail</span>
            <span className="text-[#e8ecf4] font-medium">Connected</span>
            {isLive && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(34,211,238,0.15)',
                  color: '#22d3ee',
                  border: '1px solid rgba(34,211,238,0.3)',
                  boxShadow: '0 0 10px rgba(34,211,238,0.2)',
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
              background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.15)',
              color: '#818cf8'
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
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#e8ecf4'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              style={{ color: '#22d3ee' }}
            />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Ask Sakha */}
          <button
            onClick={onOpenChat}
            className="focus-ring flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 16px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.4)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.2), 0 6px 24px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 16px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = ''; }}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Ask Sakha</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="focus-ring p-2 rounded-xl transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8ecf4'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
