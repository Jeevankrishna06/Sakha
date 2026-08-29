import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',      label: 'All' },
  { id: 'critical', label: 'Critical', dot: '#ef4444' },
  { id: 'high',     label: 'High',     dot: '#f97316' },
  { id: 'medium',   label: 'Medium',   dot: '#f59e0b' },
  { id: 'low',      label: 'Low',      dot: '#3b82f6' },
  { id: 'awaiting', label: 'Awaiting', dot: '#a855f7' }
];

export default function LeadFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  totalResults
}) {
  return (
    <div
      className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between my-4 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    >

      {/* ── Search ── */}
      <div className="relative flex-1 min-w-[220px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#4a5568' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, company, topic…"
          className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#f0f4fc'
          }}
          onFocus={e => {
            e.currentTarget.style.border = '1px solid rgba(0,208,132,0.4)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,208,132,0.08)';
          }}
          onBlur={e => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
            e.currentTarget.style.boxShadow = '';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            style={{ color: '#4a5568' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0f4fc'}
            onMouseLeave={e => e.currentTarget.style.color = '#4a5568'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Category pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus-ring"
              style={{
                background: active ? 'rgba(0,208,132,0.12)' : 'rgba(255,255,255,0.04)',
                color: active ? '#00d084' : '#8b98b4',
                border: `1px solid ${active ? 'rgba(0,208,132,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f0f4fc'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#8b98b4'; }}
            >
              {cat.dot && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: cat.dot }}
                />
              )}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Sort + count ── */}
      <div className="flex items-center gap-3 shrink-0">
        {totalResults !== undefined && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ color: '#4a5568', background: 'rgba(255,255,255,0.04)' }}>
            {totalResults} lead{totalResults !== 1 ? 's' : ''}
          </span>
        )}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 shrink-0" style={{ color: '#4a5568' }} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#c9d1e0'
            }}
          >
            <option value="urgency">By Urgency</option>
            <option value="recency">By Last Contact</option>
            <option value="company">By Company</option>
          </select>
        </div>
      </div>

    </div>
  );
}
