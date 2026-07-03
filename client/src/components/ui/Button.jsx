import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const sizes = {
  sm: { padding: '5px 10px', fontSize: '0.78rem' },
  md: { padding: '7px 14px', fontSize: '0.82rem' },
  lg: { padding: '10px 20px', fontSize: '0.9rem' },
};

const Button = ({ children, variant = 'primary', size = 'md', isLoading = false, disabled = false, type = 'button', className = '', leftIcon, rightIcon, style = {}, ...props }) => {
  const { isDark } = useTheme();
  const [hovered, setHovered] = React.useState(false);

  const getVariantStyle = (v, hov) => {
    const isLight = !isDark;
    const styles = {
      primary:   {
        base:  { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', boxShadow: '0 0 12px rgba(99,102,241,0.2)' },
        hover: { background: 'linear-gradient(135deg,#5254cc,#7c3aed)' },
      },
      secondary: {
        base:  isLight
          ? { background: '#ffffff', color: '#374151', border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
          : { background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' },
        hover: isLight
          ? { background: '#f3f4f6', borderColor: 'rgba(0,0,0,0.2)' }
          : { background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)' },
      },
      danger: {
        base:  { background: isLight ? 'rgba(220,38,38,0.08)' : 'rgba(239,68,68,0.12)', color: isLight ? '#dc2626' : '#f87171', border: `1px solid ${isLight ? 'rgba(220,38,38,0.25)' : 'rgba(239,68,68,0.2)'}` },
        hover: { background: isLight ? 'rgba(220,38,38,0.14)' : 'rgba(239,68,68,0.2)' },
      },
      success: {
        base:  { background: isLight ? 'rgba(22,163,74,0.08)' : 'rgba(34,197,94,0.12)', color: isLight ? '#16a34a' : '#4ade80', border: `1px solid ${isLight ? 'rgba(22,163,74,0.25)' : 'rgba(34,197,94,0.2)'}` },
        hover: { background: isLight ? 'rgba(22,163,74,0.14)' : 'rgba(34,197,94,0.2)' },
      },
      ghost: {
        base:  { background: 'transparent', color: isLight ? '#6b7280' : 'rgba(148,163,184,0.8)', border: '1px solid transparent' },
        hover: { background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)' },
      },
    };
    const s = styles[v] || styles.primary;
    return hov ? { ...s.base, ...s.hover } : s.base;
  };

  const s = sizes[size] || sizes.md;
  const varStyle = getVariantStyle(variant, hovered && !disabled && !isLoading);

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ ...varStyle, ...s, cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon ? <span style={{ display: 'flex', alignItems: 'center' }}>{leftIcon}</span> : null}
      {children}
      {!isLoading && rightIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
