import React from 'react';
import { 
  Flame, 
  AlertTriangle, 
  Clock, 
  Inbox, 
  TrendingUp 
} from 'lucide-react';

export default function StatsOverview({ stats, activeFilter, onSelectFilter }) {
  const cards = [
    {
      id: 'critical',
      label: 'Critical Urgency (9-10)',
      count: stats?.critical_count ?? 1,
      subtext: 'Pricing / Overdue promises',
      icon: Flame,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      activeBorder: 'ring-2 ring-red-500 bg-red-950/30'
    },
    {
      id: 'high',
      label: 'High Priority (7-8)',
      count: stats?.high_priority_count ?? 2,
      subtext: 'Demo & contract discussions',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      activeBorder: 'ring-2 ring-orange-500 bg-orange-950/30'
    },
    {
      id: 'due_today',
      label: 'Action Due Today',
      count: stats?.due_today_count ?? 3,
      subtext: 'Prospect waiting on reply',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      activeBorder: 'ring-2 ring-amber-500 bg-amber-950/30'
    },
    {
      id: 'awaiting',
      label: 'Awaiting Response',
      count: stats?.awaiting_response_count ?? 2,
      subtext: 'Ball in salesperson court',
      icon: Inbox,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      activeBorder: 'ring-2 ring-blue-500 bg-blue-950/30'
    },
    {
      id: 'all',
      label: 'Total Active Leads',
      count: stats?.total_leads ?? 6,
      subtext: 'Indexed in vector memory',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      activeBorder: 'ring-2 ring-emerald-500 bg-emerald-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter(isActive ? 'all' : card.id)}
            className={`cursor-pointer rounded-xl p-4 transition-all duration-200 glass-card ${
              isActive ? card.activeBorder : `${card.border} hover:bg-slate-900/80 hover:translate-y-[-2px]`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                {card.count}
              </span>
              <span className="text-[11px] text-slate-400 font-normal truncate">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
