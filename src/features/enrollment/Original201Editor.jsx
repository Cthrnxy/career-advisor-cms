import React,{forwardRef,useEffect,useImperativeHandle,useMemo,useRef,useState} from 'react';
import {getDocument,GlobalWorkerOptions} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {schema,initialOriginalValues,automaticValues,updateOriginal,originalIssues,profileSnapshot,profileKeys,applyProfile} from './original201Model.js';
import {fillOriginal201} from './original201Pdf.js';
import {fileStore} from '../documents/fileStore.js';
import {buildCasePackage} from '../case/packageFiles.js';
import {recordSuccessfulExport} from '../case/enrollment.js';
import FloatingPanel from './FloatingPanel.jsx';
import './formEditor.css';
import './original201.css';
GlobalWorkerOptions.workerSrc=workerUrl;
function PdfPage({bytes,page,zoom}){
 const canvas=useRef(null);const [error,setError]=useState('');
 useEffect(()=>{if(!bytes)return;let cancelled=false,task,render;
 (async()=>{setError('');task=getDocument({data:bytes.slice()});const doc=await task.promise;if(cancelled)return;const pdfPage=await doc.getPage(page);const viewport=pdfPage.getViewport({scale:zoom});const node=canvas.current;if(!node)return;node.width=viewport.width;node.height=viewport.height;render=pdfPage.render({canvasContext:node.getContext('2d'),viewport});await render.promise})().catch(e=>{if(!cancelled)setError(e.message)});
 return()=>{cancelled=true;render?.cancel();task?.destroy()};
 },[bytes,page,zoom]);
 return error?<p role="alert">{error}</p>:<canvas ref={canvas} aria-label={`${schema.titles[page-1]} PDF preview`}/>;
}
const Original201Editor=forwardRef(function Original201Editor({record,client,onSave,onDirtyChange},ref){
 const initial=useRef(initialOriginalValues(record,client));
 const [draft,setDraft]=useState(initial.current),[reviewed,setReviewed]=useState(record.fields?.reviewed201||{}),[baseline,setBaseline]=useState(record.fields?.profile201||profileSnapshot(client));
 const saved=useRef(JSON.stringify({draft:initial.current,reviewed:record.fields?.reviewed201||{},baseline:record.fields?.profile201||profileSnapshot(client)}));
 const [page,setPage]=useState(()=>Math.max(1,Math.min(12,Number(localStorage.getItem('case-page-'+record.id))||1)));
 const [collapsed,setCollapsed]=useState(false),[checking,setChecking]=useState(false),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[bytes,setBytes]=useState(null),[zoom,setZoom]=useState(1),[floating,setFloating]=useState(false),[profileOpen,setProfileOpen]=useState(false),[selectedUpdates,setSelectedUpdates]=useState([]);
 const dirty=JSON.stringify({draft,reviewed,baseline})!==saved.current;
 const values=useMemo(()=>automaticValues(draft,record),[draft,record.attachments,record.applicationNumber]);
 const issues=useMemo(()=>originalIssues(values,record,reviewed),[values,record.signatureFiles,record.attachments,reviewed]);
 const incoming=profileSnapshot(client),changedProfile=Object.keys(profileKeys).filter(key=>incoming[key]!==baseline[key]);
 const signatureVersion=JSON.stringify(record.signatureFiles||{}),evidenceVersion=JSON.stringify(record.attachments||[]);
 const lastVersion=useRef(signatureVersion+evidenceVersion);
 useEffect(()=>{if(lastVersion.current!==signatureVersion+evidenceVersion){setReviewed({});lastVersion.current=signatureVersion+evidenceVersion}},[signatureVersion,evidenceVersion]);
 useEffect(()=>{onDirtyChange?.(dirty)},[dirty,onDirtyChange]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 useEffect(()=>{let current=true;const timer=setTimeout(()=>{fillOriginal201(values,record).then(data=>{if(current)setBytes(data)}).catch(e=>{if(current)setNotice('PDF preview: '+e.message)})},350);return()=>{current=false;clearTimeout(timer)}},[values,signatureVersion]);
 const save=()=>{const fields={...record.fields,original201:draft,reviewed201:reviewed,profile201:baseline};onSave({...record,fields,applicationDate:draft.p3w5||record.applicationDate||''});saved.current=JSON.stringify({draft,reviewed,baseline});onDirtyChange?.(false);setNotice('Draft saved.');};
 useImperativeHandle(ref,()=>({isDirty:()=>dirty,save,discard:()=>{const old=JSON.parse(saved.current);setDraft(old.draft);setReviewed(old.reviewed);setBaseline(old.baseline);onDirtyChange?.(false)}}));
 const go=number=>{setPage(number);localStorage.setItem('case-page-'+record.id,String(number))};
 const setValue=(field,value)=>{setDraft(v=>updateOriginal(v,field,value));setReviewed({});};
 const jump=issue=>{go(issue.page);setTimeout(()=>document.getElementById('original-'+issue.key)?.focus(),0)};
 const exportPacket=async()=>{
  setChecking(true);if(issues.length){setNotice('Resolve the listed items before exporting.');return}if(busy)return;setBusy(true);let artifactId;
  try{const pdfBytes=await fillOriginal201(values,record);const pdf=new Blob([pdfBytes],{type:'application/pdf'});const packet=await buildCasePackage(record,fileStore,pdf);artifactId=crypto.randomUUID();await fileStore('put',artifactId,packet);
   const next=recordSuccessfulExport({...record,fields:{...record.fields,original201:draft,reviewed201:reviewed,profile201:baseline},applicationDate:draft.p3w5||record.applicationDate||''},{artifactId,completed:true,official:true});
   const url=URL.createObjectURL(packet),link=document.createElement('a');link.href=url;link.download=`201-${record.id}-enrollment.tar`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   onSave(next);saved.current=JSON.stringify({draft,reviewed,baseline});onDirtyChange?.(false);setNotice('Export package created and saved. Case is In Process until an Application Number is added.');
  }catch(e){if(artifactId)await fileStore('delete',artifactId).catch(()=>{});setNotice('Export failed: '+e.message)}finally{setBusy(false)}
 };
 const pageFields=schema.fields.filter(f=>f.page===page);const sections=[...new Set(pageFields.map(f=>f.section))];
 const isAuto=field=>(field.page===1&&/^I[ABC] /.test(field.name))||['p1w2','p1w3','p3w2','p3w3','p3w4','p8w1','p8w2','p8w3','p3w6','p8w5'].includes(field.key);
 const fieldView=field=>{const finding=checking?issues.find(x=>x.key===field.key):null;const id='original-'+field.key;
  if(field.type==='Signature')return <div className="original-field" key={field.key}><label><input id={id} type="checkbox" checked={!!values['apply-'+field.key]} disabled={field.role==='external'||!record.signatureFiles?.[field.role]} onChange={e=>{setDraft(v=>({...v,['apply-'+field.key]:e.target.checked}));setReviewed({})}}/> Apply saved {field.role==='external'?'external signer':field.role} here</label><small>{field.label}{field.role==='external'?' · Remains editable for the external signer.':''}</small></div>;
  const button=['CheckBox','RadioButton'].includes(field.type);
  return <label className={'original-field'+(button?' original-option':'')+(finding?' has-issue':'')} key={field.key} htmlFor={id}>{button?<><input id={id} type="checkbox" checked={!!values[field.key]} disabled={isAuto(field)} onChange={e=>setValue(field,e.target.checked)}/><span>{field.label}</span></>:<><span>{field.label}</span><input id={id} value={values[field.key]||''} disabled={isAuto(field)} onChange={e=>setValue(field,e.target.value)} placeholder={Object.values(schema.signingDates).includes(field.key)?'MM/DD/YYYY':''}/></>}{finding&&<small className="ef-field-error">{finding.message}</small>}</label>
 };
 const preview=<div className="original-preview"><div className="ef-heading-actions"><button className="ef-btn" onClick={()=>setZoom(z=>Math.max(.5,z-.1))}>−</button><span>{Math.round(zoom*100)}%</span><button className="ef-btn" onClick={()=>setZoom(z=>Math.min(2,z+.1))}>+</button>{!floating&&<button className="ef-btn" onClick={()=>setFloating(true)}>Pop Out Preview</button>}</div>{bytes?<PdfPage bytes={bytes} page={page} zoom={zoom}/>:<p>Loading actual PDF preview…</p>}</div>;
 return <div className="ef-app original-app"><div className="ef-toolbar"><h2>201 Master Application</h2><div className="ef-toolbar-actions"><span>{dirty?'Unsaved changes':'Saved draft'}</span><button className="ef-btn" disabled={busy} onClick={save}>Save Draft</button><button className="ef-btn" onClick={()=>setChecking(v=>!v)}>{checking?'Cancel Check':'Check Form'}</button><button className="ef-btn ef-btn-primary" disabled={busy} onClick={exportPacket}>{busy?'Exporting…':'Export for Enroll'}</button></div></div>
 {changedProfile.length>0&&<div className="original-banner">Profile information has changed. Your form has not been overwritten. <button className="ef-btn" onClick={()=>{setSelectedUpdates(changedProfile);setProfileOpen(true)}}>Review changes</button></div>}
 {notice&&<p className="original-banner" role="status">{notice}</p>}
 {checking&&<section className="original-check" aria-label="Form issues"><h3>{issues.length?`${issues.length} items to review`:'Ready to export'}</h3>{issues.map((item,i)=><button key={item.key+i} className="ef-review-issue" onClick={()=>jump(item)}><span>{schema.titles[item.page-1]}</span><strong>{item.message}</strong></button>)}</section>}
 <div className={'original-layout'+(collapsed?' collapsed':'')}><aside className="ef-rail"><button className="ef-btn" onClick={()=>setCollapsed(v=>!v)}>{collapsed?'Expand contents':'Collapse contents'}</button>{!collapsed&&schema.titles.map((title,i)=><button className={'ef-page'+(page===i+1?' selected':'')} key={title} onClick={()=>go(i+1)}>{title}{reviewed[i+1]?' ✓':''}</button>)}</aside><section className="original-fields"><h3>{schema.titles[page-1]}</h3>{page===1&&<p>Evidence is selected automatically from Case attachments. Add or reclassify documents in Case Attachments.</p>}{page===9&&<p>Read the participant rights in the PDF preview before marking this section reviewed.</p>}{sections.map(section=><fieldset key={section}><legend>{section}</legend>{pageFields.filter(f=>f.section===section).map(fieldView)}</fieldset>)}<label className="original-reviewed"><input id={'original-review-'+page} type="checkbox" checked={!!reviewed[page]} onChange={e=>setReviewed(r=>({...r,[page]:e.target.checked}))}/> I reviewed this section and completed all applicable fields.</label><div className="ef-heading-actions"><button className="ef-btn" disabled={page===1} onClick={()=>go(page-1)}>Previous</button><button className="ef-btn" disabled={page===12} onClick={()=>go(page+1)}>Next</button></div></section>{floating?<button className="ef-btn" onClick={()=>setFloating(false)}>Dock Preview</button>:preview}</div>
 {floating&&<FloatingPanel kind="preview" title={schema.titles[page-1]} active onBringToFront={()=>{}} onDock={()=>setFloating(false)}>{preview}</FloatingPanel>}
 {profileOpen&&<div className="backdrop"><section className="dialog" role="dialog" aria-modal="true" aria-label="Review Profile changes"><h2>Review Profile Changes</h2><p>Select only the fields you want to update.</p>{changedProfile.map(key=><label className="original-profile-diff" key={key}><input type="checkbox" checked={selectedUpdates.includes(key)} onChange={e=>setSelectedUpdates(v=>e.target.checked?[...v,key]:v.filter(k=>k!==key))}/><strong>{key}</strong><span>Form: {draft[profileKeys[key][0]]||'—'}</span><span>Profile: {incoming[key]||'—'}</span></label>)}<button className="ef-btn" onClick={()=>setProfileOpen(false)}>Cancel</button><button className="ef-btn" onClick={()=>{setBaseline(incoming);setProfileOpen(false)}}>Keep form values</button><button className="ef-btn ef-btn-primary" onClick={()=>{setDraft(v=>applyProfile(v,incoming,selectedUpdates));setBaseline(incoming);setReviewed({});setProfileOpen(false)}}>Update selected fields</button></section></div>}
 <p className="ef-disclaimer">PY 2026–27 form · IEP uses the original form; upload it in Case Attachments · Export creates the 12-page PDF and independent Case attachments; it does not submit to WFC.</p></div>
});
export default Original201Editor;
