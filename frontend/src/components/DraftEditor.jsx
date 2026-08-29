import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Wand2,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { apiService } from '../services/api';

export default function DraftEditor({ lead, onDraftCreated, showToast }) {
  const [tone, setTone] = useState(lead.draft?.tone || 'Professional');
  const [subject, setSubject] = useState(lead.draft?.subject || `Re: ${lead.company} & Sakha`);
  const [body, setBody] = useState(lead.draft?.body || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdDraftInfo, setCreatedDraftInfo] = useState(null);

  useEffect(() => {
    if (lead?.draft) {
      setSubject(lead.draft.subject || `Re: ${lead.company} & Sakha`);
      setBody(lead.draft.body || '');
      setTone(lead.draft.tone || 'Professional');
    }
  }, [lead]);

  const tones = [
    { id: 'Professional', label: '💼 Professional' },
    { id: 'Warm & Friendly', label: '🤝 Warm & Friendly' },
    { id: 'Urgent / Action-Oriented', label: '⚡ Urgent Action' },
    { id: 'Short & Direct', label: '🎯 Short & Direct' }
  ];

  const handleToneChange = async (newTone) => {
    setTone(newTone);
    setIsRegenerating(true);
    try {
      const generated = await apiService.generateDraft(lead.id, newTone, customPrompt);
      if (generated?.body) {
        setBody(generated.body);
        if (generated.subject) setSubject(generated.subject);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCustomRegenerate = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setIsRegenerating(true);
    try {
      const generated = await apiService.generateDraft(lead.id, tone, customPrompt);
      if (generated?.body) {
        setBody(generated.body);
      }
      showToast('Draft regenerated with your custom instructions!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    showToast('Draft copied to clipboard!');
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
        showToast('Gmail Draft Created! Review it in your Gmail account.');
        if (onDraftCreated) onDraftCreated(result);
      }
    } catch (e) {
      showToast('Error creating draft in Gmail');
    } finally {
      setIsCreatingDraft(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Personalized Follow-Up Draft
          </h4>
        </div>
        <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Context-Aware RAG Draft
        </span>
      </div>

      {/* Tone Switcher */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
          Select Tone
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {tones.map((t) => (
            <button
              key={t.id}
              onClick={() => handleToneChange(t.id)}
              disabled={isRegenerating}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                tone === t.id
                  ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm shadow-emerald-950'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient & Subject */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-semibold w-12">To:</span>
          <span className="text-slate-200 font-mono">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-semibold w-12">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-slate-200 focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* Editable Body Textarea */}
      <div className="relative">
        <textarea
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isRegenerating}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none disabled:opacity-50"
          placeholder="AI follow-up draft..."
        />
        {isRegenerating && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Regenerating personalized draft with {tone} tone...</span>
          </div>
        )}
      </div>

      {/* Custom Rep Instruction Input */}
      <form onSubmit={handleCustomRegenerate} className="flex gap-2">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Custom tweak (e.g., 'Mention 10% pilot discount if signed by Friday')..."
          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={isRegenerating || !customPrompt.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Apply</span>
        </button>
      </form>

      {/* Human In The Loop Notice */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400">
        <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Human-in-the-Loop:</strong> Sakha will create an editable draft directly in your Gmail account. It will <strong>never</strong> send emails automatically.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>

        <div className="flex items-center gap-2">
          {createdDraftInfo?.gmail_link && (
            <a
              href={createdDraftInfo.gmail_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition-colors"
            >
              <span>Open in Gmail</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleCreateGmailDraft}
            disabled={isCreatingDraft}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all hover:shadow-emerald-900/40 active:scale-95 disabled:opacity-50"
          >
            {isCreatingDraft ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Draft...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Create Gmail Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
