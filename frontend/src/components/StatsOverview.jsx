import React from 'react';
import { Flame, AlertTriangle, Clock, Inbox, TrendingUp } from 'lucide-react';

const STATS_CARDS = [
  {
    id: 'critical',
    label: 'Critical',
    sub: 'Urgency 9–10',
    key: 'critical_count',
    fallback: 1,
    Icon: Flame,
    isCritical: true // Critical exception in Red
  },
  {
    id: 'high',
    label: 'High Priority',
    sub: 'Urgency 7–8',
    key: 'high_priority_count',
    fallback: 2,
    Icon: AlertTriangle,
    isHigh: true
  },
  {
    id: 'due_today',
    label: 'Due Today',
    sub: 'Action required',
    key: 'due_today_count',
    fallback: 3,
    Icon: Clock,
    isContinued: true // Continued exception in Amber
  },
  {
    id: 'awaiting',
    label: 'Awaiting Reply',
    sub: 'Waiting on us',
    key: 'awaiting_response_count',
    fallback: 2,
    Icon: Inbox,
    isContinued: true // Continued exception
  },
  {
    id: 'all',
    label: 'Total Leads',
    sub: 'Indexed in memory',
    key: 'total_leads',
    fallback: 6,
    Icon: TrendingUp
  }
];

export default function StatsOverview({ stats, activeFilter, onSelectFilter, theme = 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 perspective-1000">
      {STATS_CARDS.map((c) => {
        const { Icon } = c;
        const count = stats?.[c.key] ?? c.fallback;
        const active = activeFilter === c.id;

        // Determine border, shadow, and color styling
        let cardBg = isDark ? '#121214' : '#ffffff';
        let cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        let accentColor = isDark ? '#ffffff' : '#000000';
        let iconBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

        if (c.isCritical) {
          accentColor = '#ef4444';
          iconBg = 'rgba(239, 68, 68, 0.15)';
          if (active) {
            cardBorder = '#ef4444';
            cardBg = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
          }
        } else if (c.isContinued) {
          accentColor = '#f59e0b';
          iconBg = 'rgba(245, 158, 11, 0.15)';
          if (active) {
            cardBorder = '#f59e0b';
            cardBg = isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)';
          }
        } else if (active) {
          cardBorder = isDark ? '#ffffff' : '#000000';
          cardBg = isDark ? '#1a1a1e' : '#f4f4f6';
        }

        return (
          <button
            key={c.id}
            onClick={() => onSelectFilter(active ? 'all' : c.id)}
            className={`card-3d text-left rounded-3xl p-5 flex flex-col justify-between min-h-[145px] relative overflow-hidden active:scale-95 cursor-pointer shadow-md ${
              isDark ? 'text-white' : 'text-black'
            }`}
            style={{
              background: cardBg,
              border: `1.5px solid ${cardBorder}`,
              boxShadow: isDark
                ? active
                  ? `0 14px 30px -5px ${c.isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.8)'}, inset 0 1px 0 rgba(255,255,255,0.15)`
                  : '0 8px 20px -4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
                : active
                  ? `0 14px 30px -5px ${c.isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.15)'}, inset 0 1px 0 rgba(255,255,255,1)`
                  : '0 6px 16px -2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            {/* Header: 3D Embossed Icon & Active Dot */}
            <div className="flex justify-between items-start w-full mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shadow-inner"
                style={{
                  background: iconBg,
                  color: accentColor,
                  boxShadow: isDark
                    ? 'inset 0 1px 1px rgba(255,255,255,0.1)'
                    : 'inset 0 1px 1px rgba(0,0,0,0.05)'
                }}
              >
                <Icon className="w-5 h-5" />
              </div>

              {active && (
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </div>

            {/* Content */}
            <div>
              <div
                className="text-3xl font-extrabold tracking-tight mb-1"
                style={{
                  color: c.isCritical ? '#ef4444' : c.isContinued ? '#f59e0b' : accentColor
                }}
              >
                {count}
              </div>

              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {c.label}
              </div>
              <div className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {c.sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
