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
import { Sparkles, Inbox, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  const [leads, setLeads]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSyncing, setIsSyncing]   = useState(false);
  const [isLive, setIsLive]         = useState(false);

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

  // Silent data refresh (no loading spinner — used by auto-poll & SSE)
  const refreshData = useCallback(async () => {
    try {
      const [leadsData, statsData] = await Promise.all([
        apiService.getLeads(),
        apiService.getStats()
      ]);
      const newLeads = leadsData || [];
      setLeads(newLeads);
      setStats(statsData || null);

      // Notify user if new leads appeared
      if (prevLeadCount.current > 0 && newLeads.length > prevLeadCount.current) {
        const diff = newLeads.length - prevLeadCount.current;
        showToast(`🔔 ${diff} new email${diff > 1 ? 's' : ''} synced from Gmail!`);
      }
      prevLeadCount.current = newLeads.length;
    } catch (e) { console.error('[AutoRefresh]', e); }
  }, []);

  // Initial full load (shows loading spinner)
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // ── Setup: Initial load + Auto-poll every 15s + SSE real-time listener ──
  useEffect(() => {
    loadData();

    // Auto-poll every 15 seconds (silent background refresh)
    pollTimerRef.current = setInterval(() => {
      refreshData();
    }, 15000);

    // SSE real-time push connection
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/stream/leads');
        sseRef.current = eventSource;

        eventSource.addEventListener('connected', () => {
          setIsLive(true);
          console.log('[SSE] Real-time connection established');
        });

        eventSource.addEventListener('leads_updated', (e) => {
          console.log('[SSE] New email event received:', e.data);
          // Immediately refresh dashboard data
          refreshData();
        });

        eventSource.addEventListener('heartbeat', () => {
          setIsLive(true);
        });

        eventSource.onerror = () => {
          setIsLive(false);
          eventSource.close();
          // Reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (e) {
        console.warn('[SSE] EventSource not available, using polling only.');
      }
    };
    connectSSE();

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (sseRef.current) sseRef.current.close();
    };
  }, [loadData, refreshData]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiService.syncInbox();
      await refreshData();
      showToast(res?.message || 'Inbox synced and re-indexed!');
    } catch { showToast('Error syncing inbox.'); }
    finally { setIsSyncing(false); }
  };

  const showToast = (msg) => setToastMessage(msg);

  const filteredLeads = useMemo(() => {
    let r = [...leads];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.role.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
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

  return (
    <div style={{ minHeight: '100vh', background: '#06090f', color: '#f0f4fc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
        isLive={isLive}
        lastSyncTime={stats?.last_sync || 'Just now'}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 40px', width: '100%' }}>

        {/* ── Hero Banner ── */}
        <div
          className="relative rounded-3xl overflow-hidden mb-8 p-6 sm:p-8"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Aurora blobs */}
          <div className="aurora-blob" style={{ width: 320, height: 320, top: -80, left: -60, background: 'rgba(0,208,132,0.08)', animationDelay: '0s' }} />
          <div className="aurora-blob" style={{ width: 240, height: 240, top: -40, right: 80, background: 'rgba(59,130,246,0.06)', animationDelay: '-4s' }} />
          <div className="aurora-blob" style={{ width: 180, height: 180, bottom: -60, right: -40, background: 'rgba(168,85,247,0.06)', animationDelay: '-8s' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', color: '#00d084' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: '#00d084', opacity: 0.6 }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#00d084' }} />
                </span>
                RAG Sales Intelligence — Active
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: '#f0f4fc', lineHeight: 1.2 }}>
                Never let a warm prospect
                <br />
                <span style={{ color: '#00d084' }}>slip away again.</span>
              </h2>

              <p className="text-sm max-w-xl leading-relaxed" style={{ color: '#8b98b4' }}>
                Sakha analyzes your Gmail conversations, scores urgency 1–10, surfaces buying intent signals,
                and drafts contextual follow-ups for your review.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #00d084, #00a86b)',
                  boxShadow: '0 8px 32px rgba(0,208,132,0.3), 0 0 0 1px rgba(0,208,132,0.4)'
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,208,132,0.45), 0 0 0 1px rgba(0,208,132,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,208,132,0.3), 0 0 0 1px rgba(0,208,132,0.4)'; e.currentTarget.style.transform = ''; }}
              >
                <Sparkles className="w-4.5 h-4.5" />
                Ask Copilot Anything
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Stats ── */}
        <StatsOverview stats={stats} activeFilter={selectedCategory} onSelectFilter={setSelectedCategory} />

        {/* ── Filters ── */}
        <LeadFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredLeads.length}
        />

        {/* ── Lead Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.2)' }}
            >
              <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00d084' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#4a5568' }}>
              Scanning inbox and computing urgency embeddings…
            </p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 my-6 rounded-3xl gap-4 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Inbox className="w-7 h-7" style={{ color: '#4a5568' }} />
            </div>
            <div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: '#f0f4fc' }}>No prospects found</h3>
              <p className="text-sm max-w-sm" style={{ color: '#4a5568' }}>
                {searchQuery
                  ? `No leads match "${searchQuery}". Try a different search.`
                  : 'All prospects in this category are up to date.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#c9d1e0', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {filteredLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelectLead={setActiveLead}
                onQuickDraft={setActiveLead}
              />
            ))}
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer
        className="mt-auto py-5 px-5 text-center text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#4a5568' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: '#8b98b4' }}>Sakha</span>
            <span>— AI Sales Follow-Up Agent</span>
            <span>· Built by Team Sakha</span>
          </div>
          <div className="flex items-center gap-3" style={{ color: '#2d3748' }}>
            {['Local MiniLM RAG', 'ChromaDB Vector Memory', 'Human-in-the-Loop Gmail'].map((s, i, arr) => (
              <React.Fragment key={s}>
                <span>{s}</span>
                {i < arr.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {activeLead && (
        <LeadDetailModal lead={activeLead} onClose={() => setActiveLead(null)} showToast={showToast} />
      )}

      <RagChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSelectLeadById={(id) => {
          const l = leads.find(item => item.id === id);
          if (l) setActiveLead(l);
          setIsChatOpen(false);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
