import React from 'react';
import {DOCUMENT_TYPES,getStatus} from '../../data.js';
import './client.css';

const visible=v=>v||'—';
const asDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'—';
function Meta({label,value}){return <div className="client-meta"><span>{label}</span><strong>{visible(value)}</strong></div>}
function Field({label,value,onChange}){return <label className="client-field"><span>{label}</span><input value={value||''} onChange={e=>onChange(e.target.value)}/></label>}
export default function ClientProfile({client,editing,profile,onProfileChange,onEdit,onCancel,onSave,onBack,onNewCase,onOpenCase,onUpload,onAddVisit}){
 const docs=client.docs||[], cases=client.cases||[];
 const initials=client.name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join('');
 const docRows=DOCUMENT_TYPES.filter(kind=>!kind.includes('Signature'));
 const signatures=DOCUMENT_TYPES.filter(kind=>kind.includes('Signature'));
 const visits=[...(client.visits||[])].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const followupDocs=docs.filter(d=>(d.kind||'').startsWith('Follow-up'));
 const FileRow=({kind})=>{const file=docs.filter(d=>d.kind===kind).at(-1);return <div className="client-doc-row">
   <div className={'client-doc-icon '+(file?'is-present':'')}>{file?'✓':'▤'}</div>
   <div className="client-doc-text"><strong>{kind}</strong><span title={file?.name}>{file?.name||'Not uploaded'}</span></div>
   <button type="button" className="client-doc-action" onClick={()=>onUpload(kind)}>{file?'Replace':'Upload'}</button>
 </div>};
 return <div className="client-v2">
  <nav className="client-crumb" aria-label="Client hierarchy"><button onClick={onBack}>Clients</button><span aria-hidden="true">›</span><strong>{client.name}</strong></nav>
  <header className="client-hero">
    <div className="client-ident"><div className="client-avatar">{initials||'C'}</div><div><span className="client-eyebrow">CLIENT PROFILE · {client.id}</span><h1>{client.name}</h1><div className="client-chiprow"><span className="client-chip">{client.status||'Job Searching'}</span>{client.program&&<span className="client-chip alt">{client.program}</span>}</div></div></div>
    <div className="client-header-actions"><button className="client-button" onClick={onEdit}>Edit Profile</button><button className="client-button primary" onClick={onNewCase}>+ Start New Enrollment</button></div>
  </header>
  <section className="client-section">
    <div className="client-section-title"><h2>Client Information</h2><span>Contact and employment information</span></div>
    {editing?<><div className="client-field-grid">{[['name','Name'],['phone','Phone Number'],['email','Email Address'],['employment','Employment Status'],['status','Client Profile Status'],['program','Program']].map(([key,label])=><Field key={key} label={label} value={profile[key]} onChange={value=>onProfileChange(p=>({...p,[key]:value}))}/>)}</div><div className="client-edit-actions"><button className="client-button" onClick={onCancel}>Cancel</button><button className="client-button primary" onClick={onSave}>Save Changes</button></div></>:
    <div className="client-information-grid"><Meta label="Phone" value={client.phone}/><Meta label="Email" value={client.email}/><Meta label="Employment" value={client.employment}/><Meta label="Program" value={client.program}/></div>}
  </section>
  <div className="client-columns">
    <div className="client-main-col">
      <section className="client-section">
        <div className="client-section-title"><div><h2>Enrollment Records <span className="client-count">{cases.length}</span></h2><p>Each enrollment has its own 201 or 999 Case.</p></div><button className="client-text-button" onClick={onNewCase}>+ New Case</button></div>
        <div className="client-table-wrap"><table className="client-table"><thead><tr><th>Form Type</th><th>Program</th><th>Application Date</th><th>App #</th><th>Case Status</th><th>Action</th></tr></thead><tbody>
          {cases.length?cases.map(record=><tr key={record.id} onDoubleClick={()=>onOpenCase(record)}>
           <td><span className="client-form-tag">{record.form}</span></td><td>{record.program||client.program||'—'}</td><td>{asDate(record.applicationDate)}</td><td>{visible(record.applicationNumber)}</td><td><span className="client-case-status">{getStatus(record)}</span></td><td><button type="button" className="client-row-link" onClick={()=>onOpenCase(record)}>Open ›</button></td>
          </tr>):<tr><td colSpan="6"><div className="client-empty">No Enrollment Cases yet. Use Start New Enrollment to create one.</div></td></tr>}
        </tbody></table></div>
      </section>
      <section className="client-section">
        <div className="client-section-title"><div><h2>Client Visits & Job Search</h2><p>Service notes are independent of Case activities.</p></div><button className="client-text-button" onClick={onAddVisit}>+ Add Visit Note</button></div>
        {visits.length?<div className="client-visit-list">{visits.map((v,i)=><div className="client-visit" key={v.date+'-'+i}><span className="client-visit-dot">●</span><div><strong>{v.service||'Visit'}</strong><span>{v.notes||'No additional notes'}</span></div><time>{asDate(v.date)}</time></div>)}</div>:<div className="client-empty">No visits recorded yet.</div>}
      </section>
    </div>
    <aside className="client-side-col">
      <section className="client-section">
        <div className="client-section-title"><div><h2>Documents on File</h2><p>All client documents in one place</p></div><span className="client-count">{docs.length}</span></div>
        {docRows.map(kind=><FileRow key={kind} kind={kind}/>)}
        {followupDocs.length>0&&<div className="client-other-docs"><strong>Follow-up Files</strong>{followupDocs.map((d,i)=><span key={i}>▤ &nbsp;{d.name}</span>)}</div>}
        <p className="client-file-note">Prototype: only filenames are stored in your browser, not real document contents.</p>
      </section>
      <section className="client-section">
        <div className="client-section-title"><div><h2>Signatures</h2><p>Client and employer signature files</p></div></div>
        {signatures.map(kind=><FileRow key={kind} kind={kind}/>)}
      </section>
    </aside>
  </div>
 </div>;
}
