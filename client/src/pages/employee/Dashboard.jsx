import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import { format } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EmployeeDashboard = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [data, setData] = useState(null);
  const [isLoading, setLoad] = useState(true);

  useEffect(() => {
    dashboardService.getEmployeeSummary().then(r => setData(r.data)).catch(()=>{}).finally(()=>setLoad(false));
  }, []);

  const att = data?.attendance || {};
  const now = new Date();
  const fmt = v => v != null ? `₹${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <p style={{ fontSize: '0.75rem', color: C.text3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          {MONTHS[now.getMonth()]} {now.getFullYear()} — Attendance Summary
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <StatCard title="Present Days"   value={att.present        ?? '—'} icon="check"    color="green"  isLoading={isLoading} />
          <StatCard title="Absent Days"    value={att.absent         ?? '—'} icon="calendar" color="red"    isLoading={isLoading} />
          <StatCard title="Half Days"      value={att['half-day']    ?? '—'} icon="calendar" color="yellow" isLoading={isLoading} />
          <StatCard title="Pending Leaves" value={data?.pendingLeaves ?? '—'} icon="leaves"  color="purple" isLoading={isLoading} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '16px' }}>

          {/* Latest payslip */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ color: C.text1, fontWeight: 600, fontSize: '0.88rem', margin: '0 0 14px' }}>Latest Payslip</h3>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1,2,3].map(i => <div key={i} style={{ height: '18px', background: C.border, borderRadius: '4px', opacity: 0.5 }} />)}
              </div>
            ) : data?.latestPayroll ? (
              <>
                <p style={{ fontSize: '0.72rem', color: C.text3, margin: '0 0 10px' }}>
                  {MONTHS[data.latestPayroll.month - 1]} {data.latestPayroll.year}
                </p>
                {[
                  { label: 'Basic Salary', value: fmt(data.latestPayroll.basic_salary) },
                  { label: 'Allowances',   value: `+${fmt(data.latestPayroll.allowances)}`, color: C.green },
                  { label: 'Deductions',   value: `-${fmt(data.latestPayroll.deductions)}`, color: C.red },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.borderSub}`, fontSize: '0.83rem' }}>
                    <span style={{ color: C.text3 }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: r.color || C.text2 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600, color: C.text2 }}>Net Salary</span>
                  <span style={{ fontWeight: 700, color: C.green, fontSize: '1.1rem' }}>{fmt(data.latestPayroll.net_salary)}</span>
                </div>
              </>
            ) : (
              <p style={{ color: C.text4, fontSize: '0.82rem', textAlign: 'center', padding: '24px 0', margin: 0 }}>No payslip available</p>
            )}
          </div>

          {/* Upcoming leaves */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ color: C.text1, fontWeight: 600, fontSize: '0.88rem', margin: '0 0 14px' }}>Upcoming Leaves</h3>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1,2].map(i => <div key={i} style={{ height: '44px', background: C.border, borderRadius: '8px', opacity: 0.5 }} />)}
              </div>
            ) : data?.upcomingLeaves?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.upcomingLeaves.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(22,163,74,0.06)', border: `1px solid ${isDark ? 'rgba(34,197,94,0.15)' : 'rgba(22,163,74,0.2)'}`, borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: C.green, textTransform: 'capitalize', margin: 0 }}>{l.leave_type} Leave</p>
                      <p style={{ fontSize: '0.72rem', color: isDark ? 'rgba(74,222,128,0.6)' : '#16a34a', margin: 0 }}>
                        {format(new Date(l.start_date), 'MMM d')} — {format(new Date(l.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.green, background: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(22,163,74,0.1)', padding: '3px 8px', borderRadius: '9999px' }}>
                      {l.days}d
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: C.text4, fontSize: '0.82rem', textAlign: 'center', padding: '24px 0', margin: 0 }}>No upcoming approved leaves</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
