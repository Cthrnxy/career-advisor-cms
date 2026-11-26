import React,{useState} from 'react';
import {METHODS,RESULTS,EMPLOYMENT,saveRound,addAttempt,quarterLabel,roundStatus} from './followupModel.js';
import {dateKey} from '../calendar/calendarModel.js';
import {fileStore} from '../documents/fileStore.js';
import {validateFile} from '../documents/documentModel.js';
import {documentTitle} from '../documents/documentLabels.js';
export default function FollowupPanel({record,client,index,onChange,onClose}){
 const round=record.followups?.[index]||{},previous=record.followups?.[index-1];
 const [draft,setDraft]=useState(()=>({...round,date:round.date||dateKey(),employment:round.employment||'Unknown'}));
 const [attempt,setAttempt]=useState({date:dateKey(),method:'Phone',result:'Reached',note:''});
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const set=(key,value)=>setDraft(d=>({...d,[key]:value}));
 const input=(key,label,type='text')=><label className="input">{label}<input type={type} min={type==='number'?0:undefined} step={type==='number'?'any':undefined} value={draft[key]||''} onChange={e=>set(key,e.target.value)}/></label>;
 const files=(record.attachments||[]).filter(f=>f.blobKey&&!(record.followups||[]).some((r,i)=>i!==index&&r.file===f.name));
 const upload=async file=>{if(!file)return;setBusy(true);setError('');let id,committed=false;try{validateFile(file);id=crypto.randomUUID();await fileStore('put',id,file);const entry={id,blobKey:id,name:id+'-'+file.name,title:`Follow-up ${index+1} evidence`,kind:'Other Documents',size:file.size,mime:file.type,uploadedAt:new Date().toISOString()};onChange(r=>({...r,attachments:[...(r.attachments||[]),entry]}));committed=true;set('file',entry.name)}catch(e){if(id&&!committed)await fileStore('delete',id).catch(()=>{});setError(e.message)}finally{setBusy(false)}};
 const save=()=>{try{const next=saveRound(record,index,draft);onChange(()=>next);onClose()}catch(e){setError(e.message)}};
 const close=()=>{const keys=['date','note','file','employment','employer','position','hourlyWage','weeklyHours','nextContactDate'];const initial={...round,date:round.date||dateKey(),employment:round.employment||'Unknown'};if(keys.some(k=>(draft[k]||'')!==(initial[k]||''))&&!window.confirm('Discard unsaved Follow-up changes?'))return;onClose()};
 return <div className="appointment-overlay"><aside className="appointment-panel" role="dialog" aria-modal="true" aria-label={`Follow-up ${index+1}`}><header><div><small>{client.name} · {record.form} Case · {record.applicationNumber||record.id}</small><h2>Follow-up {index+1} · {quarterLabel(record,index)}</h2><p>{roundStatus(round)}</p></div><button className="btn secondary" aria-label="Close Follow-up" disabled={busy} onClick={close}>×</button></header>
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 {previous&&<details><summary>Previous Follow-up — reference only</summary><p>{previous.date||'No completed date'} · {previous.employment||'Unknown'}</p><p>{previous.employer||'—'} · {previous.position||'—'}</p><p>{previous.note||'No notes'}</p></details>}
 <h3>This round</h3>{input('date','Completed date','date')}<label className="input">Employment status<select value={draft.employment} onChange={e=>set('employment',e.target.value)}>{EMPLOYMENT.map(x=><option key={x}>{x}</option>)}</select></label>
 {draft.employment==='Employed'&&<>{input('employer','Employer (optional)')}{input('position','Position (optional)')}{input('hourlyWage','Hourly wage (optional)','number')}{input('weeklyHours','Weekly hours (optional)','number')}</>}
 <label className="input">Notes (optional)<textarea value={draft.note||''} onChange={e=>set('note',e.target.value)}/></label>
 <label className="input">Case file<select value={draft.file||''} onChange={e=>set('file',e.target.value)}><option value="">No file — save as draft</option>{draft.file&&!files.some(f=>f.name===draft.file)&&<option value={draft.file}>Previously linked file</option>}{files.map(f=><option key={f.id||f.name} value={f.name}>{documentTitle(f)}</option>)}</select></label><label className="input">Upload this round's file<input type="file" disabled={busy} onChange={e=>upload(e.target.files?.[0])}/></label>
 {input('nextContactDate','Next contact date (adds to calendar)','date')}<p>A completed date and a file complete this round. Contact attempts alone do not complete it.</p><button className="btn primary" disabled={busy} onClick={save}>Save Follow-up</button>
 <h3>Contact attempts</h3><label className="input">Contact date<input type="date" value={attempt.date} onChange={e=>setAttempt(a=>({...a,date:e.target.value}))}/></label>{[['method','Method',METHODS],['result','Result',RESULTS]].map(([key,label,options])=><label className="input" key={key}>{label}<select value={attempt[key]} onChange={e=>setAttempt(a=>({...a,[key]:e.target.value}))}>{options.map(x=><option key={x}>{x}</option>)}</select></label>)}<label className="input">Short note<input value={attempt.note} onChange={e=>setAttempt(a=>({...a,note:e.target.value}))}/></label><button className="btn secondary" disabled={busy} onClick={()=>{try{const next=addAttempt(record,index,attempt);onChange(()=>next);setAttempt(a=>({...a,note:''}));setError('');setNotice('Contact attempt saved. This does not complete the round.')}catch(e){setError(e.message)}}}>Add Contact Attempt</button>
 {[...(round.attempts||[])].reverse().map(a=><p key={a.id}>{a.date} · {a.method} · {a.result}{a.note?' · '+a.note:''}</p>)}
 <details><summary>Change history</summary>{[...(round.history||[])].reverse().map((h,i)=><div key={i}><p>{new Date(h.at).toLocaleString()} · {h.action}</p>{Object.keys(h.after||{}).filter(k=>!['attempts','history'].includes(k)&&h.before?.[k]!==h.after[k]).map(k=><p key={k}>{k==='file'?'File':k}: {k==='file'?(h.before?.file?'Attached':'None'):(h.before?.[k]||'—')} → {k==='file'?(h.after.file?'Attached':'None'):(h.after[k]||'—')}</p>)}</div>)}</details>
 </aside></div>;
}
