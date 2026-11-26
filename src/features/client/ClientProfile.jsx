import React,{useState} from 'react';
import {getStatus} from '../../data.js';
import './client.css';
import ClientFiles from '../documents/ClientFiles.jsx';

const visible=v=>v||'—';
const asDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'—';
function Meta({label,value}){return <div className="client-meta"><span>{label}</span><strong>{visible(value)}</strong></div>}
function Field({label,value,onChange}){return <label className="client-field"><span>{label}</span><input value={value||''} onChange={e=>onChange(e.target.value)}/></label>}
export default function ClientProfile({client,editing,profile,onProfileChange,onEdit,onCancel,onSave,onNewCase,onOpenCase,onUpdateClient,onViewDocuments,onAddVisit,onEditVisit,onDeleteVisit,onNewAppointment,onOpenAppointment}){
 const cases=client.cases||[];
 const initials=client.name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join('');
 const [allVisits,setAllVisits]=useState(false);
 const visits=(client.visits||[]).map((v,index)=>({...v,index})).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.index-a.index);
 const appointments=[...(client.appointments||[])].sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
 return <div className="client-v2">
  <header className="client-hero">
    <div className="client-ident"><div className="client-avatar">{initials||'C'}</div><div><span className="client-eyebrow">CLIENT PROFILE · {client.id}</span><h1>{client.name}</h1><div className="client-chiprow"><span className="client-chip">{client.status||'Job Searching'}</span>{client.program&&<span className="client-chip alt">{client.program}</span>}</div></div></div>
    <div className="client-header-actions"><button className="client-button" onClick={onAddVisit}>+ Add Visit</button><button className="client-button" onClick={onNewAppointment}>+ New Appointment</button><button className="client-button primary" onClick={onNewCase}>+ Start New Enrollment</button></div>
  </header>
  <section className="client-section">
    <div className="client-section-title"><div><h2>Client Profile</h2><p>Contact information, address and current needs</p></div><button className="client-button" onClick={onEdit}>Edit Profile</button></div>
    {editing?<><div className="client-field-grid">{[['name','Name'],['phone','Phone Number'],['email','Email Address'],['employment','Employment Status'],['status','Client Profile Status'],['program','Program'],['address','Street Address'],['unit','Apt / Unit'],['city','City'],['state','State'],['zip','ZIP Code']].map(([key,label])=><Field key={key} label={label} value={profile[key]} onChange={value=>onProfileChange(p=>({...p,[key]:value}))}/>)}</div><label className="client-field client-needs-field"><span>Current Needs</span><textarea rows="3" value={profile.needs||''} onChange={e=>onProfileChange(p=>({...p,needs:e.target.value}))}/></label><div className="client-edit-actions"><button className="client-button" onClick={onCancel}>Cancel</button><button className="client-button primary" onClick={onSave}>Save Changes</button></div></>:
    <div className="client-information-grid"><Meta label="Phone" value={client.phone}/>{client.intakeDate&&<Meta label="First Service Date" value={asDate(client.intakeDate)}/>}<Meta label="Email" value={client.email}/><Meta label="Employment" value={client.employment}/><Meta label="Program" value={client.program}/><Meta label="Street Address" value={client.address}/><Meta label="Apt / Unit" value={client.unit}/><Meta label="City" value={client.city}/><Meta label="State" value={client.state}/><Meta label="ZIP Code" value={client.zip}/></div>}
    {!editing&&<div className="client-needs-inline"><div className="client-section-title"><h3>Current Needs</h3></div><p className="client-needs">{client.needs||'No current needs recorded.'}</p></div>}
  </section>
      <section className="client-section">
        <div className="client-section-title"><div><h2>Enrollment Records <span className="client-count">{cases.length}</span></h2><p>Each enrollment has its own 201 or 999 Case.</p></div><button className="client-text-button" onClick={onNewCase}>+ New Case</button></div>
        <div className="client-table-wrap"><table className="client-table"><thead><tr><th>Form Type</th><th>Program</th><th>Application Date</th><th>App #</th><th>Case Status</th><th>Action</th></tr></thead><tbody>
          {cases.length?cases.map(record=><tr key={record.id} onDoubleClick={()=>onOpenCase(record)}>
           <td><span className="client-form-tag">{record.form}</span></td><td>{record.program||client.program||'—'}</td><td>{asDate(record.applicationDate)}</td><td>{visible(record.applicationNumber)}</td><td><span className="client-case-status">{getStatus(record)}</span></td><td><button type="button" className="client-row-link" onClick={()=>onOpenCase(record)}>Open ›</button></td>
          </tr>):<tr><td colSpan="6"><div className="client-empty">No Enrollment Cases yet. Use Start New Enrollment to create one.</div></td></tr>}
        </tbody></table></div>
      </section>
  <ClientFiles key={client.id} client={client} onUpdate={onUpdateClient} onViewMore={onViewDocuments}/>
  <div className="client-pair client-services-pair">
      <section className="client-section">
        <div className="client-section-title"><h2>Appointments</h2><button className="client-text-button" onClick={onNewAppointment}>+ New Appointment</button></div>
        {appointments.length?appointments.map(a=><div className="client-visit" key={a.id}><button className="client-appointment-open" onClick={()=>onOpenAppointment(a)}><strong>{a.reason||'Appointment'}</strong><span>{a.time||'Time TBD'} · {a.completed?'Completed':'Not completed'}</span></button><time>{asDate(a.date)}</time></div>):<div className="client-empty">No appointments recorded.</div>}
      </section>
      <section className="client-section">
        <div className="client-section-title"><div><h2>Client Visits & Services <span className="client-count">{visits.length}</span></h2><p>A brief record of each contact and the help provided.</p></div><button className="client-text-button" onClick={onAddVisit}>+ Add Visit</button></div>
        {visits.length?<><div className="client-visit-list">{(allVisits?visits:visits.slice(0,5)).map(v=><div className="client-visit" key={v.index}><div>{v.service&&<strong>{v.service}</strong>}<p className="client-comment">{v.notes||'No comment recorded'}</p><div className="client-visit-actions"><button className="client-text-button" onClick={()=>onEditVisit(v.index)}>Edit</button><button className="client-text-button" onClick={()=>onDeleteVisit(v.index)}>Delete</button></div></div><time>{asDate(v.date)}</time></div>)}</div>{visits.length>5&&<button className="client-button" onClick={()=>setAllVisits(v=>!v)}>{allVisits?'Show Latest 5':`View All (${visits.length})`}</button>}</>:<div className="client-empty">No visits recorded. Add a short comment after helping this client.</div>}
      </section>
  </div>
 </div>;
}
