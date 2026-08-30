import React, { useState, useEffect } from 'react';
import {
  X, Settings, Key, Mail, Database, Cpu,
  CheckCircle2, AlertCircle, Save, ShieldCheck,
  Eye, EyeOff, ExternalLink, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { apiService } from '../services/api';

export default function SettingsModal({ isOpen, onClose, showToast, theme = 'dark' }) {
  const isDark = theme === 'dark';
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
      style={{
        background: isDark ? 'rgba(5, 5, 8, 0.88)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)'
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border shadow-2xl animate-slideUp ${
          isDark ? 'bg-[#121214] border-white/15 text-white' : 'bg-white border-black/10 text-black'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 shrink-0 border-b ${
          isDark ? 'border-white/10 bg-[#161619]' : 'border-black/10 bg-[#f8f8fa]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-9 px-2 rounded-xl flex items-center justify-center bg-white border border-black/10 shadow-sm">
              <img src="/logo.jpeg" alt="Sakha" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold">System Settings</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Gmail IMAP · AI Engines · ChromaDB</p>
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

        {/* Scrollable form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Section 1: Gmail IMAP ── */}
          <div className={`space-y-4 p-5 rounded-2xl border ${
            isDark ? 'bg-[#18181b] border-white/10' : 'bg-[#f4f4f6] border-black/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Gmail IMAP Connection</h3>
                  <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Connect via 16-character App Password</p>
                </div>
              </div>

              {/* Status Badge (Exception in Green) */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isGmailConnected
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : isDark ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-zinc-200 text-zinc-600 border border-zinc-300'
                }`}
              >
                {isGmailConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{isGmailConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            {/* Current status display */}
            {gmailStatus && (
              <div className={`text-xs p-3 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-white border-black/10 text-zinc-700'
              }`}>
                <span>Account Mode:</span>
                <span className="font-mono font-medium">{gmailStatus.mode || 'Demo Mode'}</span>
              </div>
            )}

            {/* Gmail credentials */}
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Gmail Address</label>
                <input
                  type="email"
                  value={gmailEmail}
                  onChange={e => setGmailEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-[#121214] border-white/10 text-white placeholder:text-zinc-500 focus:border-white'
                      : 'bg-white border-black/10 text-black placeholder:text-zinc-400 focus:border-black'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>App Password (16 characters)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={gmailAppPassword}
                    onChange={e => setGmailAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-all font-mono ${
                      isDark
                        ? 'bg-[#121214] border-white/10 text-white placeholder:text-zinc-500 focus:border-white'
                        : 'bg-white border-black/10 text-black placeholder:text-zinc-400 focus:border-black'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[11px] flex items-center gap-1 transition-colors ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
                  }`}
                >
                  <span>Generate App Password</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={handleConnectGmail}
                  disabled={isConnecting}
                  className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                    isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isConnecting ? 'Connecting…' : 'Connect IMAP'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Section 2: AI Provider ── */}
          <div className={`space-y-4 p-5 rounded-2xl border ${
            isDark ? 'bg-[#18181b] border-white/10' : 'bg-[#f4f4f6] border-black/10'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              }`}>
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">AI Engine</h3>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Select LLM provider for email intelligence</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['groq', 'gemini', 'local'].map(provider => {
                const active = llmProvider === provider;
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setLlmProvider(provider)}
                    className={`btn-3d py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      active
                        ? isDark ? 'bg-white text-black border-white shadow-sm' : 'bg-black text-white border-black shadow-sm'
                        : isDark ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white' : 'bg-black/5 text-zinc-600 border-black/10 hover:text-black'
                    }`}
                  >
                    {provider}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 3: Vector Store ── */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border text-xs ${
            isDark ? 'bg-[#18181b] border-white/10' : 'bg-[#f4f4f6] border-black/10'
          }`}>
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4" />
              <div>
                <span className="font-bold block">ChromaDB Vector Store</span>
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>all-MiniLM-L6-v2 embeddings active</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded font-mono text-[11px] border ${
              isDark ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'
            }`}>
              Ready
            </span>
          </div>

          {/* Footer Save */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className={`btn-3d flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
