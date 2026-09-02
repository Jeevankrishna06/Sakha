import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  MessageSquareText,
  Settings,
  Activity,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Plus,
  Check
} from 'lucide-react';

export default function Navbar({
  onOpenChat,
  onOpenSettings,
  onSync,
  isSyncing,
  lastSyncTime,
  llmProvider = 'groq',
  isLive = false,
  theme = 'dark',
  onToggleTheme,
  user,
  accounts = [],
  onSwitchAccount,
  onAddAccount,
  onLogout
}) {
  const isDark = theme === 'dark';
  const [logoError, setLogoError] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              Multi-User Sales Intelligence
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

          {/* Live / Sync Status Indicator */}
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
            <span>Gmail</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Connected</span>
            {isLive && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                LIVE
              </span>
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
            title="System Settings"
            className={`btn-3d p-2 rounded-xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                : 'bg-black/[0.04] hover:bg-black/10 border-black/10 text-zinc-700 hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Multi-Account Switcher Dropdown */}
          {user && (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={`btn-3d flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-white/[0.06] hover:bg-white/10 border-white/15 text-white'
                    : 'bg-black/[0.04] hover:bg-black/8 border-black/15 text-black'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="hidden sm:block text-left max-w-[110px] truncate">
                  <div className="text-xs font-semibold leading-tight truncate">{user.name || user.email.split('@')[0]}</div>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {/* Floating Accounts Menu */}
              {isAccountMenuOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-xl ${
                  isDark
                    ? 'bg-zinc-900/95 border-white/10 text-white shadow-black/80'
                    : 'bg-white/95 border-black/10 text-black shadow-zinc-300/60'
                }`}>
                  <div className="px-3 py-2 border-b border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active Account</div>
                    <div className="text-xs font-bold truncate mt-0.5">{user.name || user.email.split('@')[0]}</div>
                    <div className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.email}</div>
                  </div>

                  {/* Other Accounts */}
                  {accounts.length > 1 && (
                    <div className="py-2 border-b border-white/5 space-y-1">
                      <div className={`text-[10px] font-bold uppercase tracking-wider px-3 pb-1 ${
                        isDark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>
                        Switch Account
                      </div>
                      {accounts.filter(a => a.email !== user.email).map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => {
                            if (onSwitchAccount) onSwitchAccount(acc);
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                            isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {acc.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 truncate">
                              <div className="font-semibold truncate">{acc.name || acc.email.split('@')[0]}</div>
                              <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{acc.email}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddAccount) onAddAccount();
                        setIsAccountMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2 text-xs font-semibold transition-colors ${
                        isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-black/5 text-zinc-700'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Add Google Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onLogout) onLogout();
                        setIsAccountMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2 text-xs font-semibold transition-colors ${
                        isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-500/10 text-red-600'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
