import React, { useState, useEffect, useCallback } from 'react';
import { leaveService } from '../../services/leaveService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table, { Pagination } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminLeaves = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [leaves, setLeaves]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setLoading]     = useState(true);
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState({ type: null, data: null });
  const [reviewNote, setNote]       = useState('');
  const [saving, setSaving]         = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await leaveService.getAll(params);
      setLeaves(res.data); setPagination(res.pagination);
    } catch { toast.error('Failed to load leave requests'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);
  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleReview = async (status) => {
    setSaving(true);
    try { await leaveService.updateStatus(modal.data.id, status, reviewNote); toast.success(`Leave request ${status}`); setModal({ type: null, data: null }); fetchLeaves(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'employee_name', header: 'Employee', render: (v, row) => (
      <div><p style={{ margin: 0, fontWeight: 600, color: C.text1, fontSize: '0.85rem' }}>{v}</p><p style={{ margin: 0, fontSize: '0.72rem', color: C.text4 }}>{row.department_name||'—'}</p></div>
    )},
    { key: 'leave_type', header: 'Type',   render: v => <span style={{ textTransform: 'capitalize', fontWeight: 500, color: C.text1 }}>{v}</span> },
    { key: 'start_date', header: 'Period', render: (_, row) => (
      <div><p style={{ margin: 0, color: C.text2, fontSize: '0.85rem' }}>{format(new Date(row.start_date), 'MMM d')} — {format(new Date(row.end_date), 'MMM d, yyyy')}</p><p style={{ margin: 0, color: C.text4, fontSize: '0.72rem' }}>{row.days_count} day{row.days_count !== 1 ? 's' : ''}</p></div>
    )},
    { key: 'reason',  header: 'Reason',  render: v => <span style={{ color: C.text3, fontSize: '0.83rem' }}>{v}</span> },
    { key: 'status',  header: 'Status',  render: v => <StatusBadge status={v} /> },
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <Button size="sm" variant="secondary" onClick={() => { setNote(''); setModal({ type: 'review', data: row }); }}>Review</Button>
    )},
  ];

  return (
    <DashboardLayout title="Leave Requests">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: statusFilter === s ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : C.panel,
                color:      statusFilter === s ? C.indigo : C.text3,
                border:     statusFilter === s ? `1px solid ${isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.3)'}` : `1px solid ${C.border}`,
              }}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <Table columns={columns} data={leaves} isLoading={isLoading} emptyMessage="No leave requests found" />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal.type === 'review'} onClose={() => setModal({ type: null, data: null })} title="Review Leave Request" size="sm">
        {modal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
              {[{ label: 'Employee', value: modal.data.employee_name }, { label: 'Type', value: modal.data.leave_type }, { label: 'Duration', value: `${format(new Date(modal.data.start_date), 'MMM d')} — ${format(new Date(modal.data.end_date), 'MMM d, yyyy')} (${modal.data.days_count} days)` }].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.borderSub}`, fontSize: '0.83rem' }}>
                  <span style={{ color: C.text3 }}>{r.label}</span>
                  <span style={{ color: C.text1, fontWeight: 500, textTransform: 'capitalize' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.83rem' }}>
                <span style={{ color: C.text3 }}>Status</span>
                <StatusBadge status={modal.data.status} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Reason</p>
              <p style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 12px', color: C.text2, fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{modal.data.reason}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 500, color: C.text3, display: 'block' }}>Review Note (optional)</label>
              <textarea value={reviewNote} onChange={e => setNote(e.target.value)} rows={2} className="dark-input" style={{ resize: 'vertical', height: 'auto' }} placeholder="Add a note for the employee..." />
            </div>
            {modal.data.status === 'pending' ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="success" style={{ flex: 1 }} onClick={() => handleReview('approved')} isLoading={saving}>Approve</Button>
                <Button variant="danger"  style={{ flex: 1 }} onClick={() => handleReview('rejected')} isLoading={saving}>Reject</Button>
              </div>
            ) : (
              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: C.text4 }}>This request has already been {modal.data.status}.</p>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminLeaves;
