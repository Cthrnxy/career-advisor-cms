import React,{useState} from 'react';
import DocumentPreview from '../documents/DocumentPreview.jsx';
import {documentTitle} from '../documents/documentLabels.js';
import './formSignatures.css';

const roles=['Client Signature','Employer Signature','CA Signature'];
const signatureKey=file=>file.id||file.blobKey||file.name;
export default function FormSignatures({client,record,onChange,onManage}){
 const [preview,setPreview]=useState(null);
 let staff=[];try{staff=JSON.parse(localStorage.getItem('career-advisor-demo-staff-signatures'))||[]}catch{}
 const selections=record.fields?.signatureSelections||{};
 return <section className="card form-signatures"><div className="card-head"><div><h2>Signatures for this Form</h2><p>Select saved signatures for this enrollment draft. All selections are optional.</p></div><button className="btn secondary" onClick={onManage}>Manage in Profile</button></div><div className="form-signature-grid">{roles.map(role=>{
 const files=(role==='CA Signature'?staff:client.docs||[]).filter(d=>d.kind===role);
 const selected=files.find(d=>signatureKey(d)===selections[role]);
 return <div key={role}><label className="input"><span>{role}</span><select value={selected?selections[role]:''} onChange={e=>{const value=e.target.value;onChange(c=>({...c,fields:{...c.fields,signatureSelections:{...c.fields?.signatureSelections,[role]:value}}}))}}><option value="">No signature selected</option>{files.map(file=><option key={signatureKey(file)} value={signatureKey(file)}>{documentTitle(file)}{file.uploadedAt?' · '+new Date(file.uploadedAt).toLocaleDateString('en-US'):''}</option>)}</select></label>{selected?<button className="btn secondary" onClick={()=>setPreview(selected)}>Preview signature</button>:<p className="muted">{selections[role]?'Previously selected signature is unavailable. Choose another.':files.length?'Select a signature when needed.':'No saved signature. Add one in the client profile.'}</p>}</div>
 })}</div><p className="muted">Selections are saved with this draft. Applying them to official PDF signature fields is not connected yet.</p>{preview&&<DocumentPreview file={preview} onClose={()=>setPreview(null)} onReplace={onManage} onRename={onManage} canRename={false}/>}</section>
}
