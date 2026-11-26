import {recordApplicationNumber} from './enrollment.js';
import React,{useState} from 'react';
import {getCaseStatus} from '../../caseWorkflow.js';
import './case.css';

export default function CaseSummary({client,record,onChange,onEnroll}){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState({}),[error,setError]=useState('');
 const start=()=>{setDraft({program:record.program||client.program||'',applicationDate:record.applicationDate||'',applicationNumber:record.applicationNumber||'',enrollmentDate:record.enrollmentDate||''});setError('');setEditing(true)};
 const save=e=>{e.preventDefault();if(!draft.program.trim()){setError('Program is required.');return}try{const next=recordApplicationNumber({...record,...draft,program:draft.program.trim()},draft.applicationNumber);onChange(()=>next)}catch(e){setError(e.message);return}setEditing(false)};
 const items=[['Funding',record.form],['Program',record.program||client.program],['Application Date',record.applicationDate],['Application Number',record.applicationNumber],['Enrollment Date',record.enrollmentDate],['Exit Date',record.exit?.date]];
 return <section className="card case-summary"><div className="card-head"><div><h2>Case Summary</h2><p>{client.name} · {client.id}</p></div><span className="status">{getCaseStatus(record)}</span></div><div className="field-grid">{items.map(([label,value])=><div className="label-value" key={label}><span>{label}</span><strong>{value||'—'}</strong></div>)}</div><div className="right"><button className="btn secondary" onClick={start}>{record.exportedAt&&!record.enrolled?'Add Application Number':'Edit Summary'}</button></div>
 {editing&&<div className="backdrop"><form className="dialog" onSubmit={save}><div className="modal-head"><h2>Edit Case Summary</h2><button type="button" className="btn secondary" aria-label="Close summary" onClick={()=>setEditing(false)}>×</button></div>{[['program','Program','text'],['applicationDate','Application Date','date'],['applicationNumber','Application Number','text'],['enrollmentDate','Enrollment Date','date']].map(([key,label,type])=><label className="input" key={key}>{label}<input type={type} required={key==='program'} value={draft[key]} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))}/></label>)}{error&&<p role="alert">{error}</p>}<div className="right"><button type="button" className="btn secondary" onClick={()=>setEditing(false)}>Cancel</button><button className="btn primary">Save Changes</button></div></form></div>}
 </section>
}
