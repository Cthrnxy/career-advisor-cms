import EvidenceOptions from './EvidenceOptions.jsx';
import React,{lazy,Suspense,useState} from 'react';
import {fileStore} from './fileStore.js';
import {changeDocuments,documentId,newestDocuments,validateFile} from './documentModel.js';
import {PRIMARY_DOCUMENTS,documentTitle,documentIcon,isPrimary} from './documentLabels.js';
import DocumentPreview from './DocumentPreview.jsx';
import './documents.css';
const SignatureEditor=lazy(()=>import('./SignatureEditor.jsx'));
const STAFF_STORE='career-advisor-demo-staff-signatures';
const OTHER='Other Documents';
export default function ClientFiles({client,onUpdate,onViewMore,fullPage=false}){
 const [staff,setStaff]=useState(()=>{try{return JSON.parse(localStorage.getItem(STAFF_STORE))||[]}catch{return []}});
 const [panel,setPanel]=useState(null),[preview,setPreview]=useState(null),[selected,setSelected]=useState(null);
 const [kind,setKind]=useState(OTHER),[title,setTitle]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [evidence,setEvidence]=useState({});
 const docs=client.docs||[];
 const open=(mode,file=null,shared=false)=>{setPreview(null);setPanel({mode,file,shared});setSelected(null);setKind(file?.kind||OTHER);setTitle(file?.title||documentTitle(file||{}));setError('');setEvidence(file?.evidence||{})};
 const close=()=>{if(!busy)setPanel(null)};
 const update=(next,oldFile,newFile,shared)=>{if(shared){localStorage.setItem(STAFF_STORE,JSON.stringify(next));setStaff(next)}else onUpdate(changeDocuments(client,next,oldFile,newFile))};
 const save=async(file=selected,category=kind,label='')=>{
  setError('');let key,committed=false;
  try{
   validateFile(file);
   const shared=category==='CA Signature'||panel.shared,collection=shared?staff:docs,old=panel.file;
   const index=old?collection.findIndex((d,i)=>documentId(d,i)===documentId(old,old.index)):-1;
   if(old&&index<0)throw new Error('The document changed. Reopen it and try again.');
   const chosenTitle=category.includes('Signature')?label:isPrimary(category)?'':title.trim();
   if(!category.includes('Signature')&&!isPrimary(category)&&!chosenTitle)throw new Error('Enter a document title.');
   if(old&&!window.confirm(`Replace “${documentTitle(old)}” with the selected file?`))return;
   setBusy(true);key=crypto.randomUUID();await fileStore('put',key,file);
   const entry={id:old?.id||crypto.randomUUID(),name:file.name,kind:category,title:chosenTitle,label,uploadedAt:new Date().toISOString(),size:file.size,mime:file.type,blobKey:key,evidence:structuredClone(evidence)};
   const next=[...collection];if(index>=0)next[index]=entry;else next.push(entry);
   update(next,old,entry,shared);committed=true;
   if(old?.blobKey)await fileStore('delete',old.blobKey).catch(()=>{});
   setPanel(null);
  }catch(e){if(key&&!committed)await fileStore('delete',key).catch(()=>{});setError(e.message)}finally{setBusy(false)}
 };
 const rename=(file,shared)=>{const clean=title.trim();if(!clean){setError('Enter a document title.');return}const collection=shared?staff:docs;const next=collection.map((d,i)=>documentId(d,i)===documentId(file,file.index)?{...d,title:clean,evidence:structuredClone(evidence)}:d);update(next,file,{...file,title:clean,evidence:structuredClone(evidence)},shared);setPanel(null)};
 const remove=async(file,shared)=>{const linked=!shared&&(client.cases||[]).some(r=>r.exit?.evidence===file.name||(r.followups||[]).some(f=>f.file===file.name));if(!window.confirm(`Delete “${documentTitle(file)}”?${linked?' Its case attachment links will be cleared.':''}`))return;try{const collection=shared?staff:docs;update(collection.filter((d,i)=>documentId(d,i)!==documentId(file,file.index)),file,null,shared);if(file.blobKey)await fileStore('delete',file.blobKey);setError('')}catch(e){setError(e.message)}};
 const download=async file=>{try{if(!file.blobKey)throw new Error('This older demo entry has no file content. Replace it first.');const blob=await fileStore('get',file.blobKey);if(!blob)throw new Error('File content is missing in this browser.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){setError(e.message)}};
 const row=(file,shared=false)=><div className="document-list-row" key={documentId(file,file.index)}><span className="document-list-icon" aria-hidden="true">{documentIcon(file)}</span><button className="document-list-title" onClick={()=>setPreview({file,shared})}>{documentTitle(file)}</button><time>{file.uploadedAt?new Date(file.uploadedAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'Date unavailable'}</time><div className="document-list-actions"><button className="client-button primary" onClick={()=>setPreview({file,shared})}>Preview</button><button className="document-icon-button" title="Download" aria-label={'Download '+documentTitle(file)} onClick={()=>download(file)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/></svg></button><button className="document-icon-button" title="Delete" aria-label={'Delete '+documentTitle(file)} onClick={()=>remove(file,shared)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg></button></div></div>;

 return <><div className={fullPage?"documents-full-page":"client-pair client-files-pair"}><section className="client-section"><div className="client-section-title"><div><h2>Documents on File</h2><p>Client documents, newest first</p></div><div className="document-heading-actions">{!fullPage&&<button className="client-text-button" onClick={onViewMore}>View more</button>}<button className="client-button" onClick={()=>open('upload')}>Upload document</button></div></div><div className="document-grid">{newestDocuments(docs).filter(d=>!d.kind.includes('Signature')).slice(0,fullPage?undefined:5).map(d=>row(d))}</div>{!docs.some(d=>!d.kind.includes('Signature'))&&<p className="client-empty">No documents uploaded.</p>}<p className="client-file-note">Demo files are saved in this browser only.</p></section><section className="client-section"><div className="client-section-title"><div><h2>Signatures</h2><p>Draw or extract a signature from an image or PDF</p></div><button className="client-button" onClick={()=>open('signature')}>Add signature</button></div>{['Client Signature','Employer Signature','CA Signature'].map(k=><div key={k}><h3 className="document-category">{k}{k==='CA Signature'?' · Shared':''}</h3><div className="document-grid">{newestDocuments(k==='CA Signature'?staff:docs).filter(d=>d.kind===k).map(d=>row(d,k==='CA Signature'))}</div>{!(k==='CA Signature'?staff:docs).some(d=>d.kind===k)&&<p className="client-empty">No signature saved.</p>}</div>)}</section></div>
 {error&&!panel&&<p className="document-error" role="alert">{error}</p>}
 {preview&&<DocumentPreview file={preview.file} onClose={()=>setPreview(null)} onReplace={()=>open('replace',preview.file,preview.shared)} onRename={()=>open('rename',preview.file,preview.shared)} canRename={true}/>}
 {panel&&<div className="document-overlay"><section className="document-preview" role="dialog" aria-modal="true" aria-label="Manage client files" onKeyDown={e=>{if(e.key==='Escape')close()}}><header><h2>{panel.mode==='signature'?'Add signature':panel.mode==='replace'?'Replace document':panel.mode==='rename'?'Edit title / evidence':'Upload document'}</h2><button autoFocus className="document-close" aria-label="Close file panel" title="Close" disabled={busy} onClick={close}>×</button></header>{error&&<p className="document-error" role="alert">{error}</p>}{panel.mode==='signature'||(panel.mode==='replace'&&panel.file.kind.includes('Signature'))?<Suspense fallback={<p>Loading signature editor…</p>}><SignatureEditor lockKind={panel.mode==='replace'} initialKind={panel.file?.kind||'Client Signature'} busy={busy} onCancel={close} onSave={save}/></Suspense>:<form className="document-form" onSubmit={e=>{e.preventDefault();if(panel.mode==='rename')rename(panel.file,panel.shared);else save()}}>{panel.mode!=='rename'&&panel.mode!=='replace'&&<label>Document name<select value={kind} onChange={e=>{setKind(e.target.value);setTitle('')}}>{[...PRIMARY_DOCUMENTS,OTHER].map(k=><option key={k}>{k}</option>)}</select></label>}{(panel.mode==='rename'||!isPrimary(kind))&&<label>Display title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Enter a title for this document"/></label>}{panel.mode!=='rename'&&<label>Choose one file<input required type="file" onChange={e=>{setSelected(e.target.files[0]||null);setError('')}}/></label>}<EvidenceOptions value={evidence} onChange={setEvidence}/><footer><button type="button" className="client-button" disabled={busy} onClick={close}>Cancel</button><button className="client-button primary" disabled={busy}>{busy?'Saving…':panel.mode==='rename'?'Save title':panel.mode==='replace'?'Replace':'Upload'}</button></footer></form>}</section></div>}</>;
}
