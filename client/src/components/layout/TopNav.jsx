import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const Icon = ({ path, size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
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
  menu:       'M4 6h16M4 12h16M4 18h16',
  close:      'M6 18L18 6M6 6l12 12',
};

const adminNav    = [
  { path: '/admin/dashboard',   label: 'Dashboard',   icon: 'dashboard' },
  { path: '/admin/employees',   label: 'Employees',   icon: 'employees' },
  { path: '/admin/departments', label: 'Departments', icon: 'departments' },
  { path: '/admin/attendance',  label: 'Attendance',  icon: 'attendance' },
  { path: '/admin/leaves',      label: 'Leaves',      icon: 'leaves' },
  { path: '/admin/payroll',     label: 'Payroll',     icon: 'payroll' },
];
const employeeNav = [
  { path: '/employee/dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { path: '/employee/profile',    label: 'Profile',    icon: 'profile' },
  { path: '/employee/attendance', label: 'Attendance', icon: 'attendance' },
  { path: '/employee/leaves',     label: 'Leaves',     icon: 'leaves' },
  { path: '/employee/payroll',    label: 'Payroll',    icon: 'payroll' },
];

const TopNav = () => {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggle }        = useTheme();
  const C = getColors(isDark);
  const navigate    = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems    = isAdmin ? adminNav : employeeNav;

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: '58px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        background: isDark ? 'rgba(12,12,15,0.92)' : 'rgba(255,255,255,0.97)',
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(16px)',
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>H</span>
          </div>
          <span style={{ color: C.text1, fontWeight: 600, fontSize: '0.9rem' }}>HRMS</span>
          <span style={{ fontSize: '0.68rem', color: C.text3, background: C.panel, borderRadius: '4px', padding: '1px 6px', border: `1px solid ${C.border}` }}>
            {isAdmin ? 'Admin' : 'Portal'}
          </span>
        </div>

        {/* Centered nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          className="hidden md:flex">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon path={icons[item.icon]} size={14} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>

          {/* User pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.panel, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '4px 12px 4px 4px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text1, lineHeight: 1.2 }}>{user?.name?.split(' ')[0]}</span>
              <span style={{ fontSize: '0.65rem', color: C.text3, lineHeight: 1.2, textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>

          {/* Theme toggle */}
          <button onClick={toggle} title={isDark ? 'Light Mode' : 'Dark Mode'}
            style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseOver={e => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.text1; }}
            onMouseOut={e =>  { e.currentTarget.style.background = C.panel;  e.currentTarget.style.color = C.text3; }}
          >
            {isDark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Sign out */}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', background: 'transparent', border: `1px solid ${C.border}`, color: C.text3, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseOut={e =>  { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3; e.currentTarget.style.borderColor = C.border; }}
          >
            <Icon path={icons.logout} size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          {/* Mobile menu */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', padding: '4px' }}>
            <Icon path={mobileOpen ? icons.close : icons.menu} size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: '58px', left: 0, right: 0, zIndex: 49, background: isDark ? 'rgba(12,12,15,0.97)' : 'rgba(255,255,255,0.97)', borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(20px)', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} style={{ width: '100%' }}>
              <Icon path={icons[item.icon]} size={15} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

export default TopNav;
