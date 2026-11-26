import FollowupRecords from './features/followup/FollowupRecords.jsx';
import FollowupPanel from './features/followup/FollowupPanel.jsx';
import ActivityExit from './features/case/ActivityExit.jsx';
import {prefillSources,prefillCase,commonAnswerFields} from './features/enrollment/casePrefill.js';
import {fileStore} from './features/documents/fileStore.js';
import {validateFile} from './features/documents/documentModel.js';
import React,{useEffect,useState,useRef} from 'react';
import CaseAttachments from './features/case/CaseAttachments.jsx';
import CaseSummary from './features/case/CaseSummary.jsx';
import CalendarPage from './features/calendar/CalendarPage.jsx';
import AppointmentPanel from './features/calendar/AppointmentPanel.jsx';
import {completeAppointment} from './features/calendar/calendarModel.js';
import FormSignatures from './features/enrollment/FormSignatures.jsx';
import Original201Editor from './features/enrollment/Original201Editor.jsx';
import HomeDashboard from './features/home/HomeDashboard.jsx';
import CaseList from './features/home/CaseList.jsx';
import ClientProfile from './features/client/ClientProfile.jsx';
import ClientFiles from './features/documents/ClientFiles.jsx';
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
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function Button({children,onClick,kind='secondary',disabled=false}){return <button type="button" onClick={onClick} className={'btn '+kind} disabled={disabled}>{children}</button>}
function Card({title,action,children}){return <section className="card"><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>}
function Label({text,value}){return <div className="label-value"><span>{text}</span><strong>{value||'—'}</strong></div>}
function Input({label,value,onChange,type='text',placeholder=''}){return <label className="input"><span>{label}</span><input type={type} value={value||''} onChange={e=>onChange(e.target.value)} onInput={type==='date'?e=>onChange(e.currentTarget.value):undefined} placeholder={placeholder}/></label>}
function FormRows({items}){return <div className="field-grid">{items.map(([k,v])=><Label key={k} text={k} value={v}/>)}</div>}
function App(){
const[clients,setClients]=useState(load);
const formEditorRef=useRef(null),allowEditorLeave=useRef(false);
const[pendingLeave,setPendingLeave]=useState(null);
const[formDirty,setFormDirty]=useState(false);
const deferEditorLeave=run=>{if(!allowEditorLeave.current&&formEditorRef.current?.isDirty()){setPendingLeave({run});return true}return false};
const[showAllActivities,setShowAllActivities]=useState(false);
const[homeSettings,setHomeSettings]=useState(loadHomeSettings);
const[screen,setScreen]=useState('Home');
const[clientId,setClientId]=useState('CL-1024');
const[caseId,setCaseId]=useState('case-201');
useEffect(()=>setShowAllActivities(false),[caseId]);
const[query,setQuery]=useState('');
const[clientListFilter,setClientListFilter]=useState('All');
const[sidebarCollapsed,setSidebarCollapsed]=useState(false);
const[routeHistory,setRouteHistory]=useState([]);
const[editing,setEditing]=useState(false);
const[profile,setProfile]=useState({});
const[modal,setModal]=useState('');
const[formChoice,setFormChoice]=useState('201');
const[fields,setFields]=useState({});
const[followSelection,setFollowSelection]=useState(null);
const[documentName,setDocumentName]=useState('');
const[caseUpload,setCaseUpload]=useState(null);
const[caseUploading,setCaseUploading]=useState(false);
const[followupSource,setFollowupSource]=useState('existing');
const[message,setMessage]=useState('');
const[appointmentSelection,setAppointmentSelection]=useState(null);
useEffect(()=>{if(screen==='Calendar')setSidebarCollapsed(true)},[screen]);
useEffect(()=>localStorage.setItem(STORE,JSON.stringify(clients)),[clients]);
useEffect(()=>{try{localStorage.setItem(HOME_SETTINGS_STORE,JSON.stringify(homeSettings))}catch{}},[homeSettings]);
const client=clients.find(c=>c.id===clientId)||clients[0];
const current=client.cases.find(c=>c.id===caseId);

const ready=clients.filter(c=>c.status==='Ready for Enroll');
const show=m=>{if(m==='New Client'&&deferEditorLeave(()=>show(m)))return;setCaseUpload(null);setModal(m);setFields(['Visit Note','New Client','New Appointment'].includes(m)?{date:today()}:{});setDocumentName('')};
const flash=m=>{setMessage(m);setTimeout(()=>setMessage(''),3500)};
const changeClient=(id,fn)=>setClients(arr=>arr.map(c=>c.id===id?fn(c):c));
const changeCase=(fn)=>changeClient(client.id,c=>({...c,cases:c.cases.map(r=>r.id===caseId?fn(r):r)}));
const hasUnsavedProfile=()=>editing&&['name','phone','email','employment','status','program','address','unit','city','state','zip','needs'].some(k=>(profile[k]||'')!==(client[k]||''));
const routeChanged=(nextScreen,nextClientId,nextCaseId)=>getRouteId(nextScreen,nextClientId,nextCaseId)!==getRouteId(screen,clientId,caseId);
const confirmLeave=()=>!hasUnsavedProfile()||window.confirm('You have unsaved changes in the client profile. Leave this page and discard those changes?');
const switchView=(nextScreen,nextClientId=clientId,nextCaseId=caseId)=>{
  const changed=routeChanged(nextScreen,nextClientId,nextCaseId);
  if(changed&&deferEditorLeave(()=>switchView(nextScreen,nextClientId,nextCaseId)))return false;
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
  if(deferEditorLeave(goBack))return false;
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
const createEnrollment=()=>{if(!fields.program?.trim()){flash('Program is required');return}const sources=prefillSources(client.cases);const source=sources.find(c=>c.id===(fields.prefillSource??sources[0]?.id));const c=prefillCase({...makeCase(formChoice),createdAt:new Date().toISOString(),program:fields.program.trim(),trainingRequired:formChoice==='999'&&!!fields.trainingRequired},source);changeClient(client.id,x=>({...x,cases:[c,...x.cases]}));setModal('');openCase(c);flash('New Draft Case created')};
const openFollowup=(index,record=current,id=client.id)=>setFollowSelection({clientId:id,caseId:record.id,index});
const followClient=clients.find(c=>c.id===followSelection?.clientId);
const followRecord=followClient?.cases.find(r=>r.id===followSelection?.caseId);
const openSearchResults=value=>{if(switchView('Clients')){setQuery(value);setClientListFilter('All')}};
const openExited=()=>switchView('Exited Cases');
const pageTitle=screen==='Documents'?client.name+' · Documents':screen==='Client Detail'?client.name:screen==='Case Detail'?current?.form+' Case Detail':screen==='Form Editor'?current?.form+' Form Editor':screen;
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
{!['Home','Client Detail','Enrolled Cases','Follow-ups','Exited Cases','Settings','Calendar'].includes(screen)&&<header className="page-head"><div><h1>{pageTitle}</h1><p>{screen==='Client Detail'?'Client ID: '+client.id:screen==='Case Detail'?'Application #: '+(current?.applicationNumber||'Not assigned'):'Internal case management workspace'}</p></div><div className="actions">{screen==='Client Detail'&&<><Button onClick={startProfile}>Edit Profile</Button><Button kind="primary" onClick={()=>show('New Enrollment')}>+ Start New Enrollment</Button></>}</div></header>}
{screen==='Home'&&<HomeDashboard clients={clients} onOpenClient={openClient} onOpenCase={openCase} onSearch={openSearchResults} onAddClient={()=>show('New Client')} onReady={()=>{if(switchView('Enroll Clients'))setQuery('')}} onExited={openExited} onEnrolled={()=>switchView('Enrolled Cases')} onFollowups={()=>switchView('Follow-ups')} onOpenFollowup={(r,id,index)=>openFollowup(index,r,id)} onOpenAppointment={(id,a)=>setAppointmentSelection({clientId:id,appointment:a})} onCalendar={()=>switchView('Calendar')} homeSettings={homeSettings} onCustomize={()=>switchView('Settings')}/>}
{['Enrolled Cases','Follow-ups','Exited Cases'].includes(screen)&&<CaseList mode={screen} clients={clients} onOpenFollowup={(r,id,index)=>openFollowup(index,r,id)} onOpenCase={openCase} onHome={()=>switchView('Home')}/>}

{screen==='Enroll Clients'&&<><Card title={'Ready for Enroll — Clients ('+ready.length+')'}>{ready.length?ready.map(c=><button key={c.id} className="ready-client-row" onClick={()=>openClient(c.id)}><span>{c.name}</span><span>›</span></button>):<p className="muted">No clients currently marked Ready for Enroll.</p>}</Card></>}

{screen==='Clients'&&<Card title={clientListFilter==='Exited'?'Exited Clients':'All Clients'}>{clients.filter(c=> (clientListFilter!=='Exited'||c.cases.some(r=>getStatus(r)==='Exited')) && (!query.trim()||(c.name+' '+c.id+' '+(c.phone||'')+' '+c.cases.map(r=>r.applicationNumber).join(' ')).toLowerCase().includes(query.toLowerCase()))).map(c=><div key={c.id} className="item" onClick={()=>openClient(c.id)}>{c.name} · {c.id}<span>Open →</span></div>)}</Card>}
{screen==='Calendar'&&<CalendarPage clients={clients} onNew={date=>setAppointmentSelection({date})} onOpen={(id,a)=>setAppointmentSelection({clientId:id,appointment:a})} onCase={openCase} onSchedule={(task,date)=>changeClient(task.clientId,c=>({...c,cases:c.cases.map(r=>r.id===task.record.id?{...r,taskSchedule:{...(r.taskSchedule||{}),[task.taskKey]:date}}:r)}))}/>}
{screen==='Settings'&&<HomepageSettings value={homeSettings} onChange={setHomeSettings} onGoHome={()=>switchView('Home')}/>}
{screen==='Documents'&&<><button className="client-button" onClick={()=>switchView('Client Detail')}>Back to client profile</button><ClientFiles key={client.id} fullPage client={client} onUpdate={nextClient=>{const next=clients.map(c=>c.id===nextClient.id?nextClient:c);localStorage.setItem(STORE,JSON.stringify(next));setClients(next)}}/></>}
{screen==='Client Detail'&&<ClientProfile key={client.id} client={client} editing={editing} profile={profile} onProfileChange={setProfile} onEdit={startProfile} onCancel={()=>setEditing(false)} onSave={()=>{
 if(!profile.name?.trim()){flash('Name is required');return;}
 changeClient(client.id,c=>({...c,name:profile.name,phone:profile.phone,email:profile.email,employment:profile.employment,status:profile.status,program:profile.program,address:profile.address||'',unit:profile.unit||'',city:profile.city||'',state:profile.state||'',zip:profile.zip||'',needs:profile.needs||''}));
 setEditing(false);flash('Profile saved locally');
}} onViewDocuments={()=>switchView('Documents')} onNewCase={()=>show('New Enrollment')} onOpenCase={record=>openCase(record)} onUpdateClient={nextClient=>{const next=clients.map(c=>c.id===nextClient.id?nextClient:c);localStorage.setItem(STORE,JSON.stringify(next));setClients(next)}} onAddVisit={()=>show('Visit Note')}
 onEditVisit={index=>{show('Visit Note');setFields({...client.visits[index],visitIndex:index})}}
 onDeleteVisit={index=>{if(window.confirm('Delete this visit note?'))changeClient(client.id,c=>({...c,visits:c.visits.filter((_,i)=>i!==index)}))}}
 onNewAppointment={()=>setAppointmentSelection({clientId:client.id})} onOpenAppointment={a=>setAppointmentSelection({clientId:client.id,appointment:a})}/>}

{screen==='Case Detail'&&current&&<><CaseSummary key={current.id} client={client} record={current} onChange={changeCase}/>
<details className="case-section"><summary>Enrollment Form</summary><Card title="Enrollment Form"><Button onClick={()=>switchView('Form Editor')}>Open / Edit Form</Button><span className="muted"> Form editing does not create an additional Case.</span></Card></details>
<details className="case-section"><summary>Case Attachments</summary><CaseAttachments key={current.id} client={client} record={current} onChange={changeCase}/></details>
<ActivityExit key={current.id} record={current} onChange={changeCase}/>
<FollowupRecords record={current} onOpen={index=>openFollowup(index)}/></>}
{screen==='Form Editor'&&current&&<FormSignatures key={current.id} client={client} record={current} onChange={changeCase} onManage={()=>openClient(client.id)}/>}
{screen==='Form Editor'&&current&&(current.form==='201'?<Original201Editor ref={formEditorRef} key={current.id} record={current} client={client} onDirtyChange={setFormDirty} onSave={next=>{changeCase(()=>next);flash(next.exportedAt?'Export saved':'201 Form draft saved')}}/>:<div className="editor"><Card title="Editable Fields"><Input label="Application Date" value={current.applicationDate} onChange={v=>changeCase(c=>({...c,applicationDate:v}))}/><Label text="Application Number" value={current.applicationNumber}/><Label text="Client" value={client.name}/>{current.fields?.prefillSource&&<p>Prefilled from {current.fields.prefillSource.form} · {current.fields.prefillSource.id}. Review and edit the copied answers below.</p>}{Object.entries(commonAnswerFields).map(([key,label])=><Input key={key} label={label} value={current.fields?.commonAnswers?.[key]||''} onChange={v=>changeCase(c=>({...c,fields:{...c.fields,commonAnswers:{...c.fields?.commonAnswers,[key]:v}}}))}/>)}<label className="choice"><input type="checkbox" checked={!!current.trainingRequired} onChange={e=>{const selected=e.target.checked;changeCase(c=>({...c,trainingRequired:selected}))}}/> Needs training supplement</label><p className="muted">These draft answers save locally. Full 999 field mapping and official export are pending the original PDF template.</p></Card><Card title="PDF Preview"><div className="pdf-placeholder"><b>999 Form</b><p>Actual PDF rendering and mapping will be connected in a later phase.</p></div></Card></div>)}
</main></div>
{modal&&<div className="backdrop" onClick={()=>setModal('')}><div className="dialog" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>{({ 'New Enrollment':'Start New Enrollment','Add Follow-up':'Record Follow-up','Client File':'Upload Client Document'})[modal]||modal}</h2><Button onClick={()=>setModal('')}>✕</Button></div>
{modal==='New Enrollment'&&<><p>Select the form type for a new independent Draft Case.</p><label className="choice"><input type="radio" checked={formChoice==='201'} onChange={()=>setFormChoice('201')}/> 201 — WIOA Adult</label><label className="choice"><input type="radio" checked={formChoice==='999'} onChange={()=>setFormChoice('999')}/> 999 — General Fund</label><Input label="Program (required)" value={fields.program} onChange={v=>setFields(f=>({...f,program:v}))} placeholder="e.g. NJC / IHSS, HCA, Hospitality"/><label className="input">Prefill from an existing Case<select value={fields.prefillSource??prefillSources(client.cases)[0]?.id??''} onChange={e=>setFields(f=>({...f,prefillSource:e.target.value}))}><option value="">Do not copy previous answers</option>{prefillSources(client.cases).map(c=><option key={c.id} value={c.id}>{c.form} · {c.applicationDate||c.createdAt?.slice(0,10)||'Undated'} · {c.applicationNumber||c.id}</option>)}</select></label><p>Copied answers are suggestions for CA review. Dates, signatures, application numbers and attachments are not copied. Cross-form prefill currently includes mapped common answers.</p>{formChoice==='999'&&<label className="choice"><input type="checkbox" checked={!!fields.trainingRequired} onChange={e=>setFields(f=>({...f,trainingRequired:e.target.checked}))}/> Needs training supplement</label>}<div className="right"><Button onClick={()=>setModal('')}>Cancel</Button><Button kind="primary" disabled={!fields.program?.trim()} onClick={createEnrollment}>Create Draft</Button></div></>}
{modal==='Case Summary'&&<><Input label="Application Date" value={fields.applicationDate} onChange={v=>setFields(x=>({...x,applicationDate:v}))}/><Input label="Application Number" value={fields.applicationNumber} onChange={v=>setFields(x=>({...x,applicationNumber:v}))}/><Input label="Enrollment Date" value={fields.enrollmentDate} onChange={v=>setFields(x=>({...x,enrollmentDate:v}))}/><Button kind="primary" onClick={()=>{changeCase(c=>({...c,...fields}));setModal('')}}>Save Changes</Button></>}
{modal==='New Client'&&<><Input label="Name (required)" value={fields.name} onChange={v=>setFields(f=>({...f,name:v}))}/><Input type="tel" label="Phone (required)" value={fields.phone} onChange={v=>setFields(f=>({...f,phone:v}))}/><Input type="date" label="Service Date" value={fields.date} onChange={v=>setFields(f=>({...f,date:v}))}/><label className="input"><span>First Service Comment (optional)</span><textarea rows="3" value={fields.notes||''} onChange={e=>setFields(f=>({...f,notes:e.target.value}))}/></label><div className="right"><Button onClick={()=>setModal('')}>Cancel</Button><Button kind="primary" onClick={()=>{if(!fields.name?.trim()||!fields.phone?.trim()||!fields.date){flash('Name, phone and service date are required');return;}if(!confirmLeave())return;const c={id:'CL-'+uid(),name:fields.name.trim(),phone:fields.phone.trim(),email:'',employment:'Unknown',status:'Job Searching',needs:'',intakeDate:fields.date,docs:[],appointments:[],visits:fields.notes?.trim()?[{date:fields.date,notes:fields.notes.trim()}]:[],cases:[]};setClients(arr=>[...arr,c]);setEditing(false);setModal('');setRouteHistory(history=>pushNavigationHistory(history,{screen,clientId,caseId}));setClientId(c.id);setScreen('Client Detail')}}>Create Client</Button></div></>}

</div></div>}
{followSelection&&followRecord&&<FollowupPanel key={followSelection.clientId+followSelection.caseId+followSelection.index} client={followClient} record={followRecord} index={followSelection.index} onClose={()=>setFollowSelection(null)} onChange={fn=>changeClient(followSelection.clientId,c=>({...c,cases:c.cases.map(r=>r.id===followSelection.caseId?fn(r):r)}))}/>}
{appointmentSelection&&<AppointmentPanel key={(appointmentSelection.appointment?.id||'new')+(appointmentSelection.clientId||'')} selection={appointmentSelection} clients={clients} onCreateClient={(name,phone)=>{const c={id:'CL-'+uid(),name,phone,email:'',employment:'Unknown',status:'Job Searching',needs:'',docs:[],appointments:[],visits:[],cases:[]};setClients(arr=>[...arr,c]);return c}} onClose={()=>setAppointmentSelection(null)} onSave={(draft)=>{changeClient(draft.clientId,c=>{const appointments=[...(c.appointments||[])];const index=appointments.findIndex(a=>a.id===draft.id);const entry={...(index>=0?appointments[index]:{}),id:draft.id||uid(),date:draft.date,time:draft.time,reason:draft.reason};if(index>=0)appointments[index]=entry;else appointments.push(entry);return {...c,appointments}});setAppointmentSelection(null);flash('Appointment saved')}} onDelete={(id,aid)=>{changeClient(id,c=>({...c,appointments:(c.appointments||[]).filter(a=>a.id!==aid)}));setAppointmentSelection(null);flash('Appointment deleted')}} onComplete={(id,aid,date,notes)=>{changeClient(id,c=>completeAppointment(c,aid,date,notes));setAppointmentSelection(null);flash('Appointment completed and service saved')}}/>}
{pendingLeave&&<div className="backdrop"><section className="dialog" role="dialog" aria-modal="true" aria-label="Unsaved form changes"><h2>Unsaved Form Changes</h2><p>Save your changes before leaving this form?</p><div className="action-line"><Button onClick={()=>setPendingLeave(null)}>Continue Editing</Button><Button onClick={()=>{formEditorRef.current?.discard();const run=pendingLeave.run;setPendingLeave(null);allowEditorLeave.current=true;run();allowEditorLeave.current=false}}>Discard Changes</Button><Button kind="primary" onClick={()=>{formEditorRef.current?.save();const run=pendingLeave.run;setPendingLeave(null);allowEditorLeave.current=true;run();allowEditorLeave.current=false}}>Save and Leave</Button></div></section></div>}
{message&&<div className="toast">{message}</div>}
</div>
}
export default App;
