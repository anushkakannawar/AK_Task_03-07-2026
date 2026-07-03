import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormInput from '../../components/ui/FormInput';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EmployeeProfile = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isEditing, setEditing] = useState(false);
  const [form, setForm]   = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.employeeId) { setLoading(false); return; }
    employeeService.getById(user.employeeId)
      .then(r => { setProfile(r.data); setForm({ name: r.data.name||'', phone: r.data.phone||'', address: r.data.address||'', emergency_contact: r.data.emergency_contact||'' }); })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!form.name?.trim()) { setErrors({ name: 'Name is required' }); return; }
    setSaving(true);
    try {
      const res = await employeeService.update(user.employeeId, form);
      setProfile(res.data); updateUser({ name: form.name }); setEditing(false);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '64px', background: C.border, borderRadius: '12px', opacity: 0.5 }} />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.text1, margin: '0 0 2px' }}>{profile?.name}</h2>
              <p style={{ color: C.text3, fontSize: '0.85rem', margin: '0 0 6px' }}>{profile?.designation}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: C.text4 }}>{profile?.department_name || 'No department'}</span>
                <StatusBadge status={profile?.status} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: C.text1, margin: 0 }}>Personal Information</h3>
            {!isEditing ? (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setErrors({}); }}>Cancel</Button>
                <Button size="sm" onClick={handleSave} isLoading={saving}>Save</Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <FormInput label="Full Name" name="name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} error={errors.name} required />
              <FormInput label="Phone" name="phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
              <FormInput label="Address" name="address" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} />
              <FormInput label="Emergency Contact" name="emergency_contact" value={form.emergency_contact} onChange={e=>setForm(p=>({...p,emergency_contact:e.target.value}))} helperText="Name and phone of emergency contact" />
            </div>
          ) : (
            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px 24px' }}>
              {[
                { label: 'Email',             value: profile?.email },
                { label: 'Phone',             value: profile?.phone || '—' },
                { label: 'Department',        value: profile?.department_name || '—' },
                { label: 'Designation',       value: profile?.designation },
                { label: 'Date of Joining',   value: profile?.date_of_joining ? format(new Date(profile.date_of_joining), 'MMMM d, yyyy') : '—' },
                { label: 'Address',           value: profile?.address || '—', full: true },
                { label: 'Emergency Contact', value: profile?.emergency_contact || '—', full: true },
              ].map(f => (
                <div key={f.label} style={f.full ? { gridColumn: '1 / -1' } : {}}>
                  <dt style={{ fontSize: '0.68rem', fontWeight: 600, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{f.label}</dt>
                  <dd style={{ fontSize: '0.88rem', color: C.text1, fontWeight: 500, margin: 0 }}>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeProfile;
