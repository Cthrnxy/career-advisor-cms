import React,{useMemo,useState} from 'react';
import {getStatus} from '../../data.js';
import {homepageAppointments,homepageTodos} from './homeDemo.js';
import './home.css';

const formatDay=iso=>iso?new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
const daysSince=iso=>{if(!iso)return '—';const a=new Date(iso+'T12:00:00');const now=new Date();now.setHours(12,0,0,0);return Math.max(0,Math.round((now-a)/86400000))+' days';};
const searchText=c=>([c.name,c.id,c.phone,...(c.cases||[]).map(x=>x.applicationNumber)].join(' ')).toLowerCase();
export default function HomeDashboard({clients,onOpenClient,onSearch,onAddClient,onReady,onExited,onEnrolled,onCalendar}){
  const [search,setSearch]=useState('');
  const [focus,setFocus]=useState(false);
  const [done,setDone]=useState({});
  const suggestion=useMemo(()=>search.trim()?clients.filter(c=>searchText(c).includes(search.trim().toLowerCase())).slice(0,6):[],[clients,search]);
  const enrolled=useMemo(()=>clients.flatMap(c=>(c.cases||[]).filter(r=>getStatus(r)==='Enrolled').map(r=>({client:c,record:r}))).sort((a,b)=>(b.record.enrollmentDate||'').localeCompare(a.record.enrollmentDate||'')),[clients]);
  const ready=clients.filter(c=>c.status==='Ready for Enroll').length;
  const exited=clients.filter(c=>(c.cases||[]).some(r=>getStatus(r)==='Exited')).length;
  const submit=e=>{e.preventDefault();setFocus(false);onSearch(search.trim())};
  return <div className="home-v1">
    <div className="home-hero">
      <div className="home-greeting"><h1>Good morning, Catherine</h1><p>Find a client or continue today's work.</p></div>
      <form className="home-search-wrap" onSubmit={submit}>
        <div className="home-searchbar"><span className="home-search-icon" aria-hidden="true">⌕</span><input aria-label="Search clients" autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setTimeout(()=>setFocus(false),140)} placeholder="Search clients by name, phone, or application #"/><button type="submit">Search</button></div>
        {focus&&search.trim()&&<div className="home-suggestions" role="listbox" aria-label="Matching clients">{suggestion.length?suggestion.map(c=><button type="button" className="home-suggest" key={c.id} onMouseDown={e=>e.preventDefault()} onClick={()=>{setSearch('');setFocus(false);onOpenClient(c.id)}}><span className="home-person">♙</span><b>{c.name}</b><span className="home-suggest-detail">{c.id} · {c.phone||'No phone'}</span><span className="home-pill">{c.cases?.some(r=>getStatus(r)==='Enrolled')?'Enrolled':c.status}</span><span aria-hidden="true">›</span></button>):<p className="home-noresults">No matching clients. Use Search to open the client list.</p>}</div>}
      </form>
    </div>
    <div className="home-heading"><h2>Quick Access</h2></div>
    <div className="home-shortcuts">
      <button onClick={onAddClient}><span className="home-short-icon">♧</span><b>Add New Client</b><span>›</span></button>
      <button onClick={onReady}><span className="home-short-icon">☑</span><b>Ready for Enroll</b><span className="home-short-end"><small>{ready} clients</small> ›</span></button>
      <button onClick={onExited}><span className="home-short-icon">✓</span><b>Exited</b><span className="home-short-end"><small>{exited} clients</small> ›</span></button>
    </div>
    <div className="home-heading"><h2>Today's Work</h2></div>
    <div className="home-workgrid">
      <section className="home-panel">
        <div className="home-panelhead"><h3>▦ &nbsp; Appointments ({homepageAppointments.length})</h3><button onClick={onCalendar}>View All &nbsp; ›</button></div>
        {homepageAppointments.map(a=><button className="home-appointment" key={a.time+a.clientId} onClick={()=>onOpenClient(a.clientId)}><span className="home-time">{a.time}</span><strong>{a.name}</strong><span>·</span><span>{a.reason}</span><span className="home-appointment-arrow">›</span></button>)}
      </section>
      <section className="home-panel">
        <div className="home-panelhead"><h3>☑ &nbsp; To-do ({homepageTodos.length})</h3><button onClick={onCalendar}>View All &nbsp; ›</button></div>
        {homepageTodos.map(task=><label className="home-task" key={task.id}><input type="checkbox" checked={!!done[task.id]} onChange={e=>setDone(p=>({...p,[task.id]:e.target.checked}))}/><span className={done[task.id]?'task-finished':''}>{task.label}</span><button title={'Open '+task.label} onClick={()=>onOpenClient(task.clientId)} type="button">›</button></label>)}
      </section>
    </div>
    <section className="home-panel home-enrolled">
      <div className="home-panelhead"><h3>♙ &nbsp; Enrolled (Not Exited) &nbsp; ({enrolled.length})</h3><button onClick={onEnrolled}>View All &nbsp; ›</button></div>
      <div className="home-table-scroll"><table><thead><tr><th>Client Name</th><th>Program</th><th>Enrollment Date</th><th>Last Activity</th><th>Days Enrolled</th><th></th></tr></thead><tbody>{enrolled.length?enrolled.map(({client,record})=>{const a=[...(record.activities||[])].filter(v=>v.date).sort((x,y)=>y.date.localeCompare(x.date))[0];return <tr key={record.id} onClick={()=>onOpenClient(client.id)}><td><button className="home-client-link" onClick={()=>onOpenClient(client.id)}>{client.name}</button></td><td>{client.program||'—'}</td><td>{formatDay(record.enrollmentDate)}</td><td>{a?a.type+' ('+new Date(a.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+')':'—'}</td><td>{daysSince(record.enrollmentDate)}</td><td className="home-arrow">›</td></tr>}):<tr><td colSpan="6">No active enrolled clients in the demo.</td></tr>}</tbody></table></div>
    </section>
    <p className="home-demo-disclaimer">Homepage Wireframe v1.0 · All names, dates, records and appointments are fictional demonstration data.</p>
  </div>;
}