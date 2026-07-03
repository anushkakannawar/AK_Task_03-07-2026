import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminDepartments = () => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [departments,setDepts]=useState([]);const [isLoading,setLoading]=useState(true);
  const [modal,setModal]=useState({type:null,data:null});const [form,setForm]=useState({name:'',description:''});
  const [errors,setErrors]=useState({});const [saving,setSaving]=useState(false);

  const fetchDepts=async()=>{setLoading(true);try{const res=await departmentService.getAll();setDepts(res.data||[]);}catch{toast.error('Failed to load departments');}finally{setLoading(false);}};
  useEffect(()=>{fetchDepts();},[]);

  const openAdd=()=>{setForm({name:'',description:''});setErrors({});setModal({type:'add',data:null});};
  const openEdit=(d)=>{setForm({name:d.name,description:d.description||''});setErrors({});setModal({type:'edit',data:d});};
  const closeModal=()=>setModal({type:null,data:null});

  const handleSave=async()=>{if(!form.name.trim()){setErrors({name:'Department name is required'});return;}setSaving(true);
    try{if(modal.type==='add'){await departmentService.create(form);toast.success('Department created');}else{await departmentService.update(modal.data.id,form);toast.success('Department updated');}closeModal();fetchDepts();}
    catch(err){toast.error(err.response?.data?.message||'Failed to save');}finally{setSaving(false);}};

  const handleDelete=async()=>{setSaving(true);try{await departmentService.delete(modal.data.id);toast.success('Department deleted');closeModal();fetchDepts();}catch(err){toast.error(err.response?.data?.message||'Failed to delete');}finally{setSaving(false);}};

  const columns=[
    {key:'name',header:'Name',render:v=><span style={{fontWeight:600,color:C.text1}}>{v}</span>},
    {key:'description',header:'Description',render:v=><span style={{color:C.text3}}>{v||'—'}</span>},
    {key:'employee_count',header:'Employees',render:v=>(
      <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'30px',height:'30px',borderRadius:'50%',background:isDark?'rgba(99,102,241,0.15)':'rgba(99,102,241,0.1)',color:C.indigo,fontSize:'0.82rem',fontWeight:700}}>{v}</span>)},
    {key:'created_at',header:'Created',render:v=><span style={{color:C.text3}}>{format(new Date(v),'MMM d, yyyy')}</span>},
    {key:'actions',header:'Actions',render:(_,row)=>(
      <div style={{display:'flex',gap:'8px'}}><Button size="sm" variant="secondary" onClick={()=>openEdit(row)}>Edit</Button><Button size="sm" variant="danger" onClick={()=>setModal({type:'delete',data:row})}>Delete</Button></div>)},
  ];

  return (
    <DashboardLayout title="Departments">
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <p style={{fontSize:'0.82rem',color:C.text4,margin:0}}>{departments.length} department{departments.length!==1?'s':''}</p>
          <Button onClick={openAdd}>+ Add Department</Button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'14px',overflow:'hidden'}}>
          <Table columns={columns} data={departments} isLoading={isLoading} emptyMessage="No departments yet"/>
        </div>
      </div>

      <Modal isOpen={modal.type==='add'||modal.type==='edit'} onClose={closeModal} title={modal.type==='add'?'New Department':'Edit Department'} size="sm">
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <FormInput label="Department Name" name="name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} error={errors.name} required/>
          <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
            <label style={{fontSize:'0.78rem',fontWeight:500,color:C.text3,display:'block'}}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="dark-input" style={{resize:'vertical',height:'auto'}} placeholder="Optional description..."/>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{modal.type==='add'?'Create':'Update'}</Button>
        </div>
      </Modal>

      <Modal isOpen={modal.type==='delete'} onClose={closeModal} title="Delete Department" size="sm">
        <p style={{color:C.text2,fontSize:'0.88rem',lineHeight:1.6}}>
          Are you sure you want to delete <strong style={{color:C.text1}}>{modal.data?.name}</strong>?
          {modal.data?.employee_count>0&&(<span style={{display:'block',marginTop:'8px',color:C.red,background:isDark?'rgba(239,68,68,0.08)':'rgba(220,38,38,0.06)',padding:'8px 10px',borderRadius:'6px',border:`1px solid ${isDark?'rgba(239,68,68,0.2)':'rgba(220,38,38,0.2)'}`}}>This department has {modal.data.employee_count} active employee(s). Reassign them first.</span>)}
        </p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={saving}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDepartments;
