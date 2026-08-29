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
          <Sparkles className="w-4 h-4" style={{ color: '#6366f1' }} />
          <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#e8ecf4' }}>
            Personalized Draft
          </h4>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}
        >
          Context-Aware RAG
        </span>
      </div>

      {/* Tone pills */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
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
                  background: active ? 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)' : 'rgba(255,255,255,0.035)',
                  backdropFilter: 'blur(20px)',
                  color: active ? '#6366f1' : '#94a3b8',
                  border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: active ? '0 0 16px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}
                onMouseEnter={e => {
                  if (!e.currentTarget.disabled && !active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.disabled && !active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                  }
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
        className="rounded-xl overflow-hidden shadow-inner"
        style={{
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[11px] font-semibold w-14 shrink-0" style={{ color: '#475569' }}>To:</span>
          <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{lead.email}</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span className="text-[11px] font-semibold w-14 shrink-0" style={{ color: '#475569' }}>Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-xs focus:outline-none"
            style={{ color: '#e8ecf4' }}
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
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e8ecf4',
            fontFamily: 'inherit',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          onFocus={e => {
            e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.2), inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
          onBlur={e => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
        />
        {isRegenerating && (
          <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: '#6366f1' }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: '#6366f1' }}>
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
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e8ecf4',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}
          onFocus={e => {
            e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(99,102,241,0.15), inset 0 1px 2px rgba(0,0,0,0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.1)';
          }}
        />
        <button
          type="submit"
          disabled={isRegenerating || !customPrompt.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 shadow-sm"
          style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px)',
            color: '#e8ecf4',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
        >
          <Wand2 className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
          Apply
        </button>
      </form>

      {/* Human-in-the-loop notice */}
      <div
        className="flex items-start gap-3 px-3.5 py-3 rounded-xl text-[11px] shadow-sm"
        style={{
          background: 'rgba(16,185,129,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16,185,129,0.15)',
          color: '#94a3b8'
        }}
      >
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#10b981' }} />
        <span>
          <strong style={{ color: '#e8ecf4' }}>Human-in-the-Loop:</strong> Sakha creates an editable draft in your Gmail.
          It will <strong style={{ color: '#e8ecf4' }}>never</strong> send emails automatically.
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm"
          style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px)',
            color: '#e8ecf4',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
        >
          {copied
            ? <><Check className="w-4 h-4" style={{ color: '#10b981' }} /><span style={{ color: '#10b981' }}>Copied!</span></>
            : <><Copy className="w-4 h-4" style={{ color: '#94a3b8' }} />Copy</>
          }
        </button>

        <div className="flex items-center gap-2">
          {createdDraftInfo?.gmail_link && (
            <a
              href={createdDraftInfo.gmail_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
              style={{
                background: 'rgba(34,211,238,0.05)',
                backdropFilter: 'blur(20px)',
                color: '#22d3ee',
                border: '1px solid rgba(34,211,238,0.2)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.05)'; }}
            >
              Open Gmail <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleCreateGmailDraft}
            disabled={isCreatingDraft}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              boxShadow: '0 4px 15px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: 'none'
            }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,211,238,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
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
