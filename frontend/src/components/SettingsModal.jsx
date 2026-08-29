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
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl rounded-3xl flex flex-col overflow-hidden animate-slideUp"
        style={{
          background: 'rgba(13,17,23,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Settings className="w-4 h-4" style={{ color: '#8b98b4' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Settings</h3>
              <p className="text-[11px]" style={{ color: '#4a5568' }}>Gmail, AI Engine & Vector DB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8b98b4', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8b98b4'; }}
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
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: '#00d084' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f0f4fc' }}>
                  Gmail Connection
                </span>
              </div>
              {/* Status badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={isGmailConnected
                  ? { background: 'rgba(0,208,132,0.1)', color: '#00d084', border: '1px solid rgba(0,208,132,0.25)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#4a5568', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {isGmailConnected
                  ? <><Wifi className="w-3 h-3" />Connected</>
                  : <><WifiOff className="w-3 h-3" />Not Connected</>
                }
              </div>
            </div>

            {/* Show current status if connected */}
            {isGmailConnected && (
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs"
                style={{ background: 'rgba(0,208,132,0.06)', border: '1px solid rgba(0,208,132,0.15)' }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#00d084' }} />
                <div>
                  <span className="font-semibold" style={{ color: '#00d084' }}>
                    {gmailStatus?.mode}
                  </span>
                  <span className="ml-2" style={{ color: '#4a5568' }}>
                    — Real emails will be fetched on sync
                  </span>
                </div>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold" style={{ color: '#8b98b4' }}>
                Gmail Address
              </label>
              <input
                type="email"
                value={gmailEmail}
                onChange={e => setGmailEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f4fc'
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,208,132,0.4)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; }}
              />
            </div>

            {/* App Password input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold" style={{ color: '#8b98b4' }}>
                App Password
                <span className="font-normal ml-1" style={{ color: '#4a5568' }}>(not your regular password)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={gmailAppPassword}
                  onChange={e => setGmailAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm focus:outline-none transition-all font-mono"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f0f4fc'
                  }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,208,132,0.4)'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#4a5568' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* How to get App Password help */}
            <div
              className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px]"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#8b98b4' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <div className="space-y-1">
                <div>
                  <strong style={{ color: '#f59e0b' }}>How to get an App Password:</strong>
                </div>
                <ol className="list-decimal ml-4 space-y-0.5" style={{ color: '#4a5568' }}>
                  <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#3b82f6' }}>myaccount.google.com/security</a></li>
                  <li>Enable <strong style={{ color: '#8b98b4' }}>2-Step Verification</strong> if not already on</li>
                  <li>Search for <strong style={{ color: '#8b98b4' }}>App Passwords</strong> in the search bar</li>
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #00d084, #00a86b)',
                boxShadow: '0 4px 20px rgba(0,208,132,0.2)'
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,208,132,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,208,132,0.2)'; }}
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
              <Cpu className="w-4 h-4" style={{ color: '#a855f7' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f0f4fc' }}>
                AI Engine
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'groq', label: 'Groq', sub: 'Ultra-Fast', color: '#00d084' },
                { id: 'gemini', label: 'Gemini', sub: 'Google AI', color: '#3b82f6' },
                { id: 'mock', label: 'Local', sub: 'Offline', color: '#f59e0b' }
              ].map(p => {
                const active = llmProvider === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setLlmProvider(p.id)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: active ? `${p.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? `${p.color}55` : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: active ? `0 0 20px ${p.color}15` : ''
                    }}
                  >
                    <div className="text-xs font-bold" style={{ color: active ? p.color : '#c9d1e0' }}>{p.label}</div>
                    <span className="text-[10px]" style={{ color: active ? `${p.color}aa` : '#4a5568' }}>{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key inputs */}
          {llmProvider === 'groq' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold" style={{ color: '#8b98b4' }}>Groq API Key</label>
              <input
                type="password"
                value={groqKey}
                onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4fc' }}
              />
              <span className="text-[10px]" style={{ color: '#4a5568' }}>Leave blank to use .env key</span>
            </div>
          )}
          {llmProvider === 'gemini' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold" style={{ color: '#8b98b4' }}>Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4fc' }}
              />
              <span className="text-[10px]" style={{ color: '#4a5568' }}>Leave blank to use .env key</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              Vector Store Info
          ═══════════════════════════════════════════ */}
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: '#3b82f6' }} />
              <span className="text-xs font-bold" style={{ color: '#f0f4fc' }}>Local RAG Stack</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Embedding', 'all-MiniLM-L6-v2'],
                ['Vector DB', 'ChromaDB'],
                ['Cost', '$0.00 (Local)'],
                ['Capacity', '1000+ Threads']
              ].map(([k, v]) => (
                <div key={k} style={{ color: '#4a5568' }}>
                  {k}: <strong className="font-mono" style={{ color: '#8b98b4' }}>{v}</strong>
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
              style={{ background: 'rgba(255,255,255,0.05)', color: '#c9d1e0', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00d084, #00a86b)',
                boxShadow: '0 4px 16px rgba(0,208,132,0.2)'
              }}
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
