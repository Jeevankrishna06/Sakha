import React from 'react';
import { Flame, AlertTriangle, Clock, Inbox, TrendingUp } from 'lucide-react';

const CARDS = [
  {
    id: 'critical',
    label: 'Critical',
    sub: 'Urgency 9–10',
    key: 'critical_count',
    fallback: 1,
    Icon: Flame,
    accent: '#ef4444',
    glow: 'rgba(239,68,68,0.15)',
    ring: 'rgba(239,68,68,0.4)',
    grad: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))'
  },
  {
    id: 'high',
    label: 'High Priority',
    sub: 'Urgency 7–8',
    key: 'high_priority_count',
    fallback: 2,
    Icon: AlertTriangle,
    accent: '#f97316',
    glow: 'rgba(249,115,22,0.15)',
    ring: 'rgba(249,115,22,0.4)',
    grad: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))'
  },
  {
    id: 'due_today',
    label: 'Due Today',
    sub: 'Needs action now',
    key: 'due_today_count',
    fallback: 3,
    Icon: Clock,
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    ring: 'rgba(245,158,11,0.4)',
    grad: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))'
  },
  {
    id: 'awaiting',
    label: 'Awaiting Reply',
    sub: 'Ball in our court',
    key: 'awaiting_response_count',
    fallback: 2,
    Icon: Inbox,
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.15)',
    ring: 'rgba(59,130,246,0.4)',
    grad: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))'
  },
  {
    id: 'all',
    label: 'Total Leads',
    sub: 'In vector memory',
    key: 'total_leads',
    fallback: 6,
    Icon: TrendingUp,
    accent: '#00d084',
    glow: 'rgba(0,208,132,0.15)',
    ring: 'rgba(0,208,132,0.4)',
    grad: 'linear-gradient(135deg, rgba(0,208,132,0.12), rgba(0,208,132,0.04))'
  }
];

export default function StatsOverview({ stats, activeFilter, onSelectFilter }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-6">
      {CARDS.map((c) => {
        const { Icon } = c;
        const count = stats?.[c.key] ?? c.fallback;
        const active = activeFilter === c.id;

        return (
          <button
            key={c.id}
            onClick={() => onSelectFilter(active ? 'all' : c.id)}
            className="relative group text-left rounded-2xl p-4 transition-all duration-200 overflow-hidden focus-ring"
            style={{
              background: active ? c.grad : 'rgba(255,255,255,0.025)',
              border: `1px solid ${active ? c.ring : 'rgba(255,255,255,0.07)'}`,
              boxShadow: active ? `0 0 30px ${c.glow}, 0 8px 32px rgba(0,0,0,0.4)` : '0 1px 1px rgba(0,0,0,0.3)',
              transform: active ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.border = `1px solid ${c.ring}`;
                e.currentTarget.style.background = c.grad;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                e.currentTarget.style.transform = '';
              }
            }}
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: `${c.glow}`,
                border: `1px solid ${c.ring}`
              }}
            >
              <Icon className="w-4 h-4" style={{ color: c.accent }} />
            </div>

            {/* Count */}
            <div className="text-3xl font-bold tracking-tight leading-none mb-1" style={{ color: active ? c.accent : '#f0f4fc' }}>
              {count}
            </div>

            {/* Labels */}
            <div className="text-xs font-semibold leading-tight" style={{ color: active ? c.accent : '#f0f4fc' }}>
              {c.label}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: active ? `${c.accent}99` : '#4a5568' }}>
              {c.sub}
            </div>

            {/* Active indicator dot */}
            {active && (
              <span
                className="absolute top-3 right-3 w-2 h-2 rounded-full pulse-dot"
                style={{ background: c.accent }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
