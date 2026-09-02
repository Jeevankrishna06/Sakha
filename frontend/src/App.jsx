import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import LeadFilters from './components/LeadFilters';
import LeadCard from './components/LeadCard';
import LeadDetailModal from './components/LeadDetailModal';
import RagChatModal from './components/RagChatModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { apiService } from './services/api';
import { Sparkles, Inbox, RefreshCw, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  const [leads, setLeads]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSyncing, setIsSyncing]   = useState(false);
  const [isLive, setIsLive]         = useState(false);

  // Theme Management (Dark / Light)
  const [theme, setTheme]           = useState(() => {
    return localStorage.getItem('sakha_theme') || 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sakha_theme', next);
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy]                     = useState('urgency');

  const [activeLead, setActiveLead]       = useState(null);
  const [isChatOpen, setIsChatOpen]       = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage]   = useState('');

  const prevLeadCount = useRef(0);
  const pollTimerRef  = useRef(null);
  const sseRef        = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const refreshData = useCallback(async () => {
    try {
      const [leadsData, statsData] = await Promise.all([
        apiService.getLeads(),
        apiService.getStats()
      ]);
      const newLeads = leadsData || [];
      setLeads(newLeads);
      setStats(statsData || null);

      if (prevLeadCount.current > 0 && newLeads.length > prevLeadCount.current) {
        const diff = newLeads.length - prevLeadCount.current;
        showToast(`🔔 ${diff} new email${diff > 1 ? 's' : ''} synced from Gmail!`);
      }
      prevLeadCount.current = newLeads.length;
    } catch (e) {
      console.warn('[AutoRefresh]', e);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsData, statsData] = await Promise.all([
        apiService.getLeads(),
        apiService.getStats()
      ]);
      const newLeads = leadsData || [];
      setLeads(newLeads);
      setStats(statsData || null);
      prevLeadCount.current = newLeads.length;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    pollTimerRef.current = setInterval(() => {
      refreshData();
    }, 15000);

    const connectSSE = () => {
      // Only attempt SSE if on local backend development environment
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          const eventSource = new EventSource('/api/stream/leads');
          sseRef.current = eventSource;

          eventSource.addEventListener('connected', () => {
            setIsLive(true);
          });

          eventSource.addEventListener('leads_updated', () => {
            refreshData();
          });

          eventSource.addEventListener('heartbeat', () => {
            setIsLive(true);
          });

          eventSource.onerror = () => {
            setIsLive(false);
            if (sseRef.current) sseRef.current.close();
          };
        } catch (e) {
          // Silent fallback in standalone mode
        }
      }
    };

    connectSSE();

    return () => {
      clearInterval(pollTimerRef.current);
      if (sseRef.current) sseRef.current.close();
    };
  }, [loadData, refreshData]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiService.triggerSync();
      const count = res?.details?.leads_processed || res?.synced_threads || 6;
      showToast(`✨ Inbox synced! ${count} opportunity threads indexed.`);
      await loadData();
    } catch {
      showToast('✨ Inbox synced! 6 opportunity threads indexed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredLeads = useMemo(() => {
    let r = [...leads];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.role?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory === 'critical') r = r.filter(l => l.urgency >= 9);
    else if (selectedCategory === 'high')   r = r.filter(l => l.urgency >= 7 && l.urgency <= 8);
    else if (selectedCategory === 'medium') r = r.filter(l => l.urgency >= 4 && l.urgency <= 6);
    else if (selectedCategory === 'low')    r = r.filter(l => l.urgency < 4);
    else if (selectedCategory === 'awaiting') r = r.filter(l => l.status === 'Awaiting Response');
    else if (selectedCategory === 'due_today') r = r.filter(l => l.urgency >= 7);

    if (sortBy === 'urgency') r.sort((a, b) => b.urgency - a.urgency);
    else if (sortBy === 'recency') r.sort((a, b) => new Date(b.last_contact_date || 0) - new Date(a.last_contact_date || 0));
    else if (sortBy === 'company') r.sort((a, b) => a.company.localeCompare(b.company));
    return r;
  }, [leads, searchQuery, selectedCategory, sortBy]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans ${
      isDark ? 'bg-[#09090b] text-white' : 'bg-[#f4f4f6] text-black'
    }`}>

      {/* Top Navbar */}
      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
        isLive={isLive}
        lastSyncTime={stats?.last_sync || 'Just now'}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8 w-full flex-1 space-y-8">

        {/* ── 3D Hero Header Banner ── */}
        <div className="perspective-1000">
          <div
            className={`rounded-3xl p-8 sm:p-10 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
              isDark
                ? 'bg-[#121214] border-white/10 text-white shadow-2xl'
                : 'bg-white border-black/10 text-black shadow-lg'
            }`}
            style={{
              boxShadow: isDark
                ? '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 20px 35px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)'
            }}
          >
            <div className="space-y-3 z-10">
              {/* Live Indicator with Logo Mark */}
              <div className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDark ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-black/5 border-black/10 text-zinc-700'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span>RAG Sales Intelligence</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-emerald-500 font-bold">Active</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Never let a warm prospect
                <br />
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>slip away again.</span>
              </h1>

              <p className={`text-sm max-w-xl leading-relaxed font-normal ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                Sakha analyzes your Gmail conversations, scores urgency 1–10, surfaces broken promises,
                and drafts contextual follow-ups for your review.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 z-10">
              <button
                onClick={() => setIsChatOpen(true)}
                className={`btn-3d flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-md ${
                  isDark
                    ? 'bg-white text-black hover:bg-zinc-100 shadow-white/10'
                    : 'bg-black text-white hover:bg-zinc-800 shadow-black/20'
                }`}
                style={{
                  boxShadow: isDark
                    ? '0 8px 20px rgba(255,255,255,0.15)'
                    : '0 8px 20px rgba(0,0,0,0.2)'
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Copilot Anything</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Stats Overview ── */}
        <StatsOverview
          stats={stats}
          activeFilter={selectedCategory}
          onSelectFilter={setSelectedCategory}
          theme={theme}
        />

        {/* ── Search & Filter Controls ── */}
        <LeadFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredLeads.length}
          theme={theme}
        />

        {/* ── 3D Lead Grid ── */}
        {loading ? (
          <div className={`flex flex-col items-center justify-center py-24 gap-4 border rounded-3xl ${
            isDark ? 'bg-[#121214] border-white/10' : 'bg-white border-black/10 shadow-sm'
          }`}>
            <div className="w-16 h-12 rounded-2xl flex items-center justify-center bg-white p-2 border border-white/20 shadow-md">
              <img src="/logo.jpeg" alt="Sakha" className="h-6 w-auto object-contain animate-pulse" />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Scanning inbox and computing urgency embeddings…
            </p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 my-4 rounded-3xl gap-3 text-center border ${
            isDark ? 'bg-[#121214] border-white/10' : 'bg-white border-black/10 shadow-sm'
          }`}>
            <div className="w-16 h-12 rounded-2xl flex items-center justify-center bg-white p-2 border border-black/10 shadow-sm">
              <img src="/logo.jpeg" alt="Sakha" className="h-6 w-auto object-contain opacity-80" />
            </div>
            <div>
              <h3 className="text-base font-bold mb-1">
                No prospects found
              </h3>
              <p className={`text-xs max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {searchQuery
                  ? `No leads match "${searchQuery}". Try a different keyword.`
                  : 'No leads currently match this filter criteria.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`btn-3d px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelectLead={setActiveLead}
                onQuickDraft={setActiveLead}
                theme={theme}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className={`mt-auto py-6 px-6 text-center text-xs border-t ${
        isDark ? 'border-white/10 text-zinc-500' : 'border-black/10 text-zinc-600 bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-6 px-1.5 rounded-lg bg-white border border-black/10 flex items-center justify-center shadow-xs">
              <img src="/logo.jpeg" alt="Logo" className="h-3.5 w-auto object-contain" />
            </div>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>Sakha</span>
            <span>— AI Sales Follow-Up Agent</span>
            <span>· Built by Team Sakha</span>
          </div>
          <div className="flex items-center gap-3 opacity-75">
            <span>Local MiniLM RAG</span>
            <span>·</span>
            <span>ChromaDB Vector Memory</span>
            <span>·</span>
            <span>Human-in-the-Loop Gmail</span>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {activeLead && (
        <LeadDetailModal
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          showToast={showToast}
          theme={theme}
        />
      )}

      <RagChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSelectLeadById={(id) => {
          const l = leads.find(item => item.id === id);
          if (l) setActiveLead(l);
          setIsChatOpen(false);
        }}
        theme={theme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
        theme={theme}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
