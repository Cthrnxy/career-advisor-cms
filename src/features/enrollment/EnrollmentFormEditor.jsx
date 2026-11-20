import React, {useMemo, useState} from 'react';
import {EDITOR_PAGES, MAPPED_PAGES, LIST_A, LIST_B, LIST_C, SELECTIVE_REGISTERED, SELECTIVE_EXEMPT, ELIGIBILITY_OPTIONS, enrollmentIssues} from './formEditorRules.js';
import './formEditor.css';

const blankOption = {value:'', label:'Choose an option…'};
function initialValues(record, client) {
  const bits = (client.name || '').trim().split(/\s+/);
  return {
    firstName: bits[0] || '', lastName: bits.slice(1).join(' ') || '',
    phone: client.phone || '', email: client.email || '',
    applicationDate: record.applicationDate || '', applicationNumber: record.applicationNumber || '',
    agency: 'SHE', ...((record.fields || {}).enrollmentEditor || {})
  };
}
function Field({id, label, value, onChange, type='text', placeholder='', help, issue, onFocus}) {
  return <label className={'ef-field'+(issue?' has-issue':'')} htmlFor={'ef-'+id}>
    <span className="ef-label">{label}</span>
    <input id={'ef-'+id} type={type} value={value || ''} placeholder={placeholder} onFocus={onFocus}
      onChange={e=>onChange(e.target.value)} aria-invalid={!!issue}/>
    {help&&<small>{help}</small>}
    {issue&&<span className="ef-field-error">{issue.message}</span>}
  </label>;
}
function Choice({id,label,value,options,onChange,issue,onFocus}) {
  return <label className={'ef-field'+(issue?' has-issue':'')} htmlFor={'ef-'+id}>
    <span className="ef-label">{label}</span>
    <select id={'ef-'+id} value={value || ''} onFocus={onFocus} onChange={e=>onChange(e.target.value)} aria-invalid={!!issue}>
      <option value="">Choose an option…</option>
      {options.map(item=>typeof item==='string'?<option value={item} key={item}>{item}</option>:<option value={item.value} key={item.value}>{item.label}</option>)}
    </select>
    {issue&&<span className="ef-field-error">{issue.message}</span>}
  </label>;
}
function MiniTick({checked,children}) {
  return <div className="ef-preview-tick"><span className={'ef-tick'+(checked?' on':'')}>{checked?'✓':''}</span><span>{children}</span></div>;
}
function PaperPreview({page,values,focus}) {
  return <div className="ef-paper" aria-label={'Form layout reference for page '+page}>
    <div className="ef-paper-mast"><strong>SAN FRANCISCO</strong><span>City and County of San Francisco<br/>Office of Economic and Workforce Development</span></div>
    {page===1?<><h3>OEWD WIOA Title I Adult and Dislocated Worker Eligibility Checklist</h3>
      <div className="ef-paper-sub">Participant name: {values.firstName} {values.lastName} · Adult</div>
      <section className={'ef-paper-box'+(focus==='work'?' highlighted':'')}>
        <h4>I. US WORK AUTHORIZATION</h4>
        <div className="ef-paper-columns">
          <div><strong>List A</strong><small>Identity AND Employment Authorization</small>
          {LIST_A.slice(0,4).map(item=><MiniTick key={item} checked={values.listA===item}>{item}</MiniTick>)}</div>
          <div><strong>List B</strong><small>Identity</small>
          {LIST_B.slice(0,4).map(item=><MiniTick key={item} checked={values.listB===item}>{item}</MiniTick>)}</div>
          <div><strong>List C</strong><small>Employment Authorization</small>
          {LIST_C.slice(0,4).map(item=><MiniTick key={item} checked={values.listC===item}>{item}</MiniTick>)}</div>
        </div>
      </section>
      <section className={'ef-paper-box'+(focus==='selective'?' highlighted':'')}>
        <h4>II. SELECTIVE SERVICE REGISTRATION</h4>
        <div className="ef-paper-columns two">
          <div><strong>Required to register</strong>{SELECTIVE_REGISTERED.slice(0,4).map(item=><MiniTick key={item} checked={values.selectiveEvidence===item}>{item}</MiniTick>)}</div>
          <div><strong>Exempt</strong>{SELECTIVE_EXEMPT.slice(0,4).map(item=><MiniTick key={item} checked={values.selectiveEvidence===item}>{item}</MiniTick>)}</div>
        </div>
      </section></>
    :page===2?<><h3>Eligibility Checklist · Page 2</h3>
      <section className="ef-paper-box"><h4>III. ADULT ELIGIBILITY</h4>
      <div className="ef-paper-columns two">{ELIGIBILITY_OPTIONS.map(([v,label])=><div key={v}><MiniTick checked={values.adultEligibility===v}>{label}</MiniTick><div className="ef-paper-lines">________________________________</div></div>)}</div></section>
      <section className="ef-paper-box"><h4>IV. DISLOCATED WORKER ELIGIBILITY</h4><p>Not applicable to this 201 WIOA Adult design example.</p></section></>
    :page===3?<><h3>OEWD WIOA Master Application</h3><div className="ef-paper-sub">Agency: {values.agency} · Application Date: {values.applicationDate||'________'} · App #: {values.applicationNumber||'________'}</div>
      <section className="ef-paper-box"><h4>CONTACT INFORMATION</h4>
      <div className="ef-paper-form"><span>First Name: <b>{values.firstName||'_______'}</b></span><span>Last Name: <b>{values.lastName||'_______'}</b></span><span>Phone: <b>{values.phone||'_______'}</b></span><span>Email: <b>{values.email||'_______'}</b></span><span>Street: <b>{values.address||'_______'}</b></span><span>City: <b>{values.city||'_______'}</b></span></div></section>
      <section className="ef-paper-box"><h4>DEMOGRAPHIC INFORMATION</h4><p>Questions 24–35 · Citizenship, race and other demographic answers</p></section></>
    :page===4?<><h3>OEWD WIOA Master Application · Page 2 of 5</h3>
      <section className="ef-paper-box"><h4>LANGUAGE</h4><p>36. Primarily speak a language other than English? <b>{values.otherLanguage||'____'}</b></p><p>37. Language: <b>{values.language||'__________'}</b></p></section>
      <section className="ef-paper-box"><h4>FARMWORKER / VETERAN INFORMATION</h4><p>Farmworker: {values.farmworker||'__________'}</p><p>Veteran: {values.veteran||'__________'}</p></section>
      <section className="ef-paper-box"><h4>EMPLOYMENT INFORMATION</h4><p>62. Employment status: {values.employment||'__________'}</p><p>63. Weeks unemployed: {values.unemployedWeeks||'__________'}</p><p>64. Unemployed for 27+ weeks: {values.unemployedWeeks?(Number(values.unemployedWeeks)>=27?'Yes':'No'):'____'}</p></section></>
    :<><h3>{EDITOR_PAGES[page-1]}</h3><section className="ef-paper-box ef-paper-unmapped"><h4>Original PDF · Page {page} of 14</h4><p>This page's exact questions and PDF fields are awaiting mapping.</p><p>No data or completion status is inferred for this page.</p></section></>}
    <footer className="ef-paper-foot"><span>OEWD WIOA · layout reference</span><span>Source PDF page {page} / 14</span></footer>
  </div>;
}
export default function EnrollmentFormEditor({record, client, onChange, onSave}) {
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState({});
  const [showPreview, setShowPreview] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [focus, setFocus] = useState('');
  const values = initialValues(record,client);
  const issueByPage = useMemo(()=>Object.fromEntries(
    Array.from({length:MAPPED_PAGES},(_,i)=>[i+1,enrollmentIssues(values,i+1)])
  ),[record.fields,record.applicationDate,record.applicationNumber,client.name,client.phone,client.email]);
  const issues = (issueByPage[page] || []);
  const visibleIssues = checked[page] ? issues : [];
  const issue = key => visibleIssues.find(item=>item.key===key);
  const update = (key,value) => onChange({...values,[key]:value});
  const goPage = number => {setPage(Math.max(1,Math.min(12,number)));setFocus('');};
  const checkPage = () => setChecked(prev=>({...prev,[page]:true}));
  const reviewAll = () => {setChecked(Object.fromEntries([1,2,3,4].map(n=>[n,true])));setShowReview(true)};
  const allIssues = Object.values(issueByPage).flat();
  const completed = [1,2,3,4].filter(n=>checked[n] && issueByPage[n].length===0).length;
  const selectOptions = (id,label,items,focusGroup) => <Choice id={id} label={label} value={values[id]} options={items} issue={issue(id)} onFocus={()=>setFocus(focusGroup||id)} onChange={v=>update(id,v)}/>;
  const input = (id,label,extra={}) => <Field id={id} label={label} value={values[id]} onChange={v=>update(id,v)} issue={issue(id)} onFocus={()=>setFocus(id)} {...extra}/>;
  return <div className="ef-app">
    <div className="ef-toolbar">
      <div><span className="ef-overline">ENROLLMENT / 201 · WIOA ADULT</span><h2>201 Master Application</h2><p>Complete the form in CMS · compare with the original page order</p></div>
      <div className="ef-toolbar-actions"><span className="ef-autosave">● Browser draft</span><button className="ef-btn" onClick={()=>setShowPreview(v=>!v)}>{showPreview?'Hide preview':'Show preview'}</button><button className="ef-btn ef-btn-primary" onClick={onSave}>Save Draft</button></div>
    </div>
    <div className="ef-statusline">
      <div><strong>{completed} of 4</strong> mapped pages checked <span>· Pages 5–12 awaiting mapping</span></div>
      <div className="ef-status-actions"><button onClick={reviewAll}>Review All {allIssues.length>0?'· '+allIssues.length+' items':''}</button></div>
    </div>
    <div className="ef-layout">
      <aside className="ef-rail">
        <div className="ef-rail-head">FORM PAGES <span>1–12 of 14</span></div>
        {EDITOR_PAGES.map((label,i)=>{const number=i+1;const mapped=number<=MAPPED_PAGES;const didCheck=checked[number];const count=issueByPage[number]?.length||0;return <button type="button" key={number} className={'ef-page'+(page===number?' selected':'')} onClick={()=>goPage(number)} aria-current={page===number?'page':undefined}>
          <span className="ef-page-number">{String(number).padStart(2,'0')}</span><span className="ef-page-copy"><strong>{label}</strong><small>{!mapped?'Mapping pending':didCheck?(count?count+' to review':'Checked · clear'):'Not checked'}</small></span>
          {mapped&&didCheck&&<span className={'ef-page-dot'+(count?' warn':' done')}/>}
        </button>})}
        <div className="ef-iepside"><strong>IEP · original pages 13–14</strong><small>Handled as an uploaded Case document. Not part of this web form.</small></div>
      </aside>
      <section className="ef-editor">
        <div className="ef-section-head"><div><span className="ef-overline">PAGE {page} OF 12 · SOURCE PDF {page} OF 14</span><h3>{EDITOR_PAGES[page-1]}</h3><p>Follow the original form order. Save and revisit any page.</p></div><span className={'ef-page-state'+(page>MAPPED_PAGES?' muted':checked[page]&&issues.length?' warning':'')}>{page>MAPPED_PAGES?'Mapping pending':checked[page]?(issues.length?issues.length+' issues':'Checked · clear'):'Not checked'}</span></div>
        {page===1&&<div className="ef-question-groups">
          <section className="ef-question-block"><div className="ef-question-heading"><span>I</span><div><h4>US Work Authorization</h4><p>Original List A OR List B + List C. Select the evidence being used.</p></div></div>
            <div className="ef-route-cards"><label className={values.workRoute==='A'?'active':''}><input type="radio" name="ef-work" checked={values.workRoute==='A'} onChange={()=>{onChange({...values,workRoute:'A',listB:'',listC:''});setFocus('work')}}/><strong>List A</strong><small>Identity + work authorization</small></label><label className={values.workRoute==='BC'?'active':''}><input type="radio" name="ef-work" checked={values.workRoute==='BC'} onChange={()=>{onChange({...values,workRoute:'BC',listA:''});setFocus('work')}}/><strong>List B + List C</strong><small>Two-document combination</small></label></div>
            {issue('workRoute')&&<p className="ef-inline-issue">{issue('workRoute').message}</p>}
            {values.workRoute==='A'&&<div className="ef-subfields">{selectOptions('listA','List A document',LIST_A,'work')}<p className="ef-context-note">List B and List C are not required on this route.</p></div>}
            {values.workRoute==='BC'&&<div className="ef-subfields">{selectOptions('listB','List B · identity',LIST_B,'work')}{selectOptions('listC','List C · authorization',LIST_C,'work')}</div>}
          </section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>II</span><div><h4>Selective Service Registration</h4><p>Choose registration evidence or an exemption from the original checklist.</p></div></div>
            <div className="ef-route-cards"><label className={values.selectiveRoute==='registered'?'active':''}><input type="radio" name="ef-ss" checked={values.selectiveRoute==='registered'} onChange={()=>{onChange({...values,selectiveRoute:'registered',selectiveEvidence:''});setFocus('selective')}}/><strong>Required to register</strong></label><label className={values.selectiveRoute==='exempt'?'active':''}><input type="radio" name="ef-ss" checked={values.selectiveRoute==='exempt'} onChange={()=>{onChange({...values,selectiveRoute:'exempt',selectiveEvidence:''});setFocus('selective')}}/><strong>Exempt</strong></label></div>
            {issue('selectiveRoute')&&<p className="ef-inline-issue">{issue('selectiveRoute').message}</p>}
            {values.selectiveRoute&&<div className="ef-subfields">{selectOptions('selectiveEvidence',values.selectiveRoute==='exempt'?'Exemption reason':'Registration evidence',values.selectiveRoute==='exempt'?SELECTIVE_EXEMPT:SELECTIVE_REGISTERED,'selective')}</div>}
          </section>
        </div>}
        {page===2&&<div className="ef-question-groups"><section className="ef-question-block"><div className="ef-question-heading"><span>III</span><div><h4>Adult Eligibility</h4><p>Choose ONE option from the WIOA Adult Priority of Service checklist.</p></div></div>
          <div className="ef-eligibility-list">{ELIGIBILITY_OPTIONS.map(([key,label])=><label key={key} className={values.adultEligibility===key?'active':''}><input name="ef-eligibility" type="radio" checked={values.adultEligibility===key} onChange={()=>update('adultEligibility',key)}/>{label}</label>)}</div>
          {issue('adultEligibility')&&<p className="ef-inline-issue">{issue('adultEligibility').message}</p>}
          {values.adultEligibility==='income'&&<div className="ef-subfields ef-two-fields">{input('familySize','Family Size',{type:'number',placeholder:'e.g. 1'})}{input('annualIncome','Annual Family Income',{type:'number',placeholder:'e.g. 25000'})}</div>}
          {values.adultEligibility==='benefits'&&<div className="ef-subfields">{selectOptions('publicBenefit','Public Benefit',['SNAP / CalFresh','TANF / CalWORKS','SSI','Other income-based public benefit'])}</div>}
          </section><section className="ef-question-block ef-muted-block"><div className="ef-question-heading"><span>IV</span><div><h4>Dislocated Worker Eligibility</h4><p>This case is 201 WIOA Adult. The separate Dislocated Worker category is not assessed in this prototype.</p></div></div></section></div>}
        {page===3&&<div className="ef-question-groups"><section className="ef-question-block"><div className="ef-question-heading"><span>01</span><div><h4>Application Details</h4><p>Source: OEWD WIOA Master Application · PDF page 3.</p></div></div>
          <div className="ef-form-grid">{input('agency','Agency')}{input('applicationDate','Application Date',{type:'date',help:'Date all documents have been collected and eligibility determined.'})}{input('applicationNumber','Application Number',{help:'May remain blank until OEWD approval.'})}</div></section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>02</span><div><h4>Contact Information</h4><p>Client Profile values are prefilled when available. Changes here belong to this Case draft.</p></div></div>
          <div className="ef-form-grid">{input('firstName','1 · First Name')}{input('lastName','3 · Last Name')}{input('phone','13 · Phone Number')}{input('email','16 · Email',{type:'email'})}{input('address','5 · Residential Address')}{input('city','7 · City')}{input('state','8 · State')}{input('zip','9 · ZIP Code')}{input('county','10 · County')}</div></section>
          <section className="ef-question-block ef-muted-block"><h4>Demographic Information · Questions 24–35</h4><p>These fields are identified in the source PDF. Full demographic controls will be mapped in a later prototype update.</p></section>
        </div>}
        {page===4&&<div className="ef-question-groups"><section className="ef-question-block"><div className="ef-question-heading"><span>36</span><div><h4>Language Information</h4><p>Corresponds to Questions 36–37 on the original application.</p></div></div>{selectOptions('otherLanguage','36 · Primarily speak a language other than English?',['Yes','No'])}{values.otherLanguage==='Yes'&&input('language','37 · Primary Language',{placeholder:'e.g. Chinese'})}</section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>39</span><div><h4>Farmworker & Veteran</h4><p>Questions 39–61. Relevant additional questions will be mapped later.</p></div></div>{selectOptions('farmworker','39 · Farmworker Status',['No','Farmworker','Migrant','Migrant Farmworker'])}{selectOptions('veteran','43 · Veteran Status',['No','Yes · 180 days or less','Yes · Eligible Veteran','Yes · Other Eligible Person'])}</section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>62</span><div><h4>Employment</h4><p>Questions 62–66. Unemployment duration drives Question 64.</p></div></div>{selectOptions('employment','62 · Employment Status',['Employed','Not Employed','Employed · Notice of Termination'])}{input('unemployedWeeks','63 · Weeks Unemployed',{type:'number',placeholder:'Enter actual weeks'})}{values.unemployedWeeks&&<p className="ef-context-note">64 · 27 or more weeks: <strong>{Number(values.unemployedWeeks)>=27?'Yes':'No'}</strong> (calculated from Question 63)</p>}</section>
        </div>}
        {page>MAPPED_PAGES&&<div className="ef-unmapped"><span>◇</span><h4>{EDITOR_PAGES[page-1]}</h4><p>This source page is included in navigation but its detailed fields have not been mapped yet. It will not be counted as complete or incorrectly marked as missing.</p><p className="ef-context-note">Prototype coverage: source PDF pages 1–4. IEP source pages 13–14 will be uploaded as Case documents.</p></div>}
        {checked[page]&&page<=MAPPED_PAGES&&<div className={'ef-check-results'+(issues.length?' has-issues':'')}><h4>{issues.length?issues.length+' items to review':'No detected issues on this mapped page'}</h4>{issues.length?issues.map((i,n)=><p key={i.key+n}><strong>{i.label}:</strong> {i.message}</p>):<p>Only prototype checks were run. This is not an eligibility approval.</p>}</div>}
        <div className="ef-bottom"><button className="ef-btn" disabled={page===1} onClick={()=>goPage(page-1)}>← Previous</button><div><button className="ef-btn" disabled={page>MAPPED_PAGES} onClick={checkPage}>Check Page</button><button className="ef-btn ef-btn-primary" disabled={page===12} onClick={()=>goPage(page+1)}>Next Page →</button></div></div>
      </section>
      {showPreview&&<aside className="ef-preview-pane"><div className="ef-preview-top"><div><strong>Form reference</strong><small>Original page order · live layout comparison</small></div><span>PDF p. {page}/14</span></div>
        <div className="ef-preview-scroll"><PaperPreview page={page} values={values} focus={focus}/></div>
        <div className="ef-preview-foot">Layout recreation for review only. This is <strong>not</strong> the actual generated OEWD PDF.</div>
      </aside>}
    </div>
    {showReview&&<div role="dialog" aria-modal="true" aria-labelledby="ef-review-title" className="ef-review-backdrop" onClick={()=>setShowReview(false)}><div className="ef-review-dialog" onClick={e=>e.stopPropagation()}><div className="ef-review-header"><div><span className="ef-overline">201 · REVIEW ALL</span><h3 id="ef-review-title">Issues & form coverage</h3></div><button className="ef-btn" onClick={()=>setShowReview(false)}>Close ✕</button></div>
      <p className="ef-review-info">{allIssues.length} issues on the first four mapped pages. Pages 5–12 remain to be implemented; no full-form completion claim is made.</p>
      {allIssues.length?allIssues.map((i,n)=><button key={i.page+'-'+i.key+'-'+n} className="ef-review-issue" onClick={()=>{goPage(i.page);setShowReview(false)}}><span>Page {i.page}</span><strong>{i.label}</strong><small>{i.message}</small><b>↗</b></button>):<p>No issues detected on mapped pages. This does not mean the entire original PDF is complete.</p>}
      <div className="ef-review-pending"><strong>Awaiting field mapping</strong><p>Pages 5–12 · Master Application, Section 188, rights and releases</p><p>IEP · uploaded separately as a Case document</p></div>
    </div></div>}
    <p className="ef-disclaimer">Synthetic-data browser prototype only · drafts are stored locally in this browser · no government submission or actual PDF export.</p>
  </div>;
}
