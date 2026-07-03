import React, { useState, useEffect, useCallback } from 'react';
import { leaveService } from '../../services/leaveService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table, { Pagination } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import { StatusBadge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' }, { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' }, { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' }, { value: 'unpaid', label: 'Unpaid Leave' },
];
const today = new Date().toISOString().split('T')[0];
const EMPTY_FORM = { leave_type: '', start_date: today, end_date: today, reason: '' };

const EmployeeLeaves = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [leaves, setLeaves]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setLoading]     = useState(true);
  const [modal, setModal]           = useState({ type: null });
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [page, setPage]             = useState(1);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try { const res = await leaveService.getAll({ page, limit: 10 }); setLeaves(res.data); setPagination(res.pagination); }
    catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const validate = () => {
    const errs = {};
    if (!form.leave_type) errs.leave_type = 'Select a leave type';
    if (!form.start_date) errs.start_date = 'Start date required';
    if (!form.end_date)   errs.end_date   = 'End date required';
    if (form.end_date < form.start_date) errs.end_date = 'End date must be after start date';
    if (!form.reason?.trim()) errs.reason = 'Reason is required';
    return errs;
  };

  const handleApply = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try { await leaveService.apply(form); toast.success('Leave request submitted'); setModal({ type: null }); fetchLeaves(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try { await leaveService.cancel(id); toast.success('Leave request cancelled'); fetchLeaves(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const columns = [
    { key: 'leave_type', header: 'Type',   render: v => <span style={{ textTransform: 'capitalize', fontWeight: 500, color: C.text1 }}>{v}</span> },
    { key: 'start_date', header: 'Period', render: (_, row) => (
      <div>
        <p style={{ margin: 0, color: C.text1, fontSize: '0.85rem' }}>{format(new Date(row.start_date), 'MMM d')} — {format(new Date(row.end_date), 'MMM d, yyyy')}</p>
        <p style={{ margin: 0, color: C.text4, fontSize: '0.72rem' }}>{row.days_count} day{row.days_count !== 1 ? 's' : ''}</p>
      </div>
    )},
    { key: 'reason',      header: 'Reason',      render: v => <span style={{ color: C.text3, fontSize: '0.83rem' }}>{v}</span> },
    { key: 'status',      header: 'Status',      render: v => <StatusBadge status={v} /> },
    { key: 'review_note', header: 'Review Note', render: v => v ? <span style={{ fontSize: '0.75rem', color: C.text4, fontStyle: 'italic' }}>{v}</span> : '—' },
    { key: 'actions',     header: '',            render: (_, row) => row.status === 'pending' ? (
      <Button size="sm" variant="danger" onClick={() => handleCancel(row.id)}>Cancel</Button>
    ) : null },
  ];

  return (
    <DashboardLayout title="My Leaves">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.82rem', color: C.text4, margin: 0 }}>Submit and track your leave requests</p>
          <Button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModal({ type: 'apply' }); }}>+ Apply for Leave</Button>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <Table columns={columns} data={leaves} isLoading={isLoading} emptyMessage="You haven't applied for any leaves yet" />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal.type === 'apply'} onClose={() => setModal({ type: null })} title="Apply for Leave" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormSelect label="Leave Type" name="leave_type" value={form.leave_type} onChange={e=>setForm(p=>({...p,leave_type:e.target.value}))} options={LEAVE_TYPES} placeholder="Select leave type" error={errors.leave_type} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <FormInput label="Start Date" name="start_date" type="date" value={form.start_date} onChange={e=>setForm(p=>({...p,start_date:e.target.value}))} error={errors.start_date} required />
            <FormInput label="End Date"   name="end_date"   type="date" value={form.end_date}   onChange={e=>setForm(p=>({...p,end_date:e.target.value}))}   min={form.start_date} error={errors.end_date} required />
          </div>
          {form.start_date && form.end_date && form.end_date >= form.start_date && (
            <p style={{ fontSize: '0.75rem', color: C.indigo, background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)', border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.2)'}`, borderRadius: '6px', padding: '6px 10px', margin: 0 }}>
              Duration: {Math.floor((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1} day(s)
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 500, color: C.text3, display: 'block' }}>Reason <span style={{ color: '#f87171' }}>*</span></label>
            <textarea value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} rows={3} className="dark-input" style={{ resize: 'vertical', height: 'auto' }} placeholder="Briefly explain the reason..." />
            {errors.reason && <p style={{ fontSize: '0.72rem', color: '#f87171', margin: 0 }}>{errors.reason}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button variant="secondary" onClick={() => setModal({ type: null })}>Cancel</Button>
          <Button onClick={handleApply} isLoading={saving}>Submit Request</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default EmployeeLeaves;
