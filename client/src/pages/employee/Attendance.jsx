import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../../services/attendanceService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table, { Pagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import { format } from 'date-fns';

const EmployeeAttendance = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [records, setRecords]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setLoading]     = useState(true);
  const [filters, setFilters]       = useState({ start_date: '', end_date: '', page: 1 });
  const now = new Date();
  const month = now.getMonth() + 1, year = now.getFullYear();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 20 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const [attRes, sumRes] = await Promise.all([
        attendanceService.getAll(params),
        attendanceService.getSummary({ month, year }),
      ]);
      setRecords(attRes.data);
      setPagination(attRes.pagination);
      setSummary(sumRes.data);
    } catch { /* handle gracefully */ }
    finally { setLoading(false); }
  }, [filters, month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'date',      header: 'Date',      render: v => <span style={{ color: C.text2 }}>{format(new Date(v), 'MMM d, yyyy (EEE)')}</span> },
    { key: 'check_in',  header: 'Check In',  render: v => <span style={{ color: C.text3 }}>{v ? v.substring(0,5) : '—'}</span> },
    { key: 'check_out', header: 'Check Out', render: v => <span style={{ color: C.text3 }}>{v ? v.substring(0,5) : '—'}</span> },
    { key: 'status',    header: 'Status',    render: v => <StatusBadge status={v} /> },
    { key: 'notes',     header: 'Notes',     render: v => <span style={{ color: C.text3, fontSize: '0.82rem' }}>{v || '—'}</span> },
  ];

  const stats = [
    { label: 'Present',  value: summary?.present      || 0, color: C.green,  bg: isDark ? 'rgba(34,197,94,0.1)'   : 'rgba(22,163,74,0.07)',  border: isDark ? 'rgba(34,197,94,0.2)'  : 'rgba(22,163,74,0.2)'  },
    { label: 'Absent',   value: summary?.absent        || 0, color: C.red,    bg: isDark ? 'rgba(239,68,68,0.1)'   : 'rgba(220,38,38,0.07)',  border: isDark ? 'rgba(239,68,68,0.2)'  : 'rgba(220,38,38,0.2)'  },
    { label: 'Half Day', value: summary?.['half-day']  || 0, color: C.amber,  bg: isDark ? 'rgba(245,158,11,0.1)'  : 'rgba(180,83,9,0.07)',   border: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(180,83,9,0.2)'   },
    { label: 'On Leave', value: summary?.leave         || 0, color: C.purple, bg: isDark ? 'rgba(168,85,247,0.1)'  : 'rgba(124,58,237,0.07)', border: isDark ? 'rgba(168,85,247,0.2)' : 'rgba(124,58,237,0.2)'  },
  ];

  return (
    <DashboardLayout title="My Attendance">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '14px 20px', minWidth: '90px' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{isLoading ? '—' : s.value}</p>
              <p style={{ fontSize: '0.72rem', fontWeight: 500, color: s.color, opacity: 0.85, margin: '4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input type="date" value={filters.start_date} onChange={e => setFilters(p => ({ ...p, start_date: e.target.value, page: 1 }))} className="dark-input" style={{ width: 'auto' }} />
          <input type="date" value={filters.end_date}   onChange={e => setFilters(p => ({ ...p, end_date:   e.target.value, page: 1 }))} className="dark-input" style={{ width: 'auto' }} />
          {(filters.start_date || filters.end_date) && (
            <button onClick={() => setFilters({ start_date: '', end_date: '', page: 1 })}
              style={{ padding: '7px 14px', fontSize: '0.82rem', color: C.text3, background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <Table columns={columns} data={records} isLoading={isLoading} emptyMessage="No attendance records found" />
          <Pagination pagination={pagination} onPageChange={p => setFilters(prev => ({ ...prev, page: p }))} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAttendance;
