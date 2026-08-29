import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import LeadFilters from './components/LeadFilters';
import LeadCard from './components/LeadCard';
import LeadDetailModal from './components/LeadDetailModal';
import RagChatModal from './components/RagChatModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { apiService } from './services/api';
import { 
  Sparkles, 
  Inbox, 
  RefreshCw, 
  Flame, 
  Clock, 
  CheckCircle2,
  Mail,
  Zap
} from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  // Modals
  const [activeLead, setActiveLead] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, statsData] = await Promise.all([
        apiService.getLeads(),
        apiService.getStats()
      ]);
      setLeads(leadsData || []);
      setStats(statsData || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiService.syncInbox();
      await loadData();
      showToast(res?.message || 'Inbox synced and re-indexed successfully!');
    } catch (e) {
      showToast('Error syncing inbox.');
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Filter and Sort Computation
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.role.toLowerCase().includes(q) ||
        lead.reason.toLowerCase().includes(q) ||
        lead.category.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory === 'critical') {
      result = result.filter(l => l.urgency >= 9);
    } else if (selectedCategory === 'high') {
      result = result.filter(l => l.urgency >= 7 && l.urgency <= 8);
    } else if (selectedCategory === 'medium') {
      result = result.filter(l => l.urgency >= 4 && l.urgency <= 6);
    } else if (selectedCategory === 'low') {
      result = result.filter(l => l.urgency < 4);
    } else if (selectedCategory === 'awaiting') {
      result = result.filter(l => l.status === 'Awaiting Response');
    } else if (selectedCategory === 'due_today') {
      result = result.filter(l => l.urgency >= 7);
    }

    // 3. Sorting
    if (sortBy === 'urgency') {
      result.sort((a, b) => b.urgency - a.urgency);
    } else if (sortBy === 'recency') {
      result.sort((a, b) => new Date(b.last_contact_date || 0) - new Date(a.last_contact_date || 0));
    } else if (sortBy === 'company') {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    return result;
  }, [leads, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
        lastSyncTime={stats?.last_sync || 'Just now'}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Hero & Value Proposition Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 sm:p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RAG Sales Intelligence Activated</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Never Let a Warm Prospect Slip Away
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Sakha analyzes your Gmail conversations, scores urgency (1–10), surfaces buying intent signals, and drafts contextual follow-ups for your review.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all hover:shadow-emerald-900/40 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Copilot Anything</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Stats Overview */}
        <StatsOverview
          stats={stats}
          activeFilter={selectedCategory}
          onSelectFilter={setSelectedCategory}
        />

        {/* Search, Filter Pills & Sort Controls */}
        <LeadFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredLeads.length}
        />

        {/* Lead Grid or Empty State */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-400" />
            <p className="text-sm font-medium">Scanning Gmail inbox and calculating urgency embeddings...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center glass-card rounded-2xl border border-slate-800 space-y-3 my-8">
            <Inbox className="w-10 h-10 mx-auto text-slate-500" />
            <h3 className="text-base font-bold text-white">No follow-ups found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery 
                ? `No prospects match the query "${searchQuery}". Try searching with different keywords.` 
                : "All prospects in this category are up to date! Great work."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 mt-2"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
            {filteredLeads.map((lead) => (
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Sakha</span>
            <span>— AI Sales Follow-Up Agent</span>
            <span className="text-slate-400">• Built by Team Sakha</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Local MiniLM RAG</span>
            <span>•</span>
            <span>ChromaDB Vector Memory</span>
            <span>•</span>
            <span>Human-in-the-Loop Gmail Drafts</span>
          </div>
        </div>
      </footer>

      {/* Lead Detail & AI Copilot Modal */}
      {activeLead && (
        <LeadDetailModal
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          showToast={showToast}
        />
      )}

      {/* "Ask Sakha" RAG Chat Drawer */}
      <RagChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSelectLeadById={(id) => {
          const l = leads.find(item => item.id === id);
          if (l) setActiveLead(l);
          setIsChatOpen(false);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />

      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />

    </div>
  );
}
