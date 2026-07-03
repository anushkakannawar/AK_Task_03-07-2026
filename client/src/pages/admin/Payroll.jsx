import React, { useState, useEffect, useCallback } from 'react';
import { payrollService } from '../../services/payrollService';
import { employeeService } from '../../services/employeeService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table, { Pagination } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const now = new Date();
const EMPTY_FORM = { employee_id:'', month:now.getMonth()+1, year:now.getFullYear(), basic_salary:'', allowances:'0', deductions:'0' };

const AdminPayroll = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [records,setRecords]=useState([]);const [employees,setEmployees]=useState([]);
  const [pagination,setPagination]=useState(null);const [isLoading,setLoading]=useState(true);
  const [filters,setFilters]=useState({month:'',year:'',page:1});
  const [modal,setModal]=useState({type:null,data:null});const [form,setForm]=useState(EMPTY_FORM);
  const [errors,setErrors]=useState({});const [saving,setSaving]=useState(false);

  const fetchRecords=useCallback(async()=>{setLoading(true);try{const params={...filters,limit:20};Object.keys(params).forEach(k=>!params[k]&&delete params[k]);const res=await payrollService.getAll(params);setRecords(res.data);setPagination(res.pagination);}catch{toast.error('Failed to load payroll');}finally{setLoading(false);};},[filters]);
  useEffect(()=>{fetchRecords();},[fetchRecords]);
  useEffect(()=>{employeeService.getAll({limit:100,status:'active'}).then(r=>setEmployees(r.data||[])).catch(()=>{});},[]);

  const empOptions=employees.map(e=>({value:e.id,label:e.name}));
  const monthOptions=MONTHS.map((m,i)=>({value:i+1,label:m}));
  const yearOptions=Array.from({length:5},(_,i)=>({value:now.getFullYear()-i,label:String(now.getFullYear()-i)}));

  const validate=()=>{const e={};if(!form.employee_id)e.employee_id='Select an employee';if(!form.basic_salary||isNaN(form.basic_salary)||parseFloat(form.basic_salary)<0)e.basic_salary='Valid salary required';return e;};

  const handleSave=async()=>{const errs=validate();if(Object.keys(errs).length){setErrors(errs);return;}setSaving(true);
    try{const payload={...form,basic_salary:parseFloat(form.basic_salary),allowances:parseFloat(form.allowances)||0,deductions:parseFloat(form.deductions)||0};
      if(modal.type==='add'){await payrollService.create(payload);toast.success('Payroll record created');}else{await payrollService.update(modal.data.id,payload);toast.success('Payroll updated');}
      setModal({type:null,data:null});fetchRecords();}catch(err){toast.error(err.response?.data?.message||'Failed to save');}finally{setSaving(false);}};

  const handleDelete=async()=>{setSaving(true);try{await payrollService.delete(modal.data.id);toast.success('Payroll record deleted');setModal({type:null,data:null});fetchRecords();}catch(err){toast.error(err.response?.data?.message||'Failed');}finally{setSaving(false);}};

  const fmt=v=>v!=null?`₹${parseFloat(v).toLocaleString('en-IN',{minimumFractionDigits:2})}`:'—';

  const columns=[
    {key:'employee_name',header:'Employee',render:(v,row)=>(<div><p style={{margin:0,fontWeight:600,color:C.text1,fontSize:'0.85rem'}}>{v}</p><p style={{margin:0,fontSize:'0.72rem',color:C.text4}}>{row.designation}</p></div>)},
    {key:'month',       header:'Period',      render:(_,row)=><span style={{color:C.text2}}>{MONTHS[row.month-1]} {row.year}</span>},
    {key:'basic_salary',header:'Basic Salary',render:v=><span style={{color:C.text2}}>{fmt(v)}</span>},
    {key:'allowances',  header:'Allowances',  render:v=><span style={{color:C.green,fontWeight:500}}>{fmt(v)}</span>},
    {key:'deductions',  header:'Deductions',  render:v=><span style={{color:C.red,fontWeight:500}}>{fmt(v)}</span>},
    {key:'net_salary',  header:'Net Salary',  render:v=><span style={{fontWeight:700,color:C.green}}>{fmt(v)}</span>},
    {key:'actions',     header:'Actions',     render:(_,row)=>(
      <div style={{display:'flex',gap:'8px'}}>
        <Button size="sm" variant="secondary" onClick={()=>{setForm({employee_id:row.employee_id,month:row.month,year:row.year,basic_salary:row.basic_salary,allowances:row.allowances,deductions:row.deductions});setErrors({});setModal({type:'edit',data:row});}}>Edit</Button>
        <Button size="sm" variant="danger" onClick={()=>setModal({type:'delete',data:row})}>Delete</Button>
      </div>)},
  ];

  return (
    <DashboardLayout title="Payroll Management">
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            <select value={filters.month} onChange={e=>setFilters(p=>({...p,month:e.target.value,page:1}))} className="dark-input" style={{width:'auto'}}><option value="">All Months</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
            <select value={filters.year}  onChange={e=>setFilters(p=>({...p,year:e.target.value,page:1}))}  className="dark-input" style={{width:'auto'}}><option value="">All Years</option>{yearOptions.map(y=><option key={y.value} value={y.value}>{y.label}</option>)}</select>
          </div>
          <Button onClick={()=>{setForm(EMPTY_FORM);setErrors({});setModal({type:'add',data:null});}}>+ Add Payroll</Button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'14px',overflow:'hidden'}}>
          <Table columns={columns} data={records} isLoading={isLoading} emptyMessage="No payroll records found"/>
          <Pagination pagination={pagination} onPageChange={p=>setFilters(prev=>({...prev,page:p}))}/>
        </div>
      </div>

      <Modal isOpen={modal.type==='add'||modal.type==='edit'} onClose={()=>setModal({type:null,data:null})} title={modal.type==='add'?'New Payroll Record':'Edit Payroll Record'} size="sm">
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {modal.type==='add'&&<FormSelect label="Employee" name="employee_id" value={form.employee_id} onChange={e=>setForm(p=>({...p,employee_id:e.target.value}))} options={empOptions} placeholder="Select employee" error={errors.employee_id} required/>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormSelect label="Month" name="month" value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))} options={monthOptions}/>
            <FormSelect label="Year"  name="year"  value={form.year}  onChange={e=>setForm(p=>({...p,year:e.target.value}))}  options={yearOptions}/>
          </div>
          <FormInput label="Basic Salary (₹)" name="basic_salary" type="number" min="0" step="0.01" value={form.basic_salary} onChange={e=>setForm(p=>({...p,basic_salary:e.target.value}))} error={errors.basic_salary} required/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <FormInput label="Allowances (₹)" name="allowances" type="number" min="0" step="0.01" value={form.allowances} onChange={e=>setForm(p=>({...p,allowances:e.target.value}))}/>
            <FormInput label="Deductions (₹)" name="deductions" type="number" min="0" step="0.01" value={form.deductions} onChange={e=>setForm(p=>({...p,deductions:e.target.value}))}/>
          </div>
          {form.basic_salary&&(
            <div style={{background:isDark?'rgba(74,222,128,0.08)':'rgba(22,163,74,0.06)',border:`1px solid ${isDark?'rgba(74,222,128,0.2)':'rgba(22,163,74,0.2)'}`,borderRadius:'8px',padding:'10px 12px',fontSize:'0.85rem'}}>
              <span style={{color:C.text3}}>Net Salary: </span>
              <span style={{fontWeight:700,color:C.green}}>₹{(parseFloat(form.basic_salary||0)+parseFloat(form.allowances||0)-parseFloat(form.deductions||0)).toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
            </div>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={()=>setModal({type:null,data:null})}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>Save</Button>
        </div>
      </Modal>

      <Modal isOpen={modal.type==='delete'} onClose={()=>setModal({type:null,data:null})} title="Delete Payroll Record" size="sm">
        <p style={{color:C.text2,fontSize:'0.88rem',lineHeight:1.6}}>
          Delete payroll for <strong style={{color:C.text1}}>{modal.data?.employee_name}</strong> for {modal.data?`${MONTHS[modal.data.month-1]} ${modal.data.year}`:''}?
        </p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={()=>setModal({type:null,data:null})}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={saving}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminPayroll;
