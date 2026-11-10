import React,{useEffect,useState} from 'react';
import HomeDashboard from './features/home/HomeDashboard.jsx';
import WorkspaceBreadcrumbHeader from './layouts/WorkspaceBreadcrumbHeader.jsx';
import WorkspaceTabs from './layouts/WorkspaceTabs.jsx';
import {getTabId,getTabTitle} from './layouts/navigation.js';
import {demoClients,getStatus,makeCase,DOCUMENT_TYPES,uid} from './data.js';
const STORE='career-advisor-cms-synthetic-v01';
const load=()=>{try{const saved=JSON.parse(localStorage.getItem(STORE));if(!Array.isArray(saved))return demoClients;const known=new Set(saved.map(c=>c.id));return [...saved,...demoClients.filter(c=>!known.has(c.id))]}catch{return demoClients}};
const today=()=>new Date().toISOString().slice(0,10);
function Button({children,onClick,kind='secondary',disabled=false}){return <button type="button" onClick={onClick} className={'btn '+kind} disabled={disabled}>{children}</button>}
function Card({title,action,children}){return <section className="card"><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>}
function Label({text,value}){return <div className="label-value"><span>{text}</span><strong>{value||'—'}</strong></div>}
function Input({label,value,onChange,type='text',placeholder=''}){return <label className="input"><span>{label}</span><input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function FormRows({items}){return <div className="field-grid">{items.map(([k,v])=><Label key={k} text={k} value={v}/>)}</div>}
function App(){
const[clients,setClients]=useState(load);
const[screen,setScreen]=useState('Home');
const[clientId,setClientId]=useState('CL-1024');
const[caseId,setCaseId]=useState('case-201');
const[query,setQuery]=useState('');
const[clientListFilter,setClientListFilter]=useState('All');
const[sidebarCollapsed,setSidebarCollapsed]=useState(false);
const[tabs,setTabs]=useState([{id:'Home',screen:'Home',title:'Home'}]);
const[editing,setEditing]=useState(false);
const[profile,setProfile]=useState({});
const[modal,setModal]=useState('');
const[formChoice,setFormChoice]=useState('201');
const[fields,setFields]=useState({});
const[followIndex,setFollowIndex]=useState(0);
const[documentName,setDocumentName]=useState('');
const[message,setMessage]=useState('');
useEffect(()=>localStorage.setItem(STORE,JSON.stringify(clients)),[clients]);
const client=clients.find(c=>c.id===clientId)||clients[0];
const current=client.cases.find(c=>c.id===caseId);
const activeTabId=getTabId(screen,clientId,caseId);
useEffect(()=>{
  const entry={id:activeTabId,screen,clientId,caseId,title:getTabTitle(screen,client,current)};
  setTabs(existing=>{
    const index=existing.findIndex(t=>t.id===activeTabId);
    if(index<0)return [...existing,entry];
    if(existing[index].title===entry.title)return existing;
    return existing.map((t,i)=>i===index?{...t,title:entry.title}:t);
  });
},[activeTabId,screen,clientId,caseId,client.name,current?.form,current?.applicationNumber]);

const ready=clients.filter(c=>c.status==='Ready for Enroll');
const show=m=>{setModal(m);setFields({});setDocumentName('')};
const flash=m=>{setMessage(m);setTimeout(()=>setMessage(''),3500)};
const changeClient=(id,fn)=>setClients(arr=>arr.map(c=>c.id===id?fn(c):c));
const changeCase=(fn)=>changeClient(client.id,c=>({...c,cases:c.cases.map(r=>r.id===caseId?fn(r):r)}));
const hasUnsavedProfile=()=>editing&&['name','phone','email','employment','status'].some(k=>(profile[k]||'')!==(client[k]||''));
const switchView=(nextScreen,nextClientId=clientId,nextCaseId=caseId)=>{
  if(getTabId(nextScreen,nextClientId,nextCaseId)!==activeTabId&&hasUnsavedProfile()){
    if(!window.confirm('You have unsaved changes in the client profile. Leave this page and discard those changes?'))return false;
  }
  if(nextClientId!==clientId)setClientId(nextClientId);
  if(nextCaseId!==caseId)setCaseId(nextCaseId);
  if(getTabId(nextScreen,nextClientId,nextCaseId)!==activeTabId)setEditing(false);
  setScreen(nextScreen);
  return true;
};
const openClient=id=>switchView('Client Detail',id);
const openCase=(c,id=client.id)=>switchView('Case Detail',id,c.id);
const closeWorkspace=id=>{
  if(id==='Home')return;
  if(id===activeTabId){
    const others=tabs.filter(t=>t.id!==id);
    const fallback=others[others.length-1]||{id:'Home',screen:'Home'};
    if(!switchView(fallback.screen,fallback.clientId||clientId,fallback.caseId||caseId))return;
  }
  setTabs(existing=>existing.filter(t=>t.id!==id));
};
const startProfile=()=>{setProfile({...client});setEditing(true)};
const createEnrollment=()=>{const c=makeCase(formChoice);changeClient(client.id,x=>({...x,cases:[c,...x.cases]}));setCaseId(c.id);setModal('');setScreen('Case Detail');flash('New Draft Case created')};
const saveExit=()=>{if(!fields.date){flash('Exit date required');return}changeCase(c=>({...c,exit:{date:fields.date,outcome:fields.outcome||'Job Found',evidence:fields.evidence||''}}));setModal('')};
const saveFollow=()=>{if(!fields.date){flash('Date required');return}changeCase(c=>({...c,followups:[...c.followups,{date:fields.date,note:fields.note||'',file:''}]}));setModal('')};
const saveFile=()=>{if(!documentName){flash('Please select a file');return}changeCase(c=>({...c,followups:c.followups.map((f,i)=>i===followIndex?{...f,file:documentName}:f)}));setModal('')};
const selectFile=(file)=>{setFields(f=>({...f,evidence:file}));setModal('Exit')};
const openSearchResults=value=>{if(switchView('Clients')){setQuery(value);setClientListFilter('All')}};
const openExited=()=>{if(switchView('Clients')){setQuery('');setClientListFilter('Exited')}};
const breadcrumbItems = [
  {key:'root',label:'NJC'},
  ...(screen==='Home' ? [{key:'Home',label:'Homepage'}] :
      ['Client Detail','Case Detail','Form Editor'].includes(screen)
        ? [
          {key:'Clients',label:'Clients'},
          {key:'Client Detail',label:client.name},
          ...(screen==='Case Detail'||screen==='Form Editor' ? [{key:'Case Detail',label:(current?.form||'201')+' Case'}] : []),
          ...(screen==='Form Editor' ? [{key:'Form Editor',label:'Form Editor'}] : [])
        ]
        : [{key:screen,label:screen}])
];
const navigateBreadcrumb=key=>{
  if(key==='root'||key==='Home'){switchView('Home');return}
  if(key==='Clients'){if(switchView('Clients')){setQuery('');setClientListFilter('All')}return}
  if(key==='Client Detail'){switchView('Client Detail');return}
  if(key==='Case Detail'){switchView('Case Detail');return}
  switchView(key);
};
const pageTitle=screen==='Client Detail'?client.name:screen==='Case Detail'?current?.form+' Case Detail':screen==='Form Editor'?current?.form+' Form Editor':screen;
const casesForTable=(list)=> <div className="table-scroll"><table><thead><tr><th>Client</th><th>Form</th><th>App Date</th><th>App Number</th><th>Case Status</th><th>Action</th></tr></thead><tbody>{list.map(({c,r})=><tr key={c.id+r.id} onDoubleClick={()=>openCase(r,c.id)}><td>{c.name}</td><td>{r.form}</td><td>{r.applicationDate||'—'}</td><td>{r.applicationNumber||'—'}</td><td><span className="status">{getStatus(r)}</span></td><td><Button onClick={()=>openCase(r,c.id)}>Open</Button></td></tr>)}</tbody></table></div>;
return <div className="shell">
<aside className={'sidebar '+(sidebarCollapsed?'collapsed':'')}>
<div className="sidebar-title"><span className="logo">▦</span>{!sidebarCollapsed&&<h2>Career Advisor</h2>}<button title={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'} aria-label={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'} className="sidebar-toggle" onClick={()=>setSidebarCollapsed(v=>!v)}>{sidebarCollapsed?'»':'«'}</button></div>
{!sidebarCollapsed&&<small>WORKSPACE</small>}
{[['⌂','Home'],['▤','Enroll Clients'],['♙','Clients'],['▦','Calendar'],['⚙','Settings']].map(([icon,name])=><button key={name} title={name} className={'nav '+(screen===name?'selected':'')} onClick={()=>{if(switchView(name)&&name==='Clients'){setQuery('');setClientListFilter('All')}}><span className="nav-icon">{icon}</span>{!sidebarCollapsed&&<span>{name}</span>}</button>)}
<button title="Add New Client" className="nav outline" onClick={()=>show('New Client')}><span className="nav-icon">＋</span>{!sidebarCollapsed&&<span>Add New Client</span>}</button>
{!sidebarCollapsed&&<p className="sidebar-foot">CLIENT MANAGEMENT SYSTEM</p>}
</aside>
<div className="work">
<WorkspaceTabs tabs={tabs} activeId={activeTabId} onActivate={tab=>switchView(tab.screen,tab.clientId||clientId,tab.caseId||caseId)} onClose={closeWorkspace} onHome={()=>switchView('Home')}/>
<WorkspaceBreadcrumbHeader items={breadcrumbItems} onNavigate={navigateBreadcrumb}/>
<main>{screen!=='Home'&&<header className="page-head"><div><h1>{pageTitle}</h1><p>{screen==='Client Detail'?'Client ID: '+client.id:screen==='Case Detail'?'Application #: '+(current?.applicationNumber||'Not assigned'):'Internal case management workspace'}</p></div><div className="actions">{screen==='Client Detail'&&<><Button onClick={startProfile}>Edit Profile</Button><Button kind="primary" onClick={()=>show('New Enrollment')}>+ Start New Enrollment</Button></>}{screen==='Case Detail'&&<Button onClick={()=>switchView('Client Detail')}>← Back to {client.name}</Button>}</div></header>}
{screen==='Home'&&<HomeDashboard clients={clients} onOpenClient={openClient} onSearch={openSearchResults} onAddClient={()=>show('New Client')} onReady={()=>{if(switchView('Enroll Clients'))setQuery('')}} onExited={openExited} onEnrolled={()=>{if(switchView('Enroll Clients'))setQuery('')}} onCalendar={()=>switchView('Calendar')}/>}
{screen==='Enroll Clients'&&<><Card title="Search Existing Clients"><input className="wide-input" placeholder="Search existing clients" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&clients.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())).map(c=><p key={c.id} className="link" onClick={()=>openClient(c.id)}>{c.name} · {c.id} →</p>)}</Card><Card title="Ready for Enroll">{ready.map(c=><div className="item" key={c.id} onClick={()=>openClient(c.id)}><b>{c.name}</b><span>Open Profile →</span></div>)}</Card><Card title="Enrolled (Not Exited)">{casesForTable(clients.flatMap(c=>c.cases.filter(r=>getStatus(r)==='Enrolled').map(r=>({c,r}))))}</Card></>}
{screen==='Clients'&&<Card title={clientListFilter==='Exited'?'Exited Clients':'All Clients'}>{clients.filter(c=> (clientListFilter!=='Exited'||c.cases.some(r=>getStatus(r)==='Exited')) && (!query.trim()||(c.name+' '+c.id+' '+(c.phone||'')+' '+c.cases.map(r=>r.applicationNumber).join(' ')).toLowerCase().includes(query.toLowerCase()))).map(c=><div key={c.id} className="item" onClick={()=>openClient(c.id)}>{c.name} · {c.id}<span>Open →</span></div>)}</Card>}
{screen==='Calendar'&&<Card title="Upcoming Appointments"><p>9:30 AM · Lihua Zhang — Document Review</p><p>11:00 AM · Ming Chen — Enrollment</p><p>2:00 PM · Jason Lee — Job Search Support</p><p className="muted">Synthetic appointments for demonstration; calendar integration is planned.</p></Card>}
{screen==='Settings'&&<Card title="Settings"><p>This is a frontend-only prototype using synthetic data. No backend or real client files are connected.</p></Card>}
{screen==='Client Detail'&&<><Card title="Client Information">{editing?<><div className="field-grid">{[['name','Name'],['phone','Phone Number'],['email','Email Address'],['employment','Employment Status'],['status','Client Profile Status']].map(([key,label])=><Input key={key} label={label} value={profile[key]} onChange={v=>setProfile(p=>({...p,[key]:v}))}/>)}</div><div className="right"><Button onClick={()=>setEditing(false)}>Cancel</Button><Button kind="primary" onClick={()=>{if(!profile.name?.trim()){flash('Name is required');return}changeClient(client.id,c=>({...c,name:profile.name,phone:profile.phone,email:profile.email,employment:profile.employment,status:profile.status}));setEditing(false);flash('Profile saved locally')}}>Save Changes</Button></div></>:<FormRows items={ [['Name',client.name],['Client ID',client.id],['Phone Number',client.phone],['Email Address',client.email],['Employment Status',client.employment],['Client Profile Status',client.status]]}/>}</Card>
<Card title="Enrollment Records"><div className="table-scroll"><table><thead><tr><th>Form</th><th>App Date</th><th>App Number</th><th>Case Status</th><th>Open</th></tr></thead><tbody>{client.cases.map(r=><tr key={r.id} onDoubleClick={()=>openCase(r)}><td>{r.form}</td><td>{r.applicationDate||'—'}</td><td>{r.applicationNumber||'—'}</td><td><span className="status">{getStatus(r)}</span></td><td><Button onClick={()=>openCase(r)}>Open →</Button></td></tr>)}</tbody></table></div><small>Double-click any row to open its independent Case Detail.</small></Card>
<Card title="Documents on File">{DOCUMENT_TYPES.filter(k=>!k.includes('Signature')).map(kind=><div className="item" key={kind}><div><b>{kind}</b><small>{client.docs.filter(d=>d.kind===kind).at(-1)?.name||'Not uploaded'}</small></div><Button onClick={()=>{setFields({kind});show('Client File')}}>Upload / Replace</Button></div>)}</Card>
<Card title="Signatures">{DOCUMENT_TYPES.filter(k=>k.includes('Signature')).map(kind=><div className="item" key={kind}><div><b>{kind}</b><small>{client.docs.filter(d=>d.kind===kind).at(-1)?.name||'Not uploaded'}</small></div><Button onClick={()=>{show('Client File');setFields({kind})}}>Upload / Replace</Button></div>)}</Card>
<Card title="Client Visits / Job Search"><div className="right"><Button onClick={()=>show('Visit Note')}>+ Add Visit Note</Button></div>{client.visits.map((v,i)=><div className="item" key={i}><span>{v.date} · {v.service}</span><span>{v.notes}</span></div>)}</Card></>}
{screen==='Case Detail'&&current&&<><Card title="Case Summary"><FormRows items={[['Form Type',current.form],['Application Date',current.applicationDate],['Application Number',current.applicationNumber],['Enrollment Date',current.enrollmentDate],['Exit Date',current.exit?.date],['Case Status',getStatus(current)]]}/><div className="right"><Button onClick={()=>{show('Case Summary');setFields({applicationDate:current.applicationDate,applicationNumber:current.applicationNumber,enrollmentDate:current.enrollmentDate})}}>Edit Summary</Button>{!current.enrolled&&<Button kind="primary" onClick={()=>{changeCase(c=>({...c,enrolled:true,enrollmentDate:c.enrollmentDate||today()}));flash('Enrollment recorded')}}>Mark Enrolled</Button>}</div></Card>
<Card title="Enrollment Form"><Button onClick={()=>switchView('Form Editor')}>Open / Edit Form</Button><span className="muted"> Form editing does not create an additional Case.</span></Card>
<Card title="Activity Records"><div className="right"><Button kind="primary" onClick={()=>show('Add Activity')}>+ Add Activity</Button></div><table><thead><tr><th>Activity Type</th><th>Completed Date</th><th>Notes</th></tr></thead><tbody>{current.activities.map((a,i)=><tr key={i}><td>{a.type}</td><td>{a.date}</td><td>{a.note||'—'}</td></tr>)}</tbody></table></Card>
<Card title="Exit Record"><FormRows items={[['Exit Date',current.exit?.date],['Outcome',current.exit?.outcome],['Evidence',current.exit?.evidence||'File Pending']]}/><div className="right"><Button onClick={()=>{show('Exit');setFields({date:current.exit?.date||current.activities.filter(a=>a.type==='Job Searching').at(-1)?.date||'',outcome:current.exit?.outcome||'Job Found',evidence:current.exit?.evidence||''})}}>Record / Edit Exit</Button></div></Card>
<Card title="Follow-up Records"><p className="muted">{current.form==='201'?'4 rounds':'1 round'} · Each round has an optional file, which can be uploaded later.</p>{Array.from({length:current.form==='201'?4:1},(_,i)=>{const f=current.followups[i];return <div className="follow" key={i}><b>Follow-up {i+1}</b><span>{f?.date||'Not completed'}</span><span>{f?.file||'File Pending'}</span>{f&&<Button onClick={()=>{setFollowIndex(i);show('Follow-up File')}}>Upload / Replace</Button>}</div>})}<div className="right">{current.followups.length<(current.form==='201'?4:1)&&<Button kind="primary" onClick={()=>show('Add Follow-up')}>+ Record Follow-up</Button>}</div></Card></>}
{screen==='Form Editor'&&current&&<><Button onClick={()=>switchView('Case Detail')}>← Back to Case Detail</Button><div className="editor"><Card title="Editable Fields"><Input label="Application Date" value={current.applicationDate} onChange={v=>changeCase(c=>({...c,applicationDate:v}))}/><Input label="Application Number" value={current.applicationNumber} onChange={v=>changeCase(c=>({...c,applicationNumber:v}))}/><Input label="Client Name" value={client.name} onChange={()=>{}}/><p className="muted">Additional PDF field mappings are planned. Current inputs save to the browser demo state.</p></Card><Card title="PDF Preview"><div className="pdf-placeholder"><b>{current.form} Form</b><p>Actual PDF rendering and mapping will be connected in a later phase.</p></div></Card></div></>}
</main></div>
{modal&&<div className="backdrop" onClick={()=>setModal('')}><div className="dialog" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>{({ 'New Enrollment':'Start New Enrollment','Add Follow-up':'Record Follow-up','Client File':'Upload Client Document'})[modal]||modal}</h2><Button onClick={()=>setModal('')}>✕</Button></div>
{modal==='New Enrollment'&&<><p>Select the form type for a new independent Draft Case.</p><label className="choice"><input type="radio" checked={formChoice==='201'} onChange={()=>setFormChoice('201')}/> 201 — WIOA Adult</label><label className="choice"><input type="radio" checked={formChoice==='999'} onChange={()=>setFormChoice('999')}/> 999 — General Fund</label><div className="right"><Button onClick={()=>setModal('')}>Cancel</Button><Button kind="primary" onClick={createEnrollment}>Create Draft</Button></div></>}
{modal==='Case Summary'&&<><Input label="Application Date" value={fields.applicationDate} onChange={v=>setFields(x=>({...x,applicationDate:v}))}/><Input label="Application Number" value={fields.applicationNumber} onChange={v=>setFields(x=>({...x,applicationNumber:v}))}/><Input label="Enrollment Date" value={fields.enrollmentDate} onChange={v=>setFields(x=>({...x,enrollmentDate:v}))}/><Button kind="primary" onClick={()=>{changeCase(c=>({...c,...fields}));setModal('')}}>Save Changes</Button></>}
{modal==='Add Activity'&&<><label className="input"><span>Activity Type</span><select value={fields.type||'Job Searching'} onChange={e=>setFields(f=>({...f,type:e.target.value}))}><option>Job Searching</option><option>IEP</option><option>Other</option></select></label><Input type="date" label="Completed Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Optional Note" value={fields.note} onChange={v=>setFields(f=>({...f,note:v}))}/><Button kind="primary" onClick={()=>{if(!fields.date){flash('Date required');return}changeCase(c=>({...c,activities:[...c.activities,{type:fields.type||'Job Searching',date:fields.date,note:fields.note||''}]}));setModal('')}}>Save Activity</Button></>}
{modal==='Exit'&&<><Input label="Exit Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Outcome" value={fields.outcome} onChange={v=>setFields(f=>({...f,outcome:v}))}/><div className="action-line"><Button onClick={()=>setModal('Select Existing File')}>Select Existing File</Button><Button onClick={()=>setModal('Upload New File')}>Upload New File</Button></div><p>Linked Evidence: {fields.evidence||'File Pending'}</p><Button kind="primary" onClick={saveExit}>Save Exit</Button></>}
{modal==='Select Existing File'&&<><p>Choose an existing file already stored in this client's profile.</p><select className="wide-input" value={documentName} onChange={e=>setDocumentName(e.target.value)}><option value="">Select file</option>{client.docs.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select><Button kind="primary" onClick={()=>{if(documentName)selectFile(documentName)}}>Select File</Button></>}
{modal==='Upload New File'&&<><p>Upload is simulated; only the selected filename is retained in browser storage.</p><label className="input"><span>Document Type</span><select><option>EV / Paystub</option><option>Employer Signature</option></select></label><input type="file" onChange={e=>setDocumentName(e.target.files?.[0]?.name||'')}/><Button kind="primary" onClick={()=>{if(documentName)selectFile(documentName)}}>Upload & Link</Button></>}
{modal==='Add Follow-up'&&<><Input type="date" label="Completed Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Optional Note" value={fields.note} onChange={v=>setFields(f=>({...f,note:v}))}/><p className="muted">You can upload its file after saving this follow-up.</p><Button kind="primary" onClick={saveFollow}>Save Follow-up</Button></>}
{modal==='Follow-up File'&&<><p>File for Follow-up {followIndex+1}. Upload and status are independent.</p><input type="file" onChange={e=>setDocumentName(e.target.files?.[0]?.name||'')}/><Button kind="primary" onClick={saveFile}>Save File</Button></>}
{modal==='Visit Note'&&<><Input type="date" label="Visit Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><Input label="Service Provided" value={fields.service} onChange={v=>setFields(f=>({...f,service:v}))}/><Input label="Notes" value={fields.notes} onChange={v=>setFields(f=>({...f,notes:v}))}/><Button kind="primary" onClick={()=>{if(!fields.date){flash('Date required');return}changeClient(client.id,c=>({...c,visits:[...c.visits,{date:fields.date,service:fields.service||'Job Search',notes:fields.notes||''}]}));setModal('')}}>Save Note</Button></>}
{modal==='Client File'&&<><p>Only filename is kept in this browser prototype. No actual file upload occurs.</p><label className="input"><span>Document Type</span><select value={fields.kind||'Other Documents'} onChange={e=>setFields(f=>({...f,kind:e.target.value}))}>{DOCUMENT_TYPES.map(k=><option key={k}>{k}</option>)}</select></label><input type="file" onChange={e=>setDocumentName(e.target.files?.[0]?.name||'')}/><Button kind="primary" onClick={()=>{if(!documentName)return;changeClient(client.id,c=>({...c,docs:[...c.docs,{name:documentName,kind:fields.kind||'Other Documents'}]}));setModal('')}}>Save File Reference</Button></>}
{modal==='New Client'&&<><Input label="Name" value={fields.name} onChange={v=>setFields(f=>({...f,name:v}))}/><Button kind="primary" onClick={()=>{if(!fields.name?.trim())return;let c={id:'CL-'+Math.floor(2000+Math.random()*5000),name:fields.name,phone:'',email:'',employment:'Unknown',status:'Job Searching',docs:[],visits:[],cases:[]};setClients(arr=>[...arr,c]);setModal('');openClient(c.id)}}>Create Demo Client</Button></>}
</div></div>}
{message&&<div className="toast">{message}</div>}
</div>
}
export default App;
