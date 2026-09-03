import React, { useState, useEffect } from 'react';
import {
  Sparkles, Send, Copy, Check, ExternalLink,
  RefreshCw, Wand2, Mail, ShieldCheck, Zap,
  Sliders
} from 'lucide-react';
import { apiService } from '../services/api';

const TONES = [
  { id: 'Professional',            label: 'Professional',   icon: '💼' },
  { id: 'Short & Direct',          label: 'Direct',         icon: '🎯' },
  { id: 'Urgent / Action-Oriented', label: 'Urgent',        icon: '⚡', isCritical: true },
  { id: 'Warm & Friendly',         label: 'Warm',           icon: '🤝' },
  { id: 'Executive / Concise',     label: 'Executive',      icon: '👑' }
];

const QUICK_PROMPTS = [
  "Make it 50% shorter",
  "Ask for 10-min meeting Tuesday",
  "Add pricing pilot discount",
  "Polite follow-up nudge",
  "Highlight product ROI"
];

export default function DraftEditor({ lead = {}, onDraftCreated, showToast, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [tone, setTone]               = useState(lead?.draft?.tone || 'Professional');
  const [subject, setSubject]         = useState(lead?.draft?.subject || (lead?.company ? `Re: ${lead.company} & Sakha` : 'Re: Next steps with Sakha'));
  const [body, setBody]               = useState(lead?.draft?.body || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [createdDraftInfo, setCreatedDraftInfo] = useState(null);

  useEffect(() => {
    if (lead?.draft) {
      setSubject(lead.draft.subject || (lead.company ? `Re: ${lead.company} & Sakha` : 'Re: Next steps with Sakha'));
      setBody(lead.draft.body || '');
      setTone(lead.draft.tone || 'Professional');
    }
  }, [lead]);

  const handleToneChange = async (newTone) => {
    setTone(newTone);
    setIsRegenerating(true);
    try {
      const g = await apiService.generateDraft(lead.id, newTone, customPrompt);
      if (g?.body) {
        setBody(g.body);
        if (g.subject) setSubject(g.subject);
      }
      showToast(`Regenerated draft with ${newTone} tone!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCustomRegenerate = async (promptText) => {
    const p = promptText || customPrompt;
    if (!p.trim()) return;
    setIsRegenerating(true);
    try {
      const g = await apiService.generateDraft(lead.id, tone, p.trim());
      if (g?.body) setBody(g.body);
      showToast('AI updated draft according to instructions!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    showToast('Copied draft to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateGmailDraft = async () => {
    setIsCreatingDraft(true);
    try {
      const result = await apiService.createDraft(lead.id, {
        recipient: lead.email,
        subject,
        body
      });
      setCreatedDraftInfo(result);
      if (result?.success) {
        showToast('Gmail Draft created successfully!');
        if (onDraftCreated) onDraftCreated(result);
      }
    } catch (e) {
      showToast('Error creating draft in Gmail');
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleOpenDirectGmail = () => {
    const to = encodeURIComponent(lead.email || '');
    const su = encodeURIComponent(subject || '');
    const b = encodeURIComponent(body || '');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${b}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <div className="space-y-5">
      
      {/* ── Studio Header ── */}
      <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 px-1.5 rounded-lg flex items-center justify-center bg-white border border-black/10 shadow-xs">
            <img src="/logo.jpeg" alt="Sakha" className="h-4 w-auto object-contain" />
          </div>
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>
              AI Follow-Up Studio
            </h4>
            <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Context-Aware Follow-Up Generation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
            isDark ? 'text-zinc-300 bg-white/5 border-white/10' : 'text-zinc-700 bg-black/5 border-black/10'
          }`}>
            {wordCount} words · {charCount} chars
          </span>
        </div>
      </div>

      {/* ── Tone Selection Pills ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            <Sliders className="w-3.5 h-3.5 text-current" />
            <span>Tone of Voice</span>
          </label>
          <span className={`text-[10px] font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Active: <strong className={isDark ? 'text-white' : 'text-black'}>{tone}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TONES.map(t => {
            const active = tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToneChange(t.id)}
                disabled={isRegenerating}
                className={`btn-3d py-2.5 px-3 rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2 justify-center border ${
                  active
                    ? isDark
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-black text-white border-black shadow-md'
                    : isDark
                      ? 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                      : 'bg-black/5 text-zinc-600 border-black/10 hover:border-black/20 hover:text-black'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recipient & Subject Header ── */}
      <div className={`rounded-2xl overflow-hidden border ${
        isDark ? 'bg-[#121214] border-white/10' : 'bg-[#f4f4f6] border-black/10'
      }`}>
        <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <span className={`text-[11px] font-bold w-12 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>To:</span>
          <span className={`text-xs font-mono font-medium ${isDark ? 'text-white' : 'text-black'}`}>{lead.email}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className={`text-[11px] font-bold w-12 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className={`flex-1 bg-transparent text-xs focus:outline-none font-medium ${isDark ? 'text-white' : 'text-black'}`}
          />
        </div>
      </div>

      {/* ── Editable Email Canvas ── */}
      <div className={`relative group rounded-2xl overflow-hidden border ${
        isDark ? 'bg-[#121214] border-white/10' : 'bg-white border-black/10'
      }`}>
        <textarea
          rows={11}
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={isRegenerating}
          placeholder="AI follow-up draft will appear here…"
          className={`w-full p-4 text-xs leading-relaxed resize-none focus:outline-none transition-all disabled:opacity-50 font-sans bg-transparent ${
            isDark ? 'text-white' : 'text-black'
          }`}
        />

        {isRegenerating && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-md z-20 ${
            isDark ? 'bg-[#09090b]/85' : 'bg-white/85'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Synthesizing draft with <em>{tone}</em> tone…
            </span>
          </div>
        )}
      </div>

      {/* ── 1-Click Smart Quick Prompts ── */}
      <div className="space-y-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Instant AI Modifications
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              disabled={isRegenerating}
              onClick={() => {
                setCustomPrompt(promptText);
                handleCustomRegenerate(promptText);
              }}
              className={`btn-3d px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all active:scale-95 disabled:opacity-40 ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:border-white/20'
                  : 'bg-black/5 hover:bg-black/10 text-zinc-700 border-black/10 hover:border-black/20'
              }`}
            >
              + {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom Instruction Input ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCustomRegenerate();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Custom prompt (e.g. 'Reference their recent Q3 product release')…"
          className={`flex-1 px-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
            isDark
              ? 'bg-[#121214] border-white/10 text-white placeholder:text-zinc-500 focus:border-white'
              : 'bg-white border-black/10 text-black placeholder:text-zinc-400 focus:border-black'
          }`}
        />
        <button
          type="submit"
          disabled={isRegenerating || !customPrompt.trim()}
          className={`btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-40 ${
            isDark
              ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
              : 'bg-black/10 hover:bg-black/15 border-black/15 text-black'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-current" />
          <span>Apply</span>
        </button>
      </form>

      {/* ── Human In The Loop Safety Banner ── */}
      <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs ${
        isDark ? 'bg-white/[0.04] border-white/10 text-zinc-300' : 'bg-black/[0.03] border-black/10 text-zinc-700'
      }`}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            <strong className={isDark ? 'text-white' : 'text-black'}>Human Approval Guaranteed:</strong> Sakha prepares drafts for you to review; no automated sends.
          </span>
        </div>
      </div>

      {/* ── Action Buttons Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
            isDark
              ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              : 'bg-black/5 hover:bg-black/10 text-black border-black/10'
          }`}
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="font-bold">Copied!</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5 opacity-70" /><span>Copy Full Text</span></>
          )}
        </button>

        <div className="flex items-center gap-2.5">
          {/* Direct Gmail Web Compose */}
          <button
            type="button"
            onClick={handleOpenDirectGmail}
            className={`btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-black/10 hover:bg-black/20 border-black/20 text-black'
            }`}
          >
            <span>Open in Gmail Web</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Create Gmail Draft API Button */}
          <button
            type="button"
            onClick={handleCreateGmailDraft}
            disabled={isCreatingDraft}
            className={`btn-3d flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 disabled:opacity-50 ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-100 shadow-md'
                : 'bg-black text-white hover:bg-zinc-800 shadow-md'
            }`}
          >
            {isCreatingDraft ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Syncing…</span></>
            ) : (
              <><Mail className="w-3.5 h-3.5" /><span>Save to Gmail Drafts</span></>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
