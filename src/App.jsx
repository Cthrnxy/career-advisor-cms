import React,{useEffect,useState} from 'react';
import EnrollmentFormEditor from './features/enrollment/EnrollmentFormEditor.jsx';
import HomeDashboard from './features/home/HomeDashboard.jsx';
import CaseList from './features/home/CaseList.jsx';
import ClientProfile from './features/client/ClientProfile.jsx';
import {followupCount} from './caseWorkflow.js';
import HomepageSettings from './features/settings/HomepageSettings.jsx';
import {DEFAULT_HOME_SETTINGS,normalizeHomeSettings} from './homeSettings.js';
import BreadcrumbNav from './layouts/BreadcrumbNav.jsx';
import {getRouteId,getRouteLabel,pushNavigationHistory} from './layouts/navigation.js';
import {demoClients,getStatus,makeCase,DOCUMENT_TYPES,uid} from './data.js';
const STORE='career-advisor-cms-synthetic-v01';
const HOME_SETTINGS_STORE='career-advisor-cms-home-preferences-v01';
const loadHomeSettings=()=>{try{return normalizeHomeSettings(JSON.parse(localStorage.getItem(HOME_SETTINGS_STORE)))}catch{return normalizeHomeSettings(DEFAULT_HOME_SETTINGS)}};
const load=()=>{try{const saved=JSON.parse(localStorage.getItem(STORE));if(!Array.isArray(saved))return demoClients;const known=new Set(saved.map(c=>c.id));return [...saved,...demoClients.filter(c=>!known.has(c.id))]}catch{return demoClients}};
const today=()=>new Date().toISOString().slice(0,10);
function Button({children,onClick,kind='secondary',disabled=false}){return <button type="button" onClick={onClick} className={'btn '+kind} disabled={disabled}>{children}</button>}
function Card({title,action,children}){return <section className="card"><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>}
function Label({text,value}){return <div className="label-value"><span>{text}</span><strong>{value||'—'}</strong></div>}
function Input({label,value,onChange,type='text',placeholder=''}){return <label className="input"><span>{label}</span><input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function FormRows({items}){return <div className="field-grid">{items.map(([k,v])=><Label key={k} text={k} value={v}/>)}</div>}
function App(){
const[clients,setClients]=useState(load);
const[homeSettings,setHomeSettings]=useState(loadHomeSettings);
const[screen,setScreen]=useState('Home');
const[clientId,setClientId]=useState('CL-1024');
const[caseId,setCaseId]=useState('case-201');
const[query,setQuery]=useState('');
const[clientListFilter,setClientListFilter]=useState('All');
const[sidebarCollapsed,setSidebarCollapsed]=useState(false);
const[routeHistory,setRouteHistory]=useState([]);
const[editing,setEditing]=useState(false);
const[profile,setProfile]=useState({});
const[modal,setModal]=useState('');
const[formChoice,setFormChoice]=useState('201');
const[fields,setFields]=useState({});
const[followIndex,setFollowIndex]=useState(0);
const[documentName,setDocumentName]=useState('');
const[followupSource,setFollowupSource]=useState('existing');
const[message,setMessage]=useState('');
useEffect(()=>localStorage.setItem(STORE,JSON.stringify(clients)),[clients]);
useEffect(()=>{try{localStorage.setItem(HOME_SETTINGS_STORE,JSON.stringify(homeSettings))}catch{}},[homeSettings]);
const client=clients.find(c=>c.id===clientId)||clients[0];
const current=client.cases.find(c=>c.id===caseId);

const ready=clients.filter(c=>c.status==='Ready for Enroll');
const show=m=>{setModal(m);setFields({});setDocumentName('')};
const flash=m=>{setMessage(m);setTimeout(()=>setMessage(''),3500)};
const changeClient=(id,fn)=>setClients(arr=>arr.map(c=>c.id===id?fn(c):c));
const changeCase=(fn)=>changeClient(client.id,c=>({...c,cases:c.cases.map(r=>r.id===caseId?fn(r):r)}));
const hasUnsavedProfile=()=>editing&&['name','phone','email','employment','status','program'].some(k=>(profile[k]||'')!==(client[k]||''));
const routeChanged=(nextScreen,nextClientId,nextCaseId)=>getRouteId(nextScreen,nextClientId,nextCaseId)!==getRouteId(screen,clientId,caseId);
const confirmLeave=()=>!hasUnsavedProfile()||window.confirm('You have unsaved changes in the client profile. Leave this page and discard those changes?');
const switchView=(nextScreen,nextClientId=clientId,nextCaseId=caseId)=>{
  const changed=routeChanged(nextScreen,nextClientId,nextCaseId);
  if(changed&&!confirmLeave())return false;
  if(changed){
    setRouteHistory(history=>pushNavigationHistory(history,{screen,clientId,caseId}));
    setEditing(false);
    setModal('');
  }
  setClientId(nextClientId);
  setCaseId(nextCaseId);
  setScreen(nextScreen);
  return true;
};
const goBack=()=>{
  const last=routeHistory.at(-1);
  if(!last)return switchView('Home');
  if(!confirmLeave())return false;
  setRouteHistory(history=>history.slice(0,-1));
  setEditing(false);
  setModal('');
  setClientId(last.clientId);
  setCaseId(last.caseId);
  setScreen(last.screen);
  return true;
};
const navigateBreadcrumb=item=>switchView(item.screen,item.clientId||clientId,item.caseId||caseId);
const previous=routeHistory.at(-1);
const previousClient=clients.find(c=>c.id===previous?.clientId);
const previousCase=previousClient?.cases.find(c=>c.id===previous?.caseId);
const backLabel=getRouteLabel(previous,previousClient,previousCase);
const openClient=id=>switchView('Client Detail',id);
const openCase=(c,id=client.id)=>switchView('Case Detail',id,c.id);
const startProfile=()=>{setProfile({...client});setEditing(true)};
const createEnrollment=()=>{const c=makeCase(formChoice);changeClient(client.id,x=>({...x,cases:[c,...x.cases]}));setModal('');openCase(c);flash('New Draft Case created')};
const saveExit=()=>{if(!fields.date){flash('Exit date required');return}changeCase(c=>({...c,exit:{date:fields.date,outcome:fields.outcome||'Job Found',evidence:fields.evidence||''}}));setModal('')};
const openFollowup=index=>{
  const record=(current?.followups||[])[index]||{};
  setFollowIndex(index);
  setFields({date:record.date||'',note:record.note||'',file:record.file||''});
  setDocumentName('');
  setFollowupSource('existing');
  setModal('Edit Follow-up');
};
const saveFollow=()=>{
  const nextFile=documentName||fields.file||'';
  const previousFile=(current?.followups||[])[followIndex]?.file||'';
  changeClient(client.id,c=>{
    const nextCases=(c.cases||[]).map(record=>{
      if(record.id!==caseId)return record;
      const nextRounds=[...(record.followups||[])];
      while(nextRounds.length<=followIndex)nextRounds.push({date:'',note:'',file:''});
      nextRounds[followIndex]={date:fields.date||'',note:fields.note||'',file:nextFile};
      return {...record,followups:nextRounds};
    });
    let nextDocs=[...(c.docs||[])];
    if(followupSource==='new'&&documentName){
      const index=nextDocs.findIndex(d=>d.name===previousFile&&previousFile);
      const replacement={name:documentName,kind:'Follow-up '+(followIndex+1)};
      if(index>=0)nextDocs[index]=replacement;
      else nextDocs.push(replacement);
    }
    return {...c,cases:nextCases,docs:nextDocs};
  });
  setModal('');
  flash('Follow-up saved');
};
const availableFollowupFiles=(client.docs||[]).filter(d=>{
  const usedElsewhere=(client.cases||[]).some(record=>(record.followups||[]).some((f,i)=>f?.file===d.name&&(record.id!==caseId||i!==followIndex)));
  return !usedElsewhere;
});
const selectFile=(file)=>{setFields(f=>({...f,evidence:file}));setModal('Exit')};
const openSearchResults=value=>{if(switchView('Clients')){setQuery(value);setClientListFilter('All')}};
const openExited=()=>switchView('Exited Cases');
const pageTitle=screen==='Client Detail'?client.name:screen==='Case Detail'?current?.form+' Case Detail':screen==='Form Editor'?current?.form+' Form Editor':screen;
const casesForTable=(list)=> <div className="table-scroll"><table><thead><tr><th>Client</th><th>Form</th><th>App Date</th><th>App Number</th><th>Case Status</th><th>Action</th></tr></thead><tbody>{list.map(({c,r})=><tr key={c.id+r.id} onDoubleClick={()=>openCase(r,c.id)}><td>{c.name}</td><td>{r.form}</td><td>{r.applicationDate||'—'}</td><td>{r.applicationNumber||'—'}</td><td><span className="status">{getStatus(r)}</span></td><td><Button onClick={()=>openCase(r,c.id)}>Open</Button></td></tr>)}</tbody></table></div>;
return <div className="shell">
<aside className={'sidebar '+(sidebarCollapsed?'collapsed':'')}>
<div className="sidebar-title"><span className="logo">▦</span>{!sidebarCollapsed&&<h2>Career Advisor</h2>}<button title={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'} aria-label={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'} className="sidebar-toggle" onClick={()=>setSidebarCollapsed(v=>!v)}>{sidebarCollapsed?'»':'«'}</button></div>
{!sidebarCollapsed&&<small>WORKSPACE</small>}
{[['⌂','Home'],['▤','Enroll Clients'],['♙','Clients'],['▦','Calendar'],['⚙','Settings']].map(([icon,name])=><button key={name} title={name} className={'nav '+(screen===name?'selected':'')} onClick={()=>{if(switchView(name)&&name==='Clients'){setQuery('');setClientListFilter('All')}}}><span className="nav-icon">{icon}</span>{!sidebarCollapsed&&<span>{name}</span>}</button>)}
<button title="Add New Client" className="nav outline" onClick={()=>show('New Client')}><span className="nav-icon">＋</span>{!sidebarCollapsed&&<span>Add New Client</span>}</button>
{!sidebarCollapsed&&<p className="sidebar-foot">CLIENT MANAGEMENT SYSTEM</p>}
</aside>
<div className="work">
<main>
<BreadcrumbNav screen={screen} client={client} record={current} onNavigate={navigateBreadcrumb} onBack={goBack} backLabel={backLabel}/>
{!['Home','Client Detail','Enrolled Cases','Follow-ups','Exited Cases','Settings'].includes(screen)&&<header className="page-head"><div><h1>{pageTitle}</h1><p>{screen==='Client Detail'?'Client ID: '+client.id:screen==='Case Detail'?'Application #: '+(current?.applicationNumber||'Not assigned'):'Internal case management workspace'}</p></div><div className="actions">{screen==='Client Detail'&&<><Button onClick={startProfile}>Edit Profile</Button><Button kind="primary" onClick={()=>show('New Enrollment')}>+ Start New Enrollment</Button></>}</div></header>}
{screen==='Home'&&<HomeDashboard clients={clients} onOpenClient={openClient} onOpenCase={openCase} onSearch={openSearchResults} onAddClient={()=>show('New Client')} onReady={()=>{if(switchView('Enroll Clients'))setQuery('')}} onExited={openExited} onEnrolled={()=>switchView('Enrolled Cases')} onFollowups={()=>switchView('Follow-ups')} onCalendar={()=>switchView('Calendar')} homeSettings={homeSettings} onCustomize={()=>switchView('Settings')}/>}
{['Enrolled Cases','Follow-ups','Exited Cases'].includes(screen)&&<CaseList mode={screen} clients={clients} onOpenCase={openCase} onHome={()=>switchView('Home')}/>}

{screen==='Enroll Clients'&&<><Card title={'Ready for Enroll — Clients ('+ready.length+')'}>{ready.length?ready.map(c=><button key={c.id} className="ready-client-row" onClick={()=>openClient(c.id)}><span>{c.name}</span><span>›</span></button>):<p className="muted">No clients currently marked Ready for Enroll.</p>}</Card></>}

{screen==='Clients'&&<Card title={clientListFilter==='Exited'?'Exited Clients':'All Clients'}>{clients.filter(c=> (clientListFilter!=='Exited'||c.cases.some(r=>getStatus(r)==='Exited')) && (!query.trim()||(c.name+' '+c.id+' '+(c.phone||'')+' '+c.cases.map(r=>r.applicationNumber).join(' ')).toLowerCase().includes(query.toLowerCase()))).map(c=><div key={c.id} className="item" onClick={()=>openClient(c.id)}>{c.name} · {c.id}<span>Open →</span></div>)}</Card>}
{screen==='Calendar'&&<Card title="Upcoming Appointments"><p>9:30 AM · Lihua Zhang — Document Review</p><p>11:00 AM · Ming Chen — Enrollment</p><p>2:00 PM · Jason Lee — Job Search Support</p><p className="muted">Synthetic appointments for demonstration; calendar integration is planned.</p></Card>}
{screen==='Settings'&&<HomepageSettings value={homeSettings} onChange={setHomeSettings} onGoHome={()=>switchView('Home')}/>}
{screen==='Client Detail'&&<ClientProfile client={client} editing={editing} profile={profile} onProfileChange={setProfile} onEdit={startProfile} onCancel={()=>setEditing(false)} onSave={()=>{
 if(!profile.name?.trim()){flash('Name is required');return;}
 changeClient(client.id,c=>({...c,name:profile.name,phone:profile.phone,email:profile.email,employment:profile.employment,status:profile.status,program:profile.program}));
 setEditing(false);flash('Profile saved locally');
}} onNewCase={()=>show('New Enrollment')} onOpenCase={record=>openCase(record)} onUpload={kind=>{show('Client File');setFields({kind})}} onAddVisit={()=>show('Visit Note')}/>}

{screen==='Case Detail'&&current&&<><Card title="Case Summary"><FormRows items={[['Form Type',current.form],['Application Date',current.applicationDate],['Application Number',current.applicationNumber],['Enrollment Date',current.enrollmentDate],['Exit Date',current.exit?.date],['Case Status',getStatus(current)]]}/><div className="right"><Button onClick={()=>{show('Case Summary');setFields({applicationDate:current.applicationDate,applicationNumber:current.applicationNumber,enrollmentDate:current.enrollmentDate})}}>Edit Summary</Button>{!current.enrolled&&<Button kind="primary" onClick={()=>{changeCase(c=>({...c,enrolled:true,enrollmentDate:c.enrollmentDate||today()}));flash('Enrollment recorded')}}>Mark Enrolled</Button>}</div></Card>
<Card title="Enrollment Form"><Button onClick={()=>switchView('Form Editor')}>Open / Edit Form</Button><span className="muted"> Form editing does not create an additional Case.</span></Card>
<Card title="Activity Records"><div className="right"><Button kind="primary" onClick={()=>show('Add Activity')}>+ Add Activity</Button></div><table><thead><tr><th>Activity Type</th><th>Completed Date</th><th>Notes</th></tr></thead><tbody>{current.activities.map((a,i)=><tr key={i}><td>{a.type}</td><td>{a.date}</td><td>{a.note||'—'}</td></tr>)}</tbody></table></Card>
<Card title="Exit Record"><FormRows items={[['Exit Date',current.exit?.date],['Outcome',current.exit?.outcome],['Evidence',current.exit?.evidence||'File Pending']]}/><div className="right"><Button onClick={()=>{show('Exit');setFields({date:current.exit?.date||current.activities.filter(a=>a.type==='Job Searching').at(-1)?.date||'',outcome:current.exit?.outcome||'Job Found',evidence:current.exit?.evidence||''})}}>Record / Edit Exit</Button></div></Card>
<Card title="Follow-up Records">
<p className="muted">All rounds are editable at any time. Completed Date and File are both required to finish a round.</p>
<div className="table-scroll"><table className="case-follow-table"><thead><tr><th>Follow-up</th><th>Completed Date</th><th>File</th><th>Action</th></tr></thead><tbody>
{Array.from({length:followupCount(current)},(_,i)=>{const round=current.followups?.[i];return <tr key={i}>
<td><strong>Follow-up {i+1}</strong></td><td>{round?.date||'—'}</td><td>{round?.file||'—'}</td><td><Button onClick={()=>openFollowup(i)}>Edit</Button></td>
</tr>})}
</tbody></table></div>
</Card></>}
{screen==='Form Editor'&&current&&(current.form==='201'?<EnrollmentFormEditor key={current.id} record={current} client={client} onChange={next=>changeCase(c=>({...c,applicationDate:next.applicationDate||'',applicationNumber:next.applicationNumber||'',fields:{...(c.fields||{}),enrollmentEditor:next}}))} onSave={()=>flash('201 Form draft saved in this browser')}/>:<div className="editor"><Card title="Editable Fields"><Input label="Application Date" value={current.applicationDate} onChange={v=>changeCase(c=>({...c,applicationDate:v}))}/><Input label="Application Number" value={current.applicationNumber} onChange={v=>changeCase(c=>({...c,applicationNumber:v}))}/><Input label="Client Name" value={client.name} onChange={()=>{}}/><p className="muted">Full 999 field mapping is planned. This demo saves locally.</p></Card><Card title="PDF Preview"><div className="pdf-placeholder"><b>999 Form</b><p>Actual PDF rendering and mapping will be connected in a later phase.</p></div></Card></div>)}
</main></div>
{modal&&<div className="backdrop" onClick={()=>setModal('')}><div className="dialog" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>{({ 'New Enrollment':'Start New Enrollment','Add Follow-up':'Record Follow-up','Client File':'Upload Client Document'})[modal]||modal}</h2><Button onClick={()=>setModal('')}>✕</Button></div>
{modal==='New Enrollment'&&<><p>Select the form type for a new independent Draft Case.</p><label className="choice"><input type="radio" checked={formChoice==='201'} onChange={()=>setFormChoice('201')}/> 201 — WIOA Adult</label><label className="choice"><input type="radio" checked={formChoice==='999'} onChange={()=>setFormChoice('999')}/> 999 — General Fund</label><div className="right"><Button onClick={()=>setModal('')}>Cancel</Button><Button kind="primary" onClick={createEnrollment}>Create Draft</Button></div></>}
{modal==='Case Summary'&&<><Input label="Application Date" value={fields.applicationDate} onChange={v=>setFields(x=>({...x,applicationDate:v}))}/><Input label="Application Number" value={fields.applicationNumber} onChange={v=>setFields(x=>({...x,applicationNumber:v}))}/><Input label="Enrollment Date" value={fields.enrollmentDate} onChange={v=>setFields(x=>({...x,enrollmentDate:v}))}/><Button kind="primary" onClick={()=>{changeCase(c=>({...c,...fields}));setModal('')}}>Save Changes</Button></>}
{modal==='Add Activity'&&<><label className="input"><span>Activity Type</span><select value={fields.type||'Job Searching'} onChange={e=>setFields(f=>({...f,type:e.target.value}))}><option>Job Searching</option><option>IEP</option><option>Other</option></select></label><Input type="date" label="Completed Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Optional Note" value={fields.note} onChange={v=>setFields(f=>({...f,note:v}))}/><Button kind="primary" onClick={()=>{if(!fields.date){flash('Date required');return}changeCase(c=>({...c,activities:[...c.activities,{type:fields.type||'Job Searching',date:fields.date,note:fields.note||''}]}));setModal('')}}>Save Activity</Button></>}
{modal==='Exit'&&<><Input label="Exit Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Outcome" value={fields.outcome} onChange={v=>setFields(f=>({...f,outcome:v}))}/><div className="action-line"><Button onClick={()=>setModal('Select Existing File')}>Select Existing File</Button><Button onClick={()=>setModal('Upload New File')}>Upload New File</Button></div><p>Linked Evidence: {fields.evidence||'File Pending'}</p><Button kind="primary" onClick={saveExit}>Save Exit</Button></>}
{modal==='Select Existing File'&&<><p>Choose an existing file already stored in this client's profile.</p><select className="wide-input" value={documentName} onChange={e=>setDocumentName(e.target.value)}><option value="">Select file</option>{client.docs.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select><Button kind="primary" onClick={()=>{if(documentName)selectFile(documentName)}}>Select File</Button></>}
{modal==='Upload New File'&&<><p>Upload is simulated; only the selected filename is retained in browser storage.</p><label className="input"><span>Document Type</span><select><option>EV / Paystub</option><option>Employer Signature</option></select></label><input type="file" onChange={e=>setDocumentName(e.target.files?.[0]?.name||'')}/><Button kind="primary" onClick={()=>{if(documentName)selectFile(documentName)}}>Upload & Link</Button></>}
{modal==='Edit Follow-up'&&<>
 <nav className="followup-breadcrumb" aria-label="Follow-up hierarchy"><span>{client.name}</span><span>›</span><span>{current?.form} Case</span><span>›</span><strong>Follow-up {followIndex+1}</strong></nav>
 <Input type="date" label="Completed Date" value={fields.date} onChange={value=>setFields(f=>({...f,date:value}))}/>
 <label className="input"><span>Notes (optional)</span><textarea rows="3" value={fields.note||''} onChange={e=>setFields(f=>({...f,note:e.target.value}))} placeholder="Follow-up notes"/></label>
 <div className="fu-file-picker"><label>Follow-up File</label><p>Currently linked: <strong>{fields.file||'No file selected'}</strong></p>
 <div className="fu-source-switch"><button type="button" className={followupSource==='existing'?'selected':''} onClick={()=>{setFollowupSource('existing');setDocumentName('')}}>Select Existing File</button><button type="button" className={followupSource==='new'?'selected':''} onClick={()=>{setFollowupSource('new');setDocumentName('')}}>Upload New File</button></div>
 {followupSource==='existing'?<select className="wide-input" value={documentName} onChange={e=>setDocumentName(e.target.value)}><option value="">Keep current file / select another</option>{availableFollowupFiles.map((d,i)=><option key={d.name+':'+i} value={d.name}>{d.name}</option>)}</select>:
 <><input type="file" onChange={e=>setDocumentName(e.target.files?.[0]?.name||'')}/><p className="muted">This demo stores filenames only. The selected filename will also appear in Client Documents.</p></>}
 </div>
 <div className="fu-modal-actions"><Button onClick={()=>setModal('')}>Cancel</Button><Button kind="primary" onClick={saveFollow}>Save Follow-up</Button></div>
</>}

{modal==='Visit Note'&&<><Input type="date" label="Visit Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Service Provided" value={fields.service} onChange={v=>setFields(f=>({...f,service:v}))}/><Input label="Notes" value={fields.notes} onChange={v=>setFields(f=>({...f,notes:v}))}/><Button kind="primary" onClick={()=>{if(!fields.date){flash('Date required');return}changeClient(client.id,c=>({...c,visits:[...c.visits,{date:fields.date,service:fields.service||'Job Search',notes:fields.notes||''}]}));setModal('')}}>Save Note</Button></>}
{modal==='Client File'&&<><p>Only filename is kept in this browser prototype. No actual file upload occurs.</p><label className="input"><span>Document Type</span><select value={fields.kind||'Other Documents'} onChange={e=>setFields(f=>({...f,kind:e.target.value}))}>{DOCUMENT_TYPES.map(k=><option key={k}>{k}</option>)}</select></label><input type="file" onChange={e=>setDocumentName(e.target.files?.[0]?.name||'')}/><Button kind="primary" onClick={()=>{if(!documentName)return;changeClient(client.id,c=>{const kind=fields.kind||'Other Documents';const docs=[...(c.docs||[])];const idx=docs.findIndex(d=>d.kind===kind);if(idx>=0)docs[idx]={name:documentName,kind};else docs.push({name:documentName,kind});return {...c,docs}});setModal('')}}>Save File Reference</Button></>}
{modal==='New Client'&&<><Input label="Name" value={fields.name} onChange={v=>setFields(f=>({...f,name:v}))}/><Button kind="primary" onClick={()=>{if(!fields.name?.trim())return;let c={id:'CL-'+Math.floor(2000+Math.random()*5000),name:fields.name,phone:'',email:'',employment:'Unknown',status:'Job Searching',docs:[],visits:[],cases:[]};setClients(arr=>[...arr,c]);setModal('');openClient(c.id)}}>Create Demo Client</Button></>}
</div></div>}
{message&&<div className="toast">{message}</div>}
</div>
}
export default App;
