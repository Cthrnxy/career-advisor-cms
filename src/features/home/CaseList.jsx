import React from 'react';
import {enrolledCases,dueFollowupCases} from '../../caseWorkflow.js';
import './home.css';
const date=v=>v?new Date(v+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
export default function CaseList({clients,mode,onOpenCase,onHome}){
 const followup=mode==='Follow-ups';
 const cases=followup?dueFollowupCases(clients):enrolledCases(clients);
 return <div className="case-list-page">
  <button type="button" className="case-list-back" onClick={onHome}>‹ Back to Homepage</button>
  <div className="case-list-heading"><div><span>CASE WORKSPACE</span><h1>{followup?'Follow-up Cases':'Enrolled (Not Exited)'}</h1><p>{followup?'Exited Cases with follow-ups due this quarter or earlier':'Enrolled Cases awaiting Exit, across all clients'}</p></div><span className="case-list-total">{cases.length} Cases</span></div>
  <section className="home-panel home-enrolled">
   <div className="home-table-scroll"><table><thead><tr><th>Client Name</th><th>Program</th><th>Form Type</th><th>{followup?'Exit Date':'Enrollment Date'}</th><th>{followup?'Status':'Application #'}</th><th></th></tr></thead><tbody>{cases.length?cases.map(({client,record,round})=><tr key={client.id+':'+record.id} onClick={()=>onOpenCase(record,client.id)}><td><button type="button" className="home-client-link" onClick={e=>{e.stopPropagation();onOpenCase(record,client.id)}}>{client.name}</button></td><td>{record.program||client.program||'—'}</td><td><span className="home-form-chip">{record.form}</span></td><td>{date(followup?record.exit?.date:record.enrollmentDate)}</td><td>{followup?<span className="home-stage-chip">Follow-up {round}</span>:record.applicationNumber||'—'}</td><td className="home-arrow">›</td></tr>):<tr><td colSpan="6" className="home-empty">No matching Cases in the demo.</td></tr>}</tbody></table></div>
  </section>
 </div>;
}
