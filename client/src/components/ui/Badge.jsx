import React from 'react';

const variantClass = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  gray:    'badge-gray',
  purple:  'badge-purple',
};

const Badge = ({ children, variant = 'gray', className = '' }) => (
  <span
    className={`${variantClass[variant] || variantClass.gray} ${className}`}
    style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em',
      textTransform: 'capitalize',
    }}
  >
    {children}
  </span>
);

export const StatusBadge = ({ status }) => {
  const map = {
    active:     { label: 'Active',    variant: 'success' },
    inactive:   { label: 'Inactive',  variant: 'danger' },
    on_leave:   { label: 'On Leave',  variant: 'warning' },
    pending:    { label: 'Pending',   variant: 'warning' },
    approved:   { label: 'Approved',  variant: 'success' },
    rejected:   { label: 'Rejected',  variant: 'danger' },
    present:    { label: 'Present',   variant: 'success' },
    absent:     { label: 'Absent',    variant: 'danger' },
    'half-day': { label: 'Half Day',  variant: 'warning' },
    leave:      { label: 'On Leave',  variant: 'purple' },
    admin:      { label: 'Admin',     variant: 'info' },
    employee:   { label: 'Employee',  variant: 'gray' },
  };
  const cfg = map[status] || { label: status, variant: 'gray' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

export default Badge;
