/**
 * Sidebar — left vertical navigation
 * Role-based links, dark/light aware, collapsible on mobile
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const Icon = ({ path, size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const icons = {
  dashboard:  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  employees:  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  departments:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  attendance: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  leaves:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  payroll:    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  profile:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  logout:     'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
};

const adminNav = [
  { path: '/admin/dashboard',   label: 'Dashboard',   icon: 'dashboard' },
  { path: '/admin/employees',   label: 'Employees',   icon: 'employees' },
  { path: '/admin/departments', label: 'Departments', icon: 'departments' },
  { path: '/admin/attendance',  label: 'Attendance',  icon: 'attendance' },
  { path: '/admin/leaves',      label: 'Leaves',      icon: 'leaves' },
  { path: '/admin/payroll',     label: 'Payroll',     icon: 'payroll' },
];
const employeeNav = [
  { path: '/employee/dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { path: '/employee/profile',    label: 'My Profile', icon: 'profile' },
  { path: '/employee/attendance', label: 'Attendance', icon: 'attendance' },
  { path: '/employee/leaves',     label: 'My Leaves',  icon: 'leaves' },
  { path: '/employee/payroll',    label: 'My Payroll', icon: 'payroll' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const C = getColors(isDark);
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNav : employeeNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarBg    = isDark ? '#0e0e14' : '#ffffff';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const activeColor  = isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)';
  const activeBorder = isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.3)';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39, backdropFilter: 'blur(2px)' }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        aria-label="Sidebar navigation"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
          width: '240px',
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          display: 'flex', flexDirection: 'column',
          // Mobile: slide in/out; Desktop: always visible
          transform: 'translateX(0)',
          transition: 'transform 0.25s ease',
        }}
        className="sidebar-panel"
      >
        {/* ── Brand ── */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>H</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: C.text1, fontSize: '0.92rem', lineHeight: 1.2 }}>HRMS</p>
              <p style={{ margin: 0, fontSize: '0.68rem', color: C.text4, lineHeight: 1.2 }}>NeoWesolutize</p>
            </div>
          </div>
        </div>

        {/* ── User info ── */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, color: C.text1, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: C.text4, textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
        </div>

        {/* ── Nav section label ── */}
        <div style={{ padding: '14px 16px 6px' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isAdmin ? 'Admin Panel' : 'Employee Portal'}
          </p>
        </div>

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 12px' }} aria-label="Main navigation">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '9px', margin: '2px 0',
                fontSize: '0.84rem', fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive ? activeColor : 'transparent',
                color: isActive ? '#818cf8' : C.text3,
                border: isActive ? `1px solid ${activeBorder}` : '1px solid transparent',
              })}
              onMouseOver={e => {
                if (!e.currentTarget.classList.contains('active-nav')) {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
                  e.currentTarget.style.color = C.text1;
                }
              }}
              onMouseOut={e => {
                // Let NavLink handle its own active state after mouse out
              }}
            >
              <Icon path={icons[item.icon]} size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom: theme toggle + logout ── */}
        <div style={{ padding: '10px', borderTop: `1px solid ${sidebarBorder}` }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '9px', background: 'transparent', border: 'none', color: C.text3, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500, transition: 'all 0.15s', marginBottom: '4px' }}
            onMouseOver={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = C.text1; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3; }}
          >
            {isDark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flexShrink: 0 }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '9px', background: 'transparent', border: 'none', color: C.text3, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500, transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = isDark ? '#f87171' : '#dc2626'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3; }}
          >
            <Icon path={icons.logout} size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
