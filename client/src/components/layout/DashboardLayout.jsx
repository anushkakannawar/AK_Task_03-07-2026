/**
 * DashboardLayout — top nav + SideRays background
 * Supports dark/light mode via ThemeContext
 */
import React from 'react';
import TopNav from './TopNav';
import SideRays from '../backgrounds/SideRays';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ children, title }) => {
  const { isDark } = useTheme();

  return (
    <div className="dashboard-page" style={{ position: 'relative', minHeight: '100vh', background: isDark ? '#0c0c0f' : '#f0f4f8', overflow: 'hidden' }}>

      {/* SideRays — only show in dark mode for subtlety */}
      {isDark && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <SideRays
            speed={1.0}
            rayColor1="#6366f1"
            rayColor2="#818cf8"
            intensity={1.2}
            spread={1.6}
            origin="top-right"
            tilt={-5}
            saturation={0.9}
            blend={0.55}
            falloff={2.2}
            opacity={0.45}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(12,12,15,0.82) 0%, rgba(12,12,15,0.72) 40%, rgba(12,12,15,0.92) 100%)',
          }} />
        </div>
      )}

      {/* Top navigation */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TopNav />
      </div>

      {/* Page content */}
      <main
        style={{ position: 'relative', zIndex: 5, padding: '24px', maxWidth: '1400px', margin: '0 auto' }}
        className="scrollbar-thin"
      >
        {title && (
          <h1 style={{
            color: isDark ? '#f1f5f9' : '#0f172a',
            fontWeight: 600, fontSize: '1.2rem',
            marginBottom: '20px', letterSpacing: '-0.01em',
          }}>
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
