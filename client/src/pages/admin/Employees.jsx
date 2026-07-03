import React, { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
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

const EMPTY_FORM = { name:'',email:'',password:'',designation:'',department_id:'',phone:'',address:'',emergency_contact:'',date_of_joining:new Date().toISOString().split('T')[0],status:'active' };

const AdminEmployees = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [employees,setEmployees]=useState([]);const [departments,setDepts]=useState([]);
  const [pagination,setPagination]=useState(null);const [isLoading,setLoading]=useState(true);
  const [search,setSearch]=useState('');const [deptFilter,setDeptFilter]=useState('');
  const [statusFilter,setStatus]=useState('');const [page,setPage]=useState(1);
  const [modal,setModal]=useState({type:null,data:null});const [form,setForm]=useState(EMPTY_FORM);
  const [errors,setErrors]=useState({});const [saving,setSaving]=useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params={page,limit:15};
      if(search) params.search=search; if(deptFilter) params.department_id=deptFilter; if(statusFilter) params.status=statusFilter;
      const res=await employeeService.getAll(params); setEmployees(res.data); setPagination(res.pagination);
    } catch { toast.error('Failed to load employees'); } finally { setLoading(false); }
  },[page,search,deptFilter,statusFilter]);

  useEffect(()=>{fetchEmployees();},[fetchEmployees]);
  useEffect(()=>{departmentService.getAll().then(r=>setDepts(r.data||[])).catch(()=>{});},[]);

  const openAdd=()=>{setForm(EMPTY_FORM);setErrors({});setModal({type:'add',data:null});};
  const openEdit=(emp)=>{setForm({name:emp.name,email:emp.email,password:'',designation:emp.designation,department_id:emp.department_id||'',phone:emp.phone||'',address:emp.address||'',emergency_contact:emp.emergency_contact||'',date_of_joining:emp.date_of_joining?.split('T')[0]||'',status:emp.status});setErrors({});setModal({type:'edit',data:emp});};
  const closeModal=()=>setModal({type:null,data:null});

  const validate=(isEdit)=>{const e={};
    if(!form.name.trim())e.name='Name is required';
    if(!form.email.trim())e.email='Email is required'; else if(!/\S+@\S+/.test(form.email))e.email='Invalid email';
    if(!isEdit&&!form.password)e.password='Password is required';
    if(!form.designation.trim())e.designation='Designation is required';
    if(!form.date_of_joining)e.date_of_joining='Date required';
    return e;};

  const handleSave=async()=>{const isEdit=modal.type==='edit';const errs=validate(isEdit);if(Object.keys(errs).length){setErrors(errs);return;}setSaving(true);
    try{const payload={...form};if(isEdit&&!payload.password)delete payload.password;if(!payload.department_id)payload.department_id=null;
      if(isEdit){await employeeService.update(modal.data.id,payload);toast.success('Employee updated');}else{await employeeService.create(payload);toast.success('Employee created');}
      closeModal();fetchEmployees();}catch(err){toast.error(err.response?.data?.message||'Failed to save');}finally{setSaving(false);}};

  const handleDelete=async()=>{setSaving(true);try{await employeeService.delete(modal.data.id);toast.success('Employee deactivated');closeModal();fetchEmployees();}catch(err){toast.error(err.response?.data?.message||'Failed');}finally{setSaving(false);}};

  const deptOptions=departments.map(d=>({value:d.id,label:d.name}));
  const statusOptions=[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'on_leave',label:'On Leave'}];

  const columns=[
    {key:'name',header:'Employee',render:(_,row)=>(
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,color:'#fff',flexShrink:0}}>{row.name?.charAt(0)?.toUpperCase()}</div>
        <div><p style={{margin:0,fontWeight:600,color:C.text1,fontSize:'0.85rem'}}>{row.name}</p><p style={{margin:0,fontSize:'0.72rem',color:C.text4}}>{row.email}</p></div>
      </div>)},
    {key:'designation',header:'Designation',render:v=><span style={{color:C.text2}}>{v}</span>},
    {key:'department_name',header:'Department',render:v=><span style={{color:C.text3}}>{v||'—'}</span>},
    {key:'date_of_joining',header:'Joined',render:v=><span style={{color:C.text3}}>{v?format(new Date(v),'MMM d, yyyy'):'—'}</span>},
    {key:'status',header:'Status',render:v=><StatusBadge status={v}/>},
    {key:'actions',header:'Actions',render:(_,row)=>(
      <div style={{display:'flex',gap:'8px'}}><Button size="sm" variant="secondary" onClick={()=>openEdit(row)}>Edit</Button><Button size="sm" variant="danger" onClick={()=>setModal({type:'delete',data:row})}>Remove</Button></div>)},
  ];

  return (
    <DashboardLayout title="Employees">
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'10px',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',flex:1}}>
            <input type="search" placeholder="Search name, email, designation..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="dark-input" style={{flex:1,minWidth:'200px'}}/>
            <select value={deptFilter} onChange={e=>{setDeptFilter(e.target.value);setPage(1);}} className="dark-input" style={{width:'auto'}}><option value="">All Departments</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
            <select value={statusFilter} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="dark-input" style={{width:'auto'}}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
          <Button onClick={openAdd}>+ Add Employee</Button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'14px',overflow:'hidden'}}>
          <Table columns={columns} data={employees} isLoading={isLoading} emptyMessage="No employees found"/>
          <Pagination pagination={pagination} onPageChange={setPage}/>
        </div>
      </div>

      <Modal isOpen={modal.type==='add'||modal.type==='edit'} onClose={closeModal} title={modal.type==='add'?'Add New Employee':'Edit Employee'} size="lg">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          <FormInput label="Full Name" name="name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} error={errors.name} required/>
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} error={errors.email} required/>
          <FormInput label={modal.type==='edit'?'New Password (optional)':'Password'} name="password" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} error={errors.password} required={modal.type==='add'} placeholder={modal.type==='edit'?'Leave blank to keep current':''}/>
          <FormInput label="Designation" name="designation" value={form.designation} onChange={e=>setForm(p=>({...p,designation:e.target.value}))} error={errors.designation} required/>
          <FormSelect label="Department" name="department_id" value={form.department_id} onChange={e=>setForm(p=>({...p,department_id:e.target.value}))} options={deptOptions} placeholder="Select department"/>
          <FormInput label="Phone" name="phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
          <FormInput label="Date of Joining" name="date_of_joining" type="date" value={form.date_of_joining} onChange={e=>setForm(p=>({...p,date_of_joining:e.target.value}))} error={errors.date_of_joining} required/>
          {modal.type==='edit'&&<FormSelect label="Status" name="status" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} options={statusOptions}/>}
          <div style={{gridColumn:'1/-1'}}><FormInput label="Address" name="address" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/></div>
          <div style={{gridColumn:'1/-1'}}><FormInput label="Emergency Contact" name="emergency_contact" value={form.emergency_contact} onChange={e=>setForm(p=>({...p,emergency_contact:e.target.value}))}/></div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{modal.type==='add'?'Create Employee':'Save Changes'}</Button>
        </div>
      </Modal>

      <Modal isOpen={modal.type==='delete'} onClose={closeModal} title="Deactivate Employee" size="sm">
        <p style={{color:C.text2,fontSize:'0.88rem',lineHeight:1.6}}>
          Are you sure you want to deactivate <strong style={{color:C.text1}}>{modal.data?.name}</strong>? Their account will be disabled but data will be preserved.
        </p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={saving}>Deactivate</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminEmployees;
