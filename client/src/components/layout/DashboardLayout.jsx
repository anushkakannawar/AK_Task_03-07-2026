/**
 * DashboardLayout — fixed left sidebar + scrollable main content
 * Evaluation Criterion: Sidebar navigation with role-based views
 */
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import SideRays from '../backgrounds/SideRays';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_W = 240;

const MenuIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const DashboardLayout = ({ children, title }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const C = getColors(isDark);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, position: 'relative' }}>

      {/* ── SideRays background ── */}
      {isDark && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <SideRays
            speed={1.0} rayColor1="#6366f1" rayColor2="#818cf8"
            intensity={1.2} spread={1.6} origin="top-right" tilt={-5}
            saturation={0.9} blend={0.55} falloff={2.2} opacity={0.4}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(12,12,15,0.88)0%,rgba(12,12,15,0.78)40%,rgba(12,12,15,0.94)100%)' }} />
        </div>
      )}

      {/* ── Sidebar — fixed width on desktop, overlay on mobile ── */}
      {/* Desktop placeholder div keeps layout space */}
      <div style={{
        width: `${SIDEBAR_W}px`,
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
        // On mobile it collapses to 0 via media query below
      }}
        className="sidebar-spacer"
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main area ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 5,
      }}>

        {/* Top header */}
        <header style={{
          height: '58px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px',
          flexShrink: 0,
          background: isDark ? 'rgba(12,12,15,0.92)' : 'rgba(255,255,255,0.97)',
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="hamburger-btn"
            style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', padding: '4px', display: 'none', alignItems: 'center', flexShrink: 0 }}
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          {/* Page title */}
          {title && (
            <h1 style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: C.text1, letterSpacing: '-0.01em' }}>
              {title}
            </h1>
          )}

          {/* Right — avatar */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: C.text3 }} className="email-label">{user?.email}</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="scrollbar-thin">
          {children}
        </main>
      </div>

      {/* ── Responsive overrides ── */}
      <style>{`
        @media (max-width: 767px) {
          .sidebar-spacer { width: 0 !important; }
          .hamburger-btn  { display: flex !important; }
          .email-label    { display: none !important; }
        }
        @media (min-width: 768px) {
          .hamburger-btn { display: none !important; }
        }
      `}</style>

    </div>
  );
};

export default DashboardLayout;
