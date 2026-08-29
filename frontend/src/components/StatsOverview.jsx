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
    accent: '#10b981', // Changed flat green to emerald from the design system
    glow: 'rgba(16,185,129,0.15)',
    ring: 'rgba(16,185,129,0.4)',
    grad: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))'
  }
];

export default function StatsOverview({ stats, activeFilter, onSelectFilter }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-6">
      {CARDS.map((c) => {
        const { Icon } = c;
        const count = stats?.[c.key] ?? c.fallback;
        const active = activeFilter === c.id;

        return (
          <button
            key={c.id}
            onClick={() => onSelectFilter(active ? 'all' : c.id)}
            className="relative group text-left rounded-xl p-5 transition-all duration-300 ease-out overflow-hidden focus-ring flex flex-col justify-between min-h-[140px]"
            style={{
              background: active ? c.grad : 'rgba(255,255,255,0.035)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${active ? c.ring : 'rgba(255,255,255,0.06)'}`,
              boxShadow: active ? `0 0 40px ${c.glow}, inset 0 0 20px ${c.glow}` : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transform: active ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.border = `1px solid ${c.ring}`;
                e.currentTarget.style.background = c.grad;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${c.glow}, 0 8px 10px -6px rgba(0, 0, 0, 0.1)`;
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }
            }}
          >
            {/* Background Noise Texture */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
            />

            {/* Header: Icon & Indicator */}
            <div className="flex justify-between items-start w-full relative z-10 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${c.glow}, transparent)`,
                  border: `1px solid ${c.ring}`
                }}
              >
                <Icon className="w-5 h-5 drop-shadow-md" style={{ color: c.accent }} />
              </div>

              {/* Active indicator ring */}
              {active && (
                <div className="relative flex items-center justify-center w-4 h-4">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                    style={{ backgroundColor: c.accent }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: c.accent, boxShadow: `0 0 8px ${c.accent}` }}
                  />
                </div>
              )}
            </div>

            {/* Content: Count & Labels */}
            <div className="relative z-10">
              <div 
                className="text-4xl font-extrabold tracking-tight mb-1 transition-colors duration-300" 
                style={{ 
                  color: active ? c.accent : '#e8ecf4',
                  textShadow: active ? `0 0 20px ${c.glow}` : '0 2px 10px rgba(0,0,0,0.5)'
                }}
              >
                {count}
              </div>

              <div 
                className="text-sm font-medium tracking-wide transition-colors duration-300" 
                style={{ color: active ? '#e8ecf4' : '#94a3b8' }}
              >
                {c.label}
              </div>
              <div 
                className="text-xs mt-1 transition-colors duration-300" 
                style={{ color: active ? 'rgba(232,236,244,0.7)' : '#475569' }}
              >
                {c.sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
