import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import { format } from 'date-fns';

const PIE_COLORS = ['#4ade80', '#f87171', '#fbbf24', '#818cf8'];

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartStyle = {
    borderRadius: '8px',
    border: `1px solid ${C.chartBorder}`,
    background: C.chartBg,
    fontSize: '11px',
    color: C.text2,
  };

  useEffect(() => {
    dashboardService.getAdminSummary()
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const attendanceTrendData = data?.attendanceTrend?.map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    Present: d.present, Absent: d.absent, 'Half Day': d.half_day,
  })) || [];

  const leaveData = data?.leaveDistribution?.map(l => ({
    name: l.status.charAt(0).toUpperCase() + l.status.slice(1),
    value: parseInt(l.count),
  })) || [];

  const skeleton = (h) => (
    <div style={{ height: h, background: C.border, borderRadius: '8px', opacity: 0.6 }} />
  );

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', color: C.red, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <StatCard title="Total Employees"  value={data?.counts?.total_employees  ?? '—'} icon="employees"   color="blue"   isLoading={isLoading} />
          <StatCard title="Departments"      value={data?.counts?.total_departments ?? '—'} icon="departments" color="purple" isLoading={isLoading} />
          <StatCard title="Pending Leaves"   value={data?.counts?.pending_leaves    ?? '—'} icon="leaves"      color="yellow" isLoading={isLoading} />
          <StatCard title="Present Today"    value={data?.counts?.present_today     ?? '—'} icon="check"       color="green"  isLoading={isLoading} />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

          {/* Attendance trend */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ color: C.text1, fontWeight: 600, fontSize: '0.88rem', marginBottom: '16px', margin: '0 0 16px' }}>
              Attendance Trend — Last 7 Days
            </h3>
            {isLoading ? skeleton('220px') : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={attendanceTrendData} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                  <XAxis dataKey="date" tick={{ fill: C.tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: C.text3 }} />
                  <Area type="monotone" dataKey="Present"  stroke="#4ade80" fill="url(#gPresent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Absent"   stroke="#f87171" fill="url(#gAbsent)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="Half Day" stroke="#fbbf24" fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Leave distribution */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ color: C.text1, fontWeight: 600, fontSize: '0.88rem', margin: '0 0 16px' }}>Leave Distribution</h3>
            {isLoading ? skeleton('220px') :
              leaveData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={leaveData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {leaveData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={chartStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text4, fontSize: '0.82rem' }}>No leave data</div>
              )
            }
          </div>
        </div>

        {/* Department headcount */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ color: C.text1, fontWeight: 600, fontSize: '0.88rem', margin: '0 0 16px' }}>Department Headcount</h3>
          {isLoading ? skeleton('160px') : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data?.departmentHeadcount || []} margin={{ top: 5, right: 8, left: -28, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                <XAxis dataKey="name" tick={{ fill: C.tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent activity */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ color: C.text1, fontWeight: 600, fontSize: '0.88rem', margin: '0 0 16px' }}>Recent Activity</h3>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: '36px', background: C.border, borderRadius: '6px', opacity: 0.5 }} />)}
            </div>
          ) : data?.recentActivity?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.recentActivity.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < data.recentActivity.length - 1 ? `1px solid ${C.borderSub}` : 'none' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: item.status === 'approved' ? '#4ade80' : item.status === 'rejected' ? '#f87171' : '#fbbf24' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.82rem', color: C.text2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                    <p style={{ fontSize: '0.7rem', color: C.text4, margin: 0 }}>
                      {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: C.text4, fontSize: '0.82rem', textAlign: 'center', padding: '24px 0', margin: 0 }}>No recent activity</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
