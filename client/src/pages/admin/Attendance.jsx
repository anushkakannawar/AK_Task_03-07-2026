import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
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

const EMPTY_FORM = { employee_id:'',date:new Date().toISOString().split('T')[0],check_in:'',check_out:'',status:'present',notes:'' };

const AdminAttendance = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [records,setRecords]=useState([]);const [employees,setEmployees]=useState([]);
  const [pagination,setPagination]=useState(null);const [isLoading,setLoading]=useState(true);
  const [filters,setFilters]=useState({employee_id:'',start_date:'',end_date:'',status:'',page:1});
  const [modal,setModal]=useState({type:null,data:null});const [form,setForm]=useState(EMPTY_FORM);
  const [errors,setErrors]=useState({});const [saving,setSaving]=useState(false);

  const fetchRecords=useCallback(async()=>{setLoading(true);try{const params={...filters,limit:20};Object.keys(params).forEach(k=>!params[k]&&delete params[k]);const res=await attendanceService.getAll(params);setRecords(res.data);setPagination(res.pagination);}catch{toast.error('Failed to load attendance');}finally{setLoading(false);};},[filters]);
  useEffect(()=>{fetchRecords();},[fetchRecords]);
  useEffect(()=>{employeeService.getAll({limit:100}).then(r=>setEmployees(r.data||[])).catch(()=>{});},[]);

  const empOptions=employees.map(e=>({value:e.id,label:e.name}));
  const statusOpts=[{value:'present',label:'Present'},{value:'absent',label:'Absent'},{value:'half-day',label:'Half Day'},{value:'leave',label:'Leave'}];

  const handleSave=async()=>{if(!form.employee_id){setErrors({employee_id:'Select an employee'});return;}if(!form.date){setErrors({date:'Date is required'});return;}setSaving(true);
    try{const payload={...form};if(!payload.check_in)delete payload.check_in;if(!payload.check_out)delete payload.check_out;
      if(modal.type==='add'){await attendanceService.mark(payload);toast.success('Attendance marked');}else{await attendanceService.update(modal.data.id,payload);toast.success('Attendance updated');}
      setModal({type:null,data:null});fetchRecords();}catch(err){toast.error(err.response?.data?.message||'Failed to save');}finally{setSaving(false);}};

  const columns=[
    {key:'employee_name',header:'Employee',render:(v,row)=>(<div><p style={{margin:0,fontWeight:600,color:C.text1,fontSize:'0.85rem'}}>{v}</p><p style={{margin:0,fontSize:'0.72rem',color:C.text4}}>{row.department_name||'—'}</p></div>)},
    {key:'date',     header:'Date',      render:v=><span style={{color:C.text2}}>{format(new Date(v),'MMM d, yyyy')}</span>},
    {key:'check_in', header:'Check In',  render:v=><span style={{color:C.text3}}>{v||'—'}</span>},
    {key:'check_out',header:'Check Out', render:v=><span style={{color:C.text3}}>{v||'—'}</span>},
    {key:'status',   header:'Status',    render:v=><StatusBadge status={v}/>},
    {key:'actions',  header:'Actions',   render:(_,row)=>(<Button size="sm" variant="secondary" onClick={()=>{setForm({employee_id:row.employee_id,date:row.date?.split('T')[0],check_in:row.check_in||'',check_out:row.check_out||'',status:row.status,notes:row.notes||''});setErrors({});setModal({type:'edit',data:row});}}>Edit</Button>)},
  ];

  return (
    <DashboardLayout title="Attendance">
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            <select value={filters.employee_id} onChange={e=>setFilters(p=>({...p,employee_id:e.target.value,page:1}))} className="dark-input" style={{width:'auto'}}><option value="">All Employees</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select>
            <input type="date" value={filters.start_date} onChange={e=>setFilters(p=>({...p,start_date:e.target.value,page:1}))} className="dark-input" style={{width:'auto'}}/>
            <input type="date" value={filters.end_date}   onChange={e=>setFilters(p=>({...p,end_date:e.target.value,page:1}))}   className="dark-input" style={{width:'auto'}}/>
            <select value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value,page:1}))} className="dark-input" style={{width:'auto'}}><option value="">All Status</option>{statusOpts.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </div>
          <Button onClick={()=>{setForm(EMPTY_FORM);setErrors({});setModal({type:'add',data:null});}}>+ Mark Attendance</Button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'14px',overflow:'hidden'}}>
          <Table columns={columns} data={records} isLoading={isLoading} emptyMessage="No attendance records"/>
          <Pagination pagination={pagination} onPageChange={p=>setFilters(prev=>({...prev,page:p}))}/>
        </div>
      </div>
      <Modal isOpen={modal.type==='add'||modal.type==='edit'} onClose={()=>setModal({type:null,data:null})} title={modal.type==='add'?'Mark Attendance':'Edit Attendance'} size="sm">
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {modal.type==='add'&&<FormSelect label="Employee" name="employee_id" value={form.employee_id} onChange={e=>setForm(p=>({...p,employee_id:e.target.value}))} options={empOptions} placeholder="Select employee" error={errors.employee_id} required/>}
          <FormInput label="Date" name="date" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} error={errors.date} required/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormInput label="Check In"  name="check_in"  type="time" value={form.check_in}  onChange={e=>setForm(p=>({...p,check_in:e.target.value}))}/>
            <FormInput label="Check Out" name="check_out" type="time" value={form.check_out} onChange={e=>setForm(p=>({...p,check_out:e.target.value}))}/>
          </div>
          <FormSelect label="Status" name="status" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} options={statusOpts} error={errors.status} required/>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={()=>setModal({type:null,data:null})}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>Save</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminAttendance;
