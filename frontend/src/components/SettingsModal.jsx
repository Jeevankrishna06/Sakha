import React, { useState, useEffect } from 'react';
import {
  X, Settings, Key, Mail, Database, Cpu,
  CheckCircle2, AlertCircle, Save, ShieldCheck,
  Eye, EyeOff, ExternalLink, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { apiService } from '../services/api';

export default function SettingsModal({ isOpen, onClose, showToast }) {
  const [llmProvider, setLlmProvider] = useState('groq');
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  // Gmail IMAP fields
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      apiService.getGmailStatus().then(setGmailStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectGmail = async () => {
    if (!gmailEmail.trim() || !gmailAppPassword.trim()) {
      showToast('Please enter both email and App Password.');
      return;
    }
    setIsConnecting(true);
    try {
      const result = await apiService.connectGmail(gmailEmail.trim(), gmailAppPassword.trim());
      if (result.success) {
        showToast(result.message || 'Gmail connected successfully!');
        setGmailStatus({ authenticated: true, mode: `IMAP (${gmailEmail})`, auth_type: 'imap', email: gmailEmail });
      } else {
        showToast(result.message || 'Connection failed. Check your credentials.');
      }
    } catch (e) {
      showToast('Error connecting to Gmail.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully!');
    onClose();
  };

  const isGmailConnected = gmailStatus?.authenticated && gmailStatus?.auth_type !== 'demo';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(20px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl rounded-2xl flex flex-col overflow-hidden animate-slideUp"
        style={{
          background: 'rgba(5,8,16,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Settings className="w-4 h-4" style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8ecf4]">Settings</h3>
              <p className="text-[11px]" style={{ color: '#94a3b8' }}>Gmail, AI Engine & Vector DB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.035)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8ecf4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">

          {/* ═══════════════════════════════════════════
              Gmail Connection (Email + App Password)
          ═══════════════════════════════════════════ */}
          <div
            className="rounded-2xl p-5 space-y-4 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: isGmailConnected ? '#10b981' : '#94a3b8' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#e8ecf4' }}>
                  Gmail Connection
                </span>
              </div>
              {/* Status badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md"
                style={isGmailConnected
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }
                }
              </div>
            </div>

            {/* Show current status if connected */}
            {isGmailConnected && (
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs backdrop-blur-md relative z-10"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
                <div>
                  <span className="font-semibold" style={{ color: '#10b981' }}>
                    {gmailStatus?.mode}
                  </span>
                  <span className="ml-2" style={{ color: '#94a3b8' }}>
                    — Real emails will be fetched on sync
                  </span>
                </div>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-[11px] font-semibold" style={{ color: '#94a3b8' }}>
                Gmail Address
              </label>
              <input
                type="email"
                value={gmailEmail}
                onChange={e => setGmailEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-all backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#e8ecf4'
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
              />
            </div>

            {/* App Password input */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-[11px] font-semibold" style={{ color: '#94a3b8' }}>
                App Password
                <span className="font-normal ml-1" style={{ color: '#475569' }}>(not your regular password)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={gmailAppPassword}
                  onChange={e => setGmailAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm focus:outline-none transition-all font-mono backdrop-blur-md"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#e8ecf4'
                  }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* How to get App Password help */}
            <div
              className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] relative z-10 backdrop-blur-md"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#94a3b8' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <div className="space-y-1">
                <div>
                  <strong style={{ color: '#f59e0b' }}>How to get an App Password:</strong>
                </div>
                <ol className="list-decimal ml-4 space-y-0.5" style={{ color: '#94a3b8' }}>
                  <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-[#22d3ee]" style={{ color: '#6366f1' }}>myaccount.google.com/security</a></li>
                  <li>Enable <strong style={{ color: '#e8ecf4' }}>2-Step Verification</strong> if not already on</li>
                  <li>Search for <strong style={{ color: '#e8ecf4' }}>App Passwords</strong> in the search bar</li>
                  <li>Create a new app password (name it "Sakha")</li>
                  <li>Copy the 16-character code and paste it above</li>
                </ol>
              </div>
            </div>

            {/* Connect button */}
            <button
              type="button"
              onClick={handleConnectGmail}
              disabled={isConnecting || !gmailEmail.trim() || !gmailAppPassword.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40 relative z-10"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 6px 28px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
            >
              {isConnecting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting...</>
                : <><Mail className="w-4 h-4" />{isGmailConnected ? 'Reconnect Gmail' : 'Connect Gmail'}</>
              }
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              AI Reasoning Engine
          ═══════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: '#6366f1' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#e8ecf4' }}>
                AI Engine
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'groq', label: 'Groq', sub: 'Ultra-Fast', color: '#10b981' },
                { id: 'gemini', label: 'Gemini', sub: 'Google AI', color: '#6366f1' },
                { id: 'mock', label: 'Local', sub: 'Offline', color: '#f59e0b' }
              ].map(p => {
                const active = llmProvider === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setLlmProvider(p.id)}
                    className="p-3 rounded-xl text-left transition-all backdrop-blur-sm"
                    style={{
                      background: active ? `${p.color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? p.color : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: active ? `0 0 20px ${p.color}15, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.02)'
                    }}
                  >
                    <div className="text-xs font-bold" style={{ color: active ? p.color : '#e8ecf4' }}>{p.label}</div>
                    <span className="text-[10px]" style={{ color: active ? `${p.color}aa` : '#94a3b8' }}>{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key inputs */}
          {llmProvider === 'groq' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold" style={{ color: '#94a3b8' }}>Groq API Key</label>
              <input
                type="password"
                value={groqKey}
                onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-all backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8ecf4' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
              />
              <span className="text-[10px]" style={{ color: '#475569' }}>Leave blank to use .env key</span>
            </div>
          )}
          {llmProvider === 'gemini' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold" style={{ color: '#94a3b8' }}>Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-all backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8ecf4' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
              />
              <span className="text-[10px]" style={{ color: '#475569' }}>Leave blank to use .env key</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              Vector Store Info
          ═══════════════════════════════════════════ */}
          <div
            className="rounded-2xl p-4 space-y-2 backdrop-blur-sm"
            style={{ background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: '#22d3ee' }} />
              <span className="text-xs font-bold" style={{ color: '#e8ecf4' }}>Local RAG Stack</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Embedding', 'all-MiniLM-L6-v2'],
                ['Vector DB', 'ChromaDB'],
                ['Cost', '$0.00 (Local)'],
                ['Capacity', '1000+ Threads']
              ].map(([k, v]) => (
                <div key={k} style={{ color: '#94a3b8' }}>
                  {k}: <strong className="font-mono" style={{ color: '#22d3ee' }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.035)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8ecf4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
