import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function LeadFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  sortBy,
  setSortBy,
  totalResults
}) {
  const categories = [
    { id: 'all', label: 'All Prospects' },
    { id: 'critical', label: '🔴 Critical (9-10)' },
    { id: 'high', label: '🟠 High (7-8)' },
    { id: 'medium', label: '🟡 Medium (4-6)' },
    { id: 'low', label: '🔵 Low (1-3)' },
    { id: 'awaiting', label: '⏳ Awaiting Reply' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between my-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
      
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search prospects by name, company, or discussion topic..."
          className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-semibold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="urgency">Sort by Urgency (Highest)</option>
          <option value="recency">Sort by Last Contact</option>
          <option value="company">Sort by Company Name</option>
        </select>
      </div>

    </div>
  );
}
