import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payrollService } from '../../services/payrollService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table, { Pagination } from '../../components/ui/Table';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EmployeePayroll = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [records, setRecords]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setLoading]     = useState(true);
  const [page, setPage]             = useState(1);

  const fetchPayroll = useCallback(async () => {
    if (!user?.employeeId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await payrollService.getByEmployee(user.employeeId, { page, limit: 12 });
      setRecords(res.data);
      setPagination(res.pagination);
    } catch { /* handle gracefully */ }
    finally { setLoading(false); }
  }, [user, page]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  const fmt = v => v != null ? `₹${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';
  const latest = records[0];

  const columns = [
    { key: 'month',        header: 'Period',       render: (_, row) => <span style={{ fontWeight: 600, color: C.text1 }}>{MONTHS[row.month - 1]} {row.year}</span> },
    { key: 'basic_salary', header: 'Basic Salary', render: v => <span style={{ color: C.text2 }}>{fmt(v)}</span> },
    { key: 'allowances',   header: 'Allowances',   render: v => <span style={{ color: C.green, fontWeight: 500 }}>+{fmt(v)}</span> },
    { key: 'deductions',   header: 'Deductions',   render: v => <span style={{ color: C.red,   fontWeight: 500 }}>-{fmt(v)}</span> },
    { key: 'net_salary',   header: 'Net Salary',   render: v => <span style={{ fontWeight: 700, color: C.green, fontSize: '0.95rem' }}>{fmt(v)}</span> },
  ];

  return (
    <DashboardLayout title="My Payroll">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {latest && !isLoading && (
          <div style={{ background: isDark ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))' : 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07))', border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`, borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '0.75rem', color: C.indigo, margin: '0 0 6px', fontWeight: 500 }}>
              Latest Payslip — {MONTHS[latest.month - 1]} {latest.year}
            </p>
            <p style={{ fontSize: '2.2rem', fontWeight: 700, color: C.text1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              {fmt(latest.net_salary)}
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Basic',      value: fmt(latest.basic_salary), color: C.text2 },
                { label: 'Allowances', value: `+${fmt(latest.allowances)}`, color: C.green },
                { label: 'Deductions', value: `-${fmt(latest.deductions)}`, color: C.red },
              ].map(r => (
                <div key={r.label}>
                  <p style={{ fontSize: '0.7rem', color: C.indigo, margin: '0 0 2px', fontWeight: 500, opacity: 0.75 }}>{r.label}</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: r.color, margin: 0 }}>{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontWeight: 600, color: C.text1, margin: 0, fontSize: '0.9rem' }}>Payslip History</h3>
          </div>
          <Table columns={columns} data={records} isLoading={isLoading} emptyMessage="No payroll records available" />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeePayroll;
