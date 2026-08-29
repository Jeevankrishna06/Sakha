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
      className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between my-4 px-4 py-3.5 rounded-xl backdrop-blur-xl"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 24px -4px rgba(0,0,0,0.5)'
      }}
    >

      {/* ── Search ── */}
      <div className="relative flex-1 min-w-[220px] group">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors group-focus-within:text-[#6366f1]"
          style={{ color: '#475569' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, company, topic…"
          className="w-full pl-10 pr-9 py-2 text-[13px] rounded-xl focus:outline-none transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e8ecf4',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          onFocus={e => {
            e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.15), inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
          onBlur={e => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200"
            style={{ color: '#475569', background: 'transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#e8ecf4';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Category pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 px-1 py-0.5">
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-300"
              style={{
                background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)' : 'rgba(255,255,255,0.02)',
                color: active ? '#e8ecf4' : '#94a3b8',
                border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: active ? '0 0 12px rgba(99,102,241,0.1), inset 0 1px 1px rgba(255,255,255,0.1)' : 'none'
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = '#e8ecf4';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                }
              }}
            >
              {cat.dot && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: cat.dot,
                    boxShadow: `0 0 8px ${cat.dot}80`
                  }}
                />
              )}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Sort + count ── */}
      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 mt-1 md:mt-0">
        {totalResults !== undefined && (
          <span
            className="text-[13px] font-medium px-3 py-1.5 rounded-lg backdrop-blur-md"
            style={{
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <strong style={{ color: '#e8ecf4', fontWeight: 600 }}>{totalResults}</strong> lead{totalResults !== 1 ? 's' : ''}
          </span>
        )}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 shrink-0 hidden md:block" style={{ color: '#475569' }} />
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none rounded-xl pl-3 pr-8 py-1.5 text-[13px] font-medium focus:outline-none transition-all cursor-pointer backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#e8ecf4'
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="urgency" style={{ background: '#050810' }}>By Urgency</option>
              <option value="recency" style={{ background: '#050810' }}>By Last Contact</option>
              <option value="company" style={{ background: '#050810' }}>By Company</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
