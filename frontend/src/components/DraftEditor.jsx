import React, { useState, useEffect } from 'react';
import {
  Sparkles, Send, Copy, Check, ExternalLink,
  RefreshCw, Wand2, Mail, ShieldAlert
} from 'lucide-react';
import { apiService } from '../services/api';

const TONES = [
  { id: 'Professional',            label: 'Professional',   icon: '💼' },
  { id: 'Warm & Friendly',         label: 'Warm',           icon: '🤝' },
  { id: 'Urgent / Action-Oriented', label: 'Urgent',        icon: '⚡' },
  { id: 'Short & Direct',          label: 'Direct',         icon: '🎯' }
];

export default function DraftEditor({ lead, onDraftCreated, showToast }) {
  const [tone, setTone]               = useState(lead.draft?.tone || 'Professional');
  const [subject, setSubject]         = useState(lead.draft?.subject || `Re: ${lead.company} & Sakha`);
  const [body, setBody]               = useState(lead.draft?.body || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [createdDraftInfo, setCreatedDraftInfo] = useState(null);

  useEffect(() => {
    if (lead?.draft) {
      setSubject(lead.draft.subject || `Re: ${lead.company} & Sakha`);
      setBody(lead.draft.body || '');
      setTone(lead.draft.tone || 'Professional');
    }
  }, [lead]);

  const handleToneChange = async (newTone) => {
    setTone(newTone);
    setIsRegenerating(true);
    try {
      const g = await apiService.generateDraft(lead.id, newTone, customPrompt);
      if (g?.body) { setBody(g.body); if (g.subject) setSubject(g.subject); }
    } catch (e) { console.error(e); } finally { setIsRegenerating(false); }
  };

  const handleCustomRegenerate = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setIsRegenerating(true);
    try {
      const g = await apiService.generateDraft(lead.id, tone, customPrompt);
      if (g?.body) setBody(g.body);
      showToast('Draft regenerated with your instructions!');
    } catch (e) { console.error(e); } finally { setIsRegenerating(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateGmailDraft = async () => {
    setIsCreatingDraft(true);
    try {
      const result = await apiService.createDraft(lead.id, { recipient: lead.email, subject, body });
      setCreatedDraftInfo(result);
      if (result?.success) {
        showToast('Gmail Draft created — check your Gmail drafts folder.');
        if (onDraftCreated) onDraftCreated(result);
      }
    } catch (e) { showToast('Error creating draft in Gmail'); } finally { setIsCreatingDraft(false); }
  };

  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: '#00d084' }} />
          <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c9d1e0' }}>
            Personalized Draft
          </h4>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(0,208,132,0.08)', color: '#00d084', border: '1px solid rgba(0,208,132,0.2)' }}
        >
          Context-Aware RAG
        </span>
      </div>

      {/* Tone pills */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#4a5568' }}>
          Tone
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {TONES.map(t => {
            const active = tone === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleToneChange(t.id)}
                disabled={isRegenerating}
                className="py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: active ? 'rgba(0,208,132,0.12)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#00d084' : '#8b98b4',
                  border: `1px solid ${active ? 'rgba(0,208,132,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? '0 0 16px rgba(0,208,132,0.1)' : ''
                }}
              >
                <span className="block text-base leading-none mb-0.5">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient / subject */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-[11px] font-semibold w-14 shrink-0" style={{ color: '#4a5568' }}>To:</span>
          <span className="text-xs font-mono" style={{ color: '#8b98b4' }}>{lead.email}</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span className="text-[11px] font-semibold w-14 shrink-0" style={{ color: '#4a5568' }}>Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-xs focus:outline-none"
            style={{ color: '#f0f4fc' }}
          />
        </div>
      </div>

      {/* Editable body */}
      <div className="relative">
        <textarea
          rows={10}
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={isRegenerating}
          placeholder="AI follow-up draft will appear here…"
          className="w-full rounded-xl p-4 text-xs leading-relaxed resize-none focus:outline-none transition-all disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#c9d1e0',
            fontFamily: 'inherit'
          }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,208,132,0.3)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; }}
        />
        {isRegenerating && (
          <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.3)' }}
            >
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: '#00d084' }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: '#00d084' }}>
              Regenerating with <em>{tone}</em> tone…
            </span>
          </div>
        )}
      </div>

      {/* Custom instruction input */}
      <form onSubmit={handleCustomRegenerate} className="flex gap-2">
        <input
          type="text"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Custom instruction (e.g. 'Mention 10% pilot discount if signed by Friday')…"
          className="flex-1 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#f0f4fc'
          }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,208,132,0.3)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; }}
        />
        <button
          type="submit"
          disabled={isRegenerating || !customPrompt.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#c9d1e0', border: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
        >
          <Wand2 className="w-3.5 h-3.5" style={{ color: '#00d084' }} />
          Apply
        </button>
      </form>

      {/* Human-in-the-loop notice */}
      <div
        className="flex items-start gap-3 px-3.5 py-3 rounded-xl text-[11px]"
        style={{ background: 'rgba(0,208,132,0.04)', border: '1px solid rgba(0,208,132,0.1)', color: '#4a5568' }}
      >
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#00d084' }} />
        <span>
          <strong style={{ color: '#8b98b4' }}>Human-in-the-Loop:</strong> Sakha creates an editable draft in your Gmail.
          It will <strong>never</strong> send emails automatically.
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#c9d1e0', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          {copied
            ? <><Check className="w-4 h-4" style={{ color: '#00d084' }} /><span style={{ color: '#00d084' }}>Copied!</span></>
            : <><Copy className="w-4 h-4" />Copy</>
          }
        </button>

        <div className="flex items-center gap-2">
          {createdDraftInfo?.gmail_link && (
            <a
              href={createdDraftInfo.gmail_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#00d084', border: '1px solid rgba(0,208,132,0.2)' }}
            >
              Open Gmail <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleCreateGmailDraft}
            disabled={isCreatingDraft}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #00d084, #00a86b)',
              boxShadow: '0 4px 20px rgba(0,208,132,0.25)'
            }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,208,132,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,208,132,0.25)'; }}
          >
            {isCreatingDraft
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Creating…</>
              : <><Mail className="w-4 h-4" />Create Gmail Draft</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
