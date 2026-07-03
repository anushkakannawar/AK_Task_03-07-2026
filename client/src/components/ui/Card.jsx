import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const Card = ({ children, className = '', padding = true }) => (
  <div className={`glass-card ${padding ? 'p-5' : ''} ${className}`}>
    {children}
  </div>
);

const StatIcons = {
  employees:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  departments:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  leaves:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  check:      'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  money:      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const accentMap = {
  blue:   { accent: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: '#818cf8' },
  green:  { accent: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: '#4ade80' },
  yellow: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '#fbbf24' },
  red:    { accent: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '#f87171' },
  purple: { accent: '#a855f7', bg: 'rgba(168,85,247,0.12)',  icon: '#c084fc' },
};

export const StatCard = ({ title, value, icon, color = 'blue', isLoading = false }) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const a = accentMap[color] || accentMap.blue;
  const iconPath = StatIcons[icon] || StatIcons.check;

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: '14px', padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: a.accent, opacity: 0.5, borderRadius: '14px 14px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.7rem', color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
            {title}
          </p>
          {isLoading ? (
            <div style={{ height: '32px', width: '64px', background: C.border, borderRadius: '6px' }} />
          ) : (
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: C.text1, letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
              {value}
            </p>
          )}
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={a.icon} strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Card;
