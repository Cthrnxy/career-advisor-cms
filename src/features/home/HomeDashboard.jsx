import React,{useMemo,useState} from 'react';
import {enrolledCases,dueFollowupCases} from '../../caseWorkflow.js';
import {calendarTasks,dateKey,listAppointments} from '../calendar/calendarModel.js';
import {normalizeHomeSettings} from '../../homeSettings.js';
import './home.css';
const formatDay=iso=>iso?new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
const daysSince=iso=>{if(!iso)return '—';const start=new Date(iso+'T12:00:00');const now=new Date();now.setHours(12,0,0,0);return Math.max(0,Math.round((now-start)/86400000))+' days';};
const searchText=c=>([c.name,c.id,c.phone,...(c.cases||[]).map(r=>r.applicationNumber)].join(' ')).toLowerCase();
export default function HomeDashboard({clients,onOpenClient,onOpenCase,onSearch,onAddClient,onReady,onExited,onEnrolled,onFollowups,onCalendar,onOpenAppointment,homeSettings,onCustomize}){
 const [search,setSearch]=useState('');
 const [focus,setFocus]=useState(false);
 const homepageAppointments=listAppointments(clients).filter(a=>!a.completed&&a.date>=dateKey());
 const homepageTodos=calendarTasks(clients).filter(t=>t.dueDate?t.dueDate<=dateKey():!t.date||t.date<=dateKey());
 const suggestions=useMemo(()=>search.trim()?clients.filter(c=>searchText(c).includes(search.trim().toLowerCase())).slice(0,6):[],[clients,search]);
 const enrolled=useMemo(()=>enrolledCases(clients),[clients]);
 const followups=dueFollowupCases(clients);
 const ready=clients.filter(c=>c.status==='Ready for Enroll').length;
 const exited=clients.flatMap(c=>(c.cases||[]).filter(r=>Boolean(r.exit?.date))).length;
 const submit=e=>{e.preventDefault();setFocus(false);onSearch(search.trim());};
 const prefs=normalizeHomeSettings(homeSettings);
 const visible=prefs.order.filter(id=>!prefs.hidden.includes(id));
 const cards={
   quickAccess:<div className="home-quick-module">
  <div className="home-heading"><h2>Quick Access</h2></div>
  <div className="home-shortcuts">
   <button onClick={onAddClient}><span className="home-short-icon">♧</span><b>Add New Client</b><span>›</span></button>
   <button onClick={onReady}><span className="home-short-icon">☑</span><b>Ready for Enroll</b><span className="home-short-end"><small>{ready} clients</small> ›</span></button>
   <button onClick={onExited}><span className="home-short-icon">✓</span><b>Exited Cases</b><span className="home-short-end"><small>{exited} cases</small> ›</span></button>
  </div>
   </div>,
   appointments:<React.Fragment>
   <section className="home-panel">
    <div className="home-panelhead"><h3>▦ &nbsp; Appointments ({homepageAppointments.length})</h3><button onClick={onCalendar}>View All &nbsp; ›</button></div>
    {homepageAppointments.slice(0,5).map(a=><button className="home-appointment" key={a.id+a.clientId} onClick={()=>onOpenAppointment(a.clientId,a)}><span className="home-time">{a.date} · {a.time||'Time TBD'}</span><strong>{a.name}</strong><span>·</span><span>{a.reason}</span><span className="home-appointment-arrow">›</span></button>)}
    {!homepageAppointments.length&&<p className="home-empty">No upcoming appointments.</p>}
   </section>
   </React.Fragment>,
   todo:<React.Fragment>
   <section className="home-panel">
    <div className="home-panelhead"><h3>☑ &nbsp; To-do ({homepageTodos.length})</h3><button onClick={onCalendar}>View All &nbsp; ›</button></div>
    {homepageTodos.slice(0,5).map(task=><div className="home-task" key={task.clientId+task.id}><span>{task.name} · {task.label}</span><button title={'Open '+task.label} onClick={()=>onOpenCase(task.record,task.clientId)} type="button">Open case</button></div>)}
    {!homepageTodos.length&&<p className="home-empty">No case tasks due.</p>}
   </section>
   </React.Fragment>,
   enrolled:<React.Fragment>
  <section className="home-panel home-enrolled">
   <div className="home-panelhead"><h3>▤ &nbsp; Enrolled (Not Exited) &nbsp; ({enrolled.length})</h3><button onClick={onEnrolled}>View All &nbsp; ›</button></div>
   <div className="home-table-scroll"><table><thead><tr><th>Client Name</th><th>Program</th><th>Form Type</th><th>Enrollment Date</th><th>Last Activity</th><th>Days Enrolled</th><th></th></tr></thead><tbody>
    {enrolled.length?enrolled.slice(0,5).map(({client,record})=>{const activity=[...(record.activities||[])].filter(a=>a.date).sort((a,b)=>b.date.localeCompare(a.date))[0];return <tr key={client.id+':'+record.id} onClick={()=>onOpenCase(record,client.id)}><td><button type="button" className="home-client-link" onClick={e=>{e.stopPropagation();onOpenCase(record,client.id)}}>{client.name}</button></td><td>{record.program||client.program||'—'}</td><td><span className="home-form-chip">{record.form}</span></td><td>{formatDay(record.enrollmentDate)}</td><td>{activity?activity.type+' ('+formatDay(activity.date)+')':'—'}</td><td>{daysSince(record.enrollmentDate)}</td><td className="home-arrow">›</td></tr>}):
    <tr><td colSpan="7" className="home-empty">No enrolled Cases currently awaiting Exit.</td></tr>}
   </tbody></table></div>
   {enrolled.length>5&&<div className="home-table-footer">Showing 5 of {enrolled.length} Cases</div>}
  </section>
   </React.Fragment>,
   followup:<React.Fragment>
  <section className="home-panel home-enrolled home-followups">
   <div className="home-panelhead"><div><h3>◷ &nbsp; Follow-up &nbsp; ({followups.length})</h3><p>Exited Cases with follow-ups due this quarter or earlier</p></div><button onClick={onFollowups}>View All &nbsp; ›</button></div>
   <div className="home-table-scroll"><table className="home-follow-table"><thead><tr><th>Client Name</th><th>Program</th><th>Form Type</th><th>Exit Date</th><th>Status</th><th></th></tr></thead><tbody>
    {followups.length?followups.slice(0,5).map(({client,record,round})=><tr key={client.id+':'+record.id} onClick={()=>onOpenCase(record,client.id)}><td><button type="button" className="home-client-link" onClick={e=>{e.stopPropagation();onOpenCase(record,client.id)}}>{client.name}</button></td><td>{record.program||client.program||'—'}</td><td><span className="home-form-chip">{record.form}</span></td><td>{formatDay(record.exit.date)}</td><td><span className="home-stage-chip">Follow-up {round}</span></td><td className="home-arrow">›</td></tr>):
    <tr><td colSpan="6" className="home-empty">No Follow-up Cases due at the moment. The next round appears when its quarter begins.</td></tr>}
   </tbody></table></div>
   {followups.length>5&&<div className="home-table-footer">Showing 5 of {followups.length} Cases</div>}
  </section>
   </React.Fragment>
 };
 const halfCard=id=>['appointments','todo'].includes(id);
 const isHalf=(id,i)=>halfCard(id)&&(halfCard(visible[i-1])||halfCard(visible[i+1]));
 return <div className={'home-v1 home-custom '+(prefs.density==='compact'?'home-compact':'home-comfortable')}>
  <div className="home-hero">
   <div className="home-greeting"><h1>Good morning, Catherine</h1><p>Find a client or continue today's work.</p></div>
   <form className="home-search-wrap" onSubmit={submit}>
    <div className="home-searchbar"><span className="home-search-icon" aria-hidden="true">⌕</span><input aria-label="Search clients" autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setTimeout(()=>setFocus(false),140)} placeholder="Search clients by name, phone, ID, or application #"/><button type="submit">Search</button></div>
    {focus&&search.trim()&&<div className="home-suggestions" role="listbox" aria-label="Matching clients">{suggestions.length?suggestions.map(c=><button type="button" className="home-suggest" key={c.id} onMouseDown={e=>e.preventDefault()} onClick={()=>{setSearch('');setFocus(false);onOpenClient(c.id)}}><span className="home-person">♙</span><b>{c.name}</b><span className="home-suggest-detail">{c.id} · {c.phone||'No phone'}</span><span className="home-pill">{c.status||'Client'}</span><span aria-hidden="true">›</span></button>):<p className="home-noresults">No matching clients. Use Search to open the client list.</p>}</div>}
   </form>
  </div>

  <div className="home-custom-heading"><div><h2>Your Dashboard</h2><p>Choose the modules and their order in Settings.</p></div><button type="button" onClick={onCustomize}>⚙ &nbsp; Customize Homepage</button></div>
  {visible.length?<div className="home-custom-grid">{visible.map((id,index)=><div className={'home-widget '+(isHalf(id,index)?'home-widget-half':'home-widget-full')} key={id}>{cards[id]}</div>)}</div>:<div className="home-custom-empty"><h3>Your dashboard is empty</h3><p>Turn modules back on to see them here.</p><button onClick={onCustomize}>Open Homepage Settings ›</button></div>}
  <p className="home-demo-disclaimer">Homepage v3.0 · Dashboard preferences save locally. All client data and appointments are synthetic.</p>
 </div>;
}
