import {buildCasePackage} from './packageFiles.js';
import React,{useState} from 'react';
import ClientFiles from '../documents/ClientFiles.jsx';
import {copyCaseFile} from './caseFiles.js';
import {documentTitle} from '../documents/documentLabels.js';
export default function CaseAttachments({client,record,onChange}){
 const [selected,setSelected]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const files=(client.docs||[]).filter(f=>!f.kind.includes('Signature'));
 const download=async()=>{setBusy(true);setError('');try{const blob=await buildCasePackage(record);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`case-${record.id}-attachments.tar`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){setError(e.message)}finally{setBusy(false)}};
 const importFile=async()=>{setBusy(true);setError('');try{const file=files.find(f=>(f.id||f.name)===selected);if(!file)throw new Error('Choose a Profile document.');const copy=await copyCaseFile(file);onChange(c=>({...c,attachments:[...(c.attachments||[]),copy]}));setSelected('')}catch(e){setError(e.message)}finally{setBusy(false)}};
 return <div className="case-files-content"><p>Case copies are independent of Profile. Upload the original IEP as a separate attachment here, along with EV, Exit, Follow-up and other supporting files. IEP is included in the Case package.</p><label className="input">Select from Profile<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose a document</option>{files.map(f=><option key={f.id||f.name} value={f.id||f.name}>{documentTitle(f)}</option>)}</select></label><button className="btn secondary" disabled={busy||!selected} onClick={importFile}>{busy?'Copying…':'Add to Case'}</button><button className="btn secondary" disabled={busy} onClick={download}>Download Case Package</button>{error&&<p role="alert">{error}</p>}<ClientFiles client={{...client,docs:record.attachments||[],cases:[record]}} fullPage onUpdate={next=>onChange(c=>({...c,attachments:next.docs,exit:next.cases[0].exit,followups:next.cases[0].followups}))}/></div>
}
