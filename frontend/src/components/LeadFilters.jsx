import React from 'react';
import { Search, X, ArrowUpDown, Command } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',      label: 'All Leads' },
  { id: 'critical', label: 'Critical', dot: '#ef4444' },
  { id: 'high',     label: 'High',     dot: '#ffffff', lightDot: '#000000' },
  { id: 'medium',   label: 'Medium',   dot: '#a1a1aa', lightDot: '#71717a' },
  { id: 'low',      label: 'Low',      dot: '#71717a', lightDot: '#a1a1aa' },
  { id: 'awaiting', label: 'Awaiting Reply', dot: '#f59e0b' }
];

export default function LeadFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  totalResults,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between my-2">
      
      {/* ── 3D Tactile Search Bar ── */}
      <div className="relative flex-1 min-w-[280px] group">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
            isDark
              ? 'text-zinc-400 group-focus-within:text-white'
              : 'text-zinc-500 group-focus-within:text-black'
          }`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search prospects, companies, topics or signals…"
          className={`w-full pl-11 pr-20 py-3 text-xs sm:text-[13px] rounded-2xl border transition-all shadow-sm focus:outline-none ${
            isDark
              ? 'bg-[#121214] border-white/10 text-white placeholder:text-zinc-500 focus:border-white focus:bg-[#18181b] focus:shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
              : 'bg-white border-black/10 text-black placeholder:text-zinc-400 focus:border-black focus:shadow-[0_8px_20px_rgba(0,0,0,0.06)]'
          }`}
          style={{
            boxShadow: isDark
              ? 'inset 0 1px 2px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
              : 'inset 0 1px 2px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.04)'
          }}
        />

        {/* Right Action Badge / Clear Button */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className={`w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                isDark
                  ? 'bg-white/10 text-zinc-400 hover:text-white'
                  : 'bg-black/10 text-zinc-600 hover:text-black'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className={`hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono rounded select-none pointer-events-none border ${
              isDark
                ? 'text-zinc-400 bg-white/5 border-white/10'
                : 'text-zinc-500 bg-black/5 border-black/10'
            }`}>
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          )}
        </div>
      </div>

      {/* ── Category Pills (3D Tactile Container) ── */}
      <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 p-1.5 rounded-2xl border shadow-sm ${
        isDark
          ? 'bg-[#121214] border-white/10'
          : 'bg-white border-black/10 shadow-sm'
      }`}>
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.id;
          const dotColor = isDark ? cat.dot : (cat.lightDot || cat.dot);

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn-3d flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? isDark
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-black text-white font-bold shadow-md'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                    : 'text-zinc-600 hover:text-black hover:bg-black/5'
              }`}
              style={{
                boxShadow: active
                  ? isDark
                    ? '0 4px 10px rgba(255,255,255,0.15)'
                    : '0 4px 10px rgba(0,0,0,0.15)'
                  : 'none'
              }}
            >
              {cat.dot && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: active && cat.id !== 'critical' && cat.id !== 'awaiting'
                      ? (isDark ? '#000000' : '#ffffff')
                      : dotColor
                  }}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Sort Dropdown & Results Counter ── */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
        {totalResults !== undefined && (
          <span className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
            isDark
              ? 'bg-[#121214] border-white/10 text-zinc-300'
              : 'bg-white border-black/10 text-zinc-700 shadow-sm'
          }`}>
            <strong className={isDark ? 'text-white' : 'text-black'}>{totalResults}</strong> lead{totalResults !== 1 ? 's' : ''}
          </span>
        )}

        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={`btn-3d appearance-none rounded-xl pl-3 pr-8 py-2 text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#121214] border-white/10 text-zinc-300 hover:text-white focus:border-white'
                : 'bg-white border-black/10 text-zinc-700 hover:text-black focus:border-black shadow-sm'
            }`}
          >
            <option value="urgency" style={{ background: isDark ? '#121214' : '#ffffff' }}>By Urgency</option>
            <option value="recency" style={{ background: isDark ? '#121214' : '#ffffff' }}>By Last Contact</option>
            <option value="company" style={{ background: isDark ? '#121214' : '#ffffff' }}>By Company</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
            <ArrowUpDown className="w-3 h-3" />
          </div>
        </div>
      </div>

    </div>
  );
}
