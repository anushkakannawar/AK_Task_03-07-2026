/**
 * Theme color utility — call useColors() inside any component
 * Returns the correct color set for current dark/light mode
 */
export const getColors = (isDark) => ({
  // Text
  text1:    isDark ? '#f1f5f9'               : '#0f172a',
  text2:    isDark ? '#cbd5e1'               : '#1e293b',
  text3:    isDark ? 'rgba(148,163,184,0.8)' : '#475569',
  text4:    isDark ? 'rgba(148,163,184,0.5)' : '#94a3b8',
  textMuted:isDark ? 'rgba(100,116,139,0.65)': '#94a3b8',

  // Backgrounds
  bg:       isDark ? '#0c0c0f'               : '#f0f4f8',
  card:     isDark ? 'rgba(255,255,255,0.04)': '#ffffff',
  cardSolid:isDark ? '#131318'               : '#ffffff',
  panel:    isDark ? 'rgba(255,255,255,0.04)': '#f8fafc',
  input:    isDark ? 'rgba(255,255,255,0.06)': '#ffffff',
  hover:    isDark ? 'rgba(255,255,255,0.04)': '#f8fafc',

  // Borders
  border:   isDark ? 'rgba(255,255,255,0.09)': 'rgba(0,0,0,0.1)',
  borderSub:isDark ? 'rgba(255,255,255,0.06)': 'rgba(0,0,0,0.07)',
  inputBorder:isDark?'rgba(255,255,255,0.12)': 'rgba(0,0,0,0.18)',

  // Semantic colors — visible in both modes
  green:    isDark ? '#4ade80' : '#16a34a',
  red:      isDark ? '#f87171' : '#dc2626',
  amber:    isDark ? '#fbbf24' : '#b45309',
  indigo:   isDark ? '#818cf8' : '#4f46e5',
  purple:   isDark ? '#c084fc' : '#7c3aed',

  // Chart/grid
  gridLine: isDark ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.07)',
  tickColor:isDark ? '#64748b'               : '#94a3b8',
  chartBg:  isDark ? 'rgba(12,12,20,0.95)'   : '#ffffff',
  chartBorder:isDark?'rgba(255,255,255,0.08)': 'rgba(0,0,0,0.1)',

  // Modal
  modalBg:  isDark ? '#131318'               : '#ffffff',
  modalBorder:isDark?'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
});
