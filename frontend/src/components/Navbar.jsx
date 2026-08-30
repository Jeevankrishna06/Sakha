import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  MessageSquareText,
  Settings,
  Activity,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({
  onOpenChat,
  onOpenSettings,
  onSync,
  isSyncing,
  lastSyncTime,
  llmProvider = 'groq',
  isLive = false,
  isLiveGmail = false,
  theme = 'dark',
  onToggleTheme
}) {
  const isDark = theme === 'dark';
  const [logoError, setLogoError] = useState(false);

  return (
    <header
      className={`sticky top-0 z-30 px-5 lg:px-8 py-3 transition-colors duration-300 backdrop-blur-xl border-b ${
        isDark
          ? 'bg-[#09090b]/90 border-white/10 text-white'
          : 'bg-white/90 border-black/10 text-black shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── Brand with Official Pulse Logo ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`h-10 px-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 border ${
              isDark
                ? 'bg-white border-white/20 shadow-white/10'
                : 'bg-white border-black/15 shadow-black/10'
            }`}
            style={{
              boxShadow: isDark
                ? '0 4px 12px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
                : '0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
            }}
          >
            {!logoError ? (
              <img
                src="/logo.jpeg"
                alt="Sakha Logo"
                onError={() => setLogoError(true)}
                className="h-6 w-auto object-contain"
              />
            ) : (
              <span className="text-black font-black text-xs tracking-tighter">SAKHA</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[17px] font-extrabold tracking-tight leading-none ${isDark ? 'text-white' : 'text-black'}`}>
                Sakha
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-black/5 text-black border-black/15'
                }`}
              >
                AI
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block mt-1 leading-none ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Sales Intelligence
            </p>
          </div>
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* 3D Theme Switcher (Dark / Light Toggle) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`btn-3d p-2 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200'
                : 'bg-black/5 hover:bg-black/10 border-black/10 text-zinc-800'
            }`}
            style={{
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Live / Demo Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
              isDark
                ? 'bg-white/[0.04] border-white/10 text-zinc-300'
                : 'bg-black/[0.03] border-black/10 text-zinc-700'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            {isLiveGmail ? (
              <>
                <span>Gmail</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Connected</span>
                {isLive && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    LIVE
                  </span>
                )}
              </>
            ) : (
              <>
                <span>Workspace</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Demo Ready</span>
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  DEMO
                </span>
              </>
            )}
          </div>

          {/* Model info */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${
              isDark
                ? 'bg-white/[0.04] border-white/10 text-zinc-300'
                : 'bg-black/[0.03] border-black/10 text-zinc-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-black'}`}>{llmProvider}</span>
          </div>

          {/* Sync Inbox */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className={`btn-3d flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 disabled:opacity-50 ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-white'
                : 'bg-black/[0.04] hover:bg-black/10 border-black/10 text-black'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Ask Sakha (3D Tactile Button) */}
          <button
            onClick={onOpenChat}
            className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              isDark
                ? 'bg-white hover:bg-zinc-100 text-black'
                : 'bg-black hover:bg-zinc-800 text-white'
            }`}
            style={{
              boxShadow: isDark
                ? '0 4px 14px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.5)'
                : '0 4px 14px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Ask Sakha</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={`btn-3d p-2 rounded-xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                : 'bg-black/[0.04] hover:bg-black/10 border-black/10 text-zinc-700 hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
