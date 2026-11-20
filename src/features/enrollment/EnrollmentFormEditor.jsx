import React, {useMemo, useState} from 'react';
import {EDITOR_PAGES, MAPPED_PAGES, LIST_A, LIST_B, LIST_C, SELECTIVE_REGISTERED, SELECTIVE_EXEMPT, ELIGIBILITY_OPTIONS, UC_STATUS, LAYOFF_CATEGORY, isDwGeneral, isDwSpecial, enrollmentIssues} from './formEditorRules.js';
import './formEditor.css';
import {buildEnrollmentReviewHtml} from './exportReviewHtml.js';
import FloatingPanel from './FloatingPanel.jsx';

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
    :page===5?<><h3>OEWD WIOA Master Application · Page 3 of 5</h3>
      <section className="ef-paper-box"><h4>67 · UNEMPLOYMENT COMPENSATION</h4>
        {UC_STATUS.map(([value,label])=><MiniTick key={value} checked={values.ucStatus===value}>{label}</MiniTick>)}</section>
      <section className="ef-paper-box"><h4>68 · REASON FOR LAYOFF</h4>
        {LAYOFF_CATEGORY.map(([value,label])=><MiniTick key={value} checked={values.layoffCategory===value}>{label}</MiniTick>)}</section>
      {isDwGeneral(values)&&<section className="ef-paper-box"><h4>69–90 · DISLOCATED WORKER DETAILS</h4>
        <p>69 UI referral: {values.uiReferral||'____'} · 70 Exempt from work search: {values.workSearchExempt||'____'}</p>
        <p>73 Layoff notice: {values.terminationNotice||'____'} · 76 Rapid Response: {values.rapidResponse||'____'}</p>
        <p>79 Employer: {values.dislocationEmployer||'________'} · 90 Declining occupation: {values.decliningOccupation||'____'}</p></section>}
      {isDwSpecial(values)&&<section className="ef-paper-box"><h4>73 · TERMINATION OR LAYOFF NOTICE</h4><p>{values.terminationNotice||'____'}</p></section>}
      {values.layoffCategory==='none'&&<section className="ef-paper-box"><h4>69–90 · NOT APPLICABLE</h4><p>Skipped according to the selected answer to Question 68.</p></section>}</>
    :<><h3>{EDITOR_PAGES[page-1]}</h3><section className="ef-paper-box ef-paper-unmapped"><h4>Original PDF · Page {page} of 14</h4><p>This page's exact questions and PDF fields are awaiting mapping.</p><p>No data or completion status is inferred for this page.</p></section></>}
    <footer className="ef-paper-foot"><span>OEWD WIOA · layout reference</span><span>Source PDF page {page} / 14</span></footer>
  </div>;
}
export default function EnrollmentFormEditor({record, client, onChange, onSave}) {
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState({});
  const [showPreview, setShowPreview] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(100);
  const adjustZoom = delta => setPreviewZoom(current=>Math.min(200,Math.max(50,current+delta)));
  const [reviewMode, setReviewMode] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [exportNotice, setExportNotice] = useState('');
  const [focus, setFocus] = useState('');
  const [floating, setFloating] = useState({form:false, preview:false});
  const [frontPanel, setFrontPanel] = useState('preview');
  const popOut = kind => {
    setFloating(prev=>({...prev,[kind]:true}));
    setFrontPanel(kind);
    if(kind==='preview')setShowPreview(true);
  };
  const dock = kind => setFloating(prev=>({...prev,[kind]:false}));
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
  const reviewAll = () => {
    setChecked(Object.fromEntries(Array.from({length:MAPPED_PAGES},(_,i)=>[i+1,true])));
    setReviewMode(true);
    setExportModal(false);
  };
  const beginExport = () => {
    setChecked(Object.fromEntries(Array.from({length:MAPPED_PAGES},(_,i)=>[i+1,true])));
    setExportModal(true);
  };
  const confirmExport = () => {
    const html = buildEnrollmentReviewHtml({
      clientName:client.name, applicationNumber:values.applicationNumber, values,
      issues:allIssues, pendingPages:EDITOR_PAGES.slice(MAPPED_PAGES)
    });
    const printWindow = window.open('about:blank','_blank');
    if (!printWindow) {
      setExportNotice('Your browser blocked the preview window. Allow pop-ups for this demo to open the printable copy.');
      setExportModal(false);
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setExportModal(false);
    setExportNotice('Prototype review copy opened in a new tab. Use Print / Save as PDF there.');
    onSave();
  };
  const allIssues = Object.values(issueByPage).flat();
  const selectOptions = (id,label,items,focusGroup) => <Choice id={id} label={label} value={values[id]} options={items} issue={issue(id)} onFocus={()=>setFocus(focusGroup||id)} onChange={v=>update(id,v)}/>;
  const input = (id,label,extra={}) => <Field id={id} label={label} value={values[id]} onChange={v=>update(id,v)} issue={issue(id)} onFocus={()=>setFocus(id)} {...extra}/>;
  const formPanel = (
    <section className="ef-editor">
        <div className="ef-section-head"><div><h3>{reviewMode?'Form Check & Review':EDITOR_PAGES[page-1]}</h3><p>{reviewMode?'Review missing and potentially incorrect answers before exporting.':'Follow the original form order. Save and revisit any page.'}</p></div><div className="ef-heading-actions">{!floating.form&&<button type="button" className="ef-btn ef-popout-btn" onClick={()=>popOut('form')} title="Open the form as a movable, resizable window">Pop Out Form ↗</button>}{!showPreview&&<button type="button" className="ef-btn" onClick={()=>setShowPreview(true)}>Show Preview</button>}{!reviewMode&&<span className={'ef-page-state'+(page>MAPPED_PAGES?' muted':checked[page]&&issues.length?' warning':'')}>{page>MAPPED_PAGES?'Mapping pending':checked[page]?(issues.length?issues.length+' issues':'Checked · clear'):'Not checked'}</span>}</div></div>
        {reviewMode&&<div className="ef-review-panel" role="region" aria-label="Enrollment form review">
          <div className="ef-review-overview"><strong>{allIssues.length} items found on mapped pages</strong><p>Review the list below. Pages 5–12 are still awaiting field mapping, so this prototype cannot confirm the entire 201 application is ready for enrollment.</p></div>
          {allIssues.length?allIssues.map((item,i)=><button type="button" className="ef-review-issue" key={item.page+'-'+item.key+'-'+i} onClick={()=>{goPage(item.page);setReviewMode(false)}}><span>Page {item.page}</span><strong>{item.label}</strong><small>{item.message}</small><b>›</b></button>):<p className="ef-review-clear">No issues detected on the five mapped pages.</p>}
          <div className="ef-review-pending"><strong>Pages needing implementation</strong><p>{EDITOR_PAGES.slice(MAPPED_PAGES).map((x,i)=>'Page '+(i+MAPPED_PAGES+1)+' · '+x).join(', ')}</p></div>
          <div className="ef-review-foot"><button className="ef-btn" onClick={()=>setReviewMode(false)}>Continue Editing</button><button className="ef-btn ef-btn-primary" onClick={beginExport}>Export for Enrollment ↗</button></div>
        </div>}
        {!reviewMode&&page===1&&<div className="ef-question-groups">
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
        {!reviewMode&&page===2&&<div className="ef-question-groups"><section className="ef-question-block"><div className="ef-question-heading"><span>III</span><div><h4>Adult Eligibility</h4><p>Choose ONE option from the WIOA Adult Priority of Service checklist.</p></div></div>
          <div className="ef-eligibility-list">{ELIGIBILITY_OPTIONS.map(([key,label])=><label key={key} className={values.adultEligibility===key?'active':''}><input name="ef-eligibility" type="radio" checked={values.adultEligibility===key} onChange={()=>update('adultEligibility',key)}/>{label}</label>)}</div>
          {issue('adultEligibility')&&<p className="ef-inline-issue">{issue('adultEligibility').message}</p>}
          {values.adultEligibility==='income'&&<div className="ef-subfields ef-two-fields">{input('familySize','Family Size',{type:'number',placeholder:'e.g. 1'})}{input('annualIncome','Annual Family Income',{type:'number',placeholder:'e.g. 25000'})}</div>}
          {values.adultEligibility==='benefits'&&<div className="ef-subfields">{selectOptions('publicBenefit','Public Benefit',['SNAP / CalFresh','TANF / CalWORKS','SSI','Other income-based public benefit'])}</div>}
          </section><section className="ef-question-block ef-muted-block"><div className="ef-question-heading"><span>IV</span><div><h4>Dislocated Worker Eligibility</h4><p>This case is 201 WIOA Adult. The separate Dislocated Worker category is not assessed in this prototype.</p></div></div></section></div>}
        {!reviewMode&&page===3&&<div className="ef-question-groups"><section className="ef-question-block"><div className="ef-question-heading"><span>01</span><div><h4>Application Details</h4><p>Source: OEWD WIOA Master Application · PDF page 3.</p></div></div>
          <div className="ef-form-grid">{input('agency','Agency')}{input('applicationDate','Application Date',{type:'date',help:'Date all documents have been collected and eligibility determined.'})}{input('applicationNumber','Application Number',{help:'May remain blank until OEWD approval.'})}</div></section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>02</span><div><h4>Contact Information</h4><p>Client Profile values are prefilled when available. Changes here belong to this Case draft.</p></div></div>
          <div className="ef-form-grid">{input('firstName','1 · First Name')}{input('lastName','3 · Last Name')}{input('phone','13 · Phone Number')}{input('email','16 · Email',{type:'email'})}{input('address','5 · Residential Address')}{input('city','7 · City')}{input('state','8 · State')}{input('zip','9 · ZIP Code')}{input('county','10 · County')}</div></section>
          <section className="ef-question-block ef-muted-block"><h4>Demographic Information · Questions 24–35</h4><p>These fields are identified in the source PDF. Full demographic controls will be mapped in a later prototype update.</p></section>
        </div>}
        {!reviewMode&&page===4&&<div className="ef-question-groups"><section className="ef-question-block"><div className="ef-question-heading"><span>36</span><div><h4>Language Information</h4><p>Corresponds to Questions 36–37 on the original application.</p></div></div>{selectOptions('otherLanguage','36 · Primarily speak a language other than English?',['Yes','No'])}{values.otherLanguage==='Yes'&&input('language','37 · Primary Language',{placeholder:'e.g. Chinese'})}</section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>39</span><div><h4>Farmworker & Veteran</h4><p>Questions 39–61. Relevant additional questions will be mapped later.</p></div></div>{selectOptions('farmworker','39 · Farmworker Status',['No','Farmworker','Migrant','Migrant Farmworker'])}{selectOptions('veteran','43 · Veteran Status',['No','Yes · 180 days or less','Yes · Eligible Veteran','Yes · Other Eligible Person'])}</section>
          <section className="ef-question-block"><div className="ef-question-heading"><span>62</span><div><h4>Employment</h4><p>Questions 62–66. Unemployment duration drives Question 64.</p></div></div>{selectOptions('employment','62 · Employment Status',['Employed','Not Employed','Employed · Notice of Termination'])}{input('unemployedWeeks','63 · Weeks Unemployed',{type:'number',placeholder:'Enter actual weeks'})}{values.unemployedWeeks&&<p className="ef-context-note">64 · 27 or more weeks: <strong>{Number(values.unemployedWeeks)>=27?'Yes':'No'}</strong> (calculated from Question 63)</p>}</section>
        </div>}
        {!reviewMode&&page===5&&<div className="ef-question-groups">
          <section className="ef-question-block">
            <div className="ef-question-heading"><span>67</span><div><h4>Unemployment Compensation</h4></div></div>
            {selectOptions('ucStatus','67 · Unemployment Compensation (past 6 months)',UC_STATUS.map(([value,label])=>({value,label})))}
          </section>
          <section className="ef-question-block">
            <div className="ef-question-heading"><span>68</span><div><h4>Reason for Layoff</h4></div></div>
            {selectOptions('layoffCategory','68 · Applicable Category',LAYOFF_CATEGORY.map(([value,label])=>({value,label})))}
            {values.layoffCategory==='none'&&<p className="ef-context-note">Questions 69–90 are skipped.</p>}
          </section>
          {isDwSpecial(values)&&<section className="ef-question-block">
            <div className="ef-question-heading"><span>73</span><div><h4>Layoff Notice</h4></div></div>
            {selectOptions('terminationNotice','73 · Received a termination or layoff notice?',['Yes','No'])}
          </section>}
          {isDwGeneral(values)&&<>
            <section className="ef-question-block">
              <div className="ef-question-heading"><span>69</span><div><h4>UI & Work Search</h4></div></div>
              <div className="ef-form-grid">
                {['claimantWprs','claimant'].includes(values.ucStatus)&&selectOptions('uiReferral','69 · UI Claimant Referred By',['WPRS','RESEA','REA','Not Applicable'])}
                {selectOptions('workSearchExempt','70 · Exempt from Work Search?',['Yes','No'])}
                {values.workSearchExempt==='Yes'&&input('workSearchExemptDate','71 · Date Exempted',{type:'date'})}
                {values.employment?.startsWith('Employed')&&selectOptions('wageAdvance','72 · Job Lacks Advancement / Wage Gain?',['Yes','No'])}
              </div>
            </section>
            <section className="ef-question-block">
              <div className="ef-question-heading"><span>73</span><div><h4>Layoff & Rapid Response</h4></div></div>
              <div className="ef-form-grid">
                {selectOptions('terminationNotice','73 · Received Termination / Layoff Notice?',['Yes','No'])}
                {values.terminationNotice==='Yes'&&input('projectedLayoffDate','74 · Projected Layoff Date',{type:'date'})}
                {values.terminationNotice==='Yes'&&input('actualLayoffDate','75 · Actual Layoff Date',{type:'date'})}
                {selectOptions('rapidResponse','76 · Attended Rapid Response Orientation?',['Yes','No'])}
                {values.rapidResponse==='Yes'&&input('rapidResponseDate','77 · Most Recent Orientation Date',{type:'date'})}
                {values.rapidResponse==='Yes'&&input('rapidResponseEvent','78 · Rapid Response Event #')}
              </div>
            </section>
            <section className="ef-question-block">
              <div className="ef-question-heading"><span>79</span><div><h4>Dislocation Employment</h4></div></div>
              <div className="ef-form-grid">
                {input('dislocationEmployer','79 · Employer')}
                {input('dislocationWage','80 · Hourly Wage',{type:'number'})}
                {input('dislocationAddress','81 · Employer Address')}
                {input('dislocationUnit','82 · Unit / Apt')}
                {input('dislocationCity','83 · City')}
                {input('dislocationState','84 · State')}
                {input('dislocationZip','85 · ZIP')}
                {input('layoffIndustry','86 · Layoff Industry')}
                {input('naics','87 · NAICS Code')}
                {input('layoffOccupation','88 · Occupation Title')}
                {input('onetCode','89 · O*NET Code')}
                {selectOptions('decliningOccupation','90 · Declining Occupation / Industry?',['Yes','No'])}
              </div>
            </section>
          </>}
        </div>}
        {!reviewMode&&page>MAPPED_PAGES&&<div className="ef-unmapped"><span>◇</span><h4>{EDITOR_PAGES[page-1]}</h4><p>This source page is included in navigation but its detailed fields have not been mapped yet. It will not be counted as complete or incorrectly marked as missing.</p><p className="ef-context-note">Prototype coverage: the first five source pages. The remaining pages need field mapping.</p></div>}
        {!reviewMode&&checked[page]&&page<=MAPPED_PAGES&&<div className={'ef-check-results'+(issues.length?' has-issues':'')}><h4>{issues.length?issues.length+' items to review':'No detected issues on this mapped page'}</h4>{issues.length?issues.map((i,n)=><p key={i.key+n}><strong>{i.label}:</strong> {i.message}</p>):<p>Only prototype checks were run. This is not an eligibility approval.</p>}</div>}
        {!reviewMode&&<div className="ef-bottom"><button type="button" className="ef-btn ef-bottom-arrow" disabled={page===1} onClick={()=>goPage(page-1)} aria-label="Previous page">‹</button><div><span className="ef-bottom-page">Page {page} / 12</span><button className="ef-btn" disabled={page>MAPPED_PAGES} onClick={checkPage}>Check Page</button><button type="button" className="ef-btn ef-bottom-arrow" disabled={page===12} onClick={()=>goPage(page+1)} aria-label="Next page">›</button></div></div>}
      </section>
  );
  const previewPanel = (
    <aside className="ef-preview-pane"><div className="ef-preview-top"><strong>Form Preview</strong><div className="ef-preview-controls">{!floating.preview&&<button type="button" className="ef-btn ef-popout-btn" onClick={()=>popOut('preview')} title="Pop out preview" aria-label="Pop out form preview">Pop Out ↗</button>}<button type="button" className="ef-btn ef-preview-toggle" onClick={()=>{setShowPreview(false);dock('preview')}}>Hide</button></div></div>
        <div className="ef-preview-scroll"><div className="ef-preview-zoom-stage" style={{zoom:previewZoom/100}}><PaperPreview page={page} values={values} focus={focus}/></div></div>
        <div className="ef-preview-foot" title="Preview only — not the official OEWD PDF">
          <div className="ef-zoom-controls" role="group" aria-label="Form preview zoom">
            <button type="button" title="Zoom out" aria-label="Zoom out preview" onClick={()=>adjustZoom(-25)} disabled={previewZoom<=50}>−</button>
            <button type="button" className="ef-zoom-value" title="Reset zoom to 100%" aria-label={'Reset zoom to 100%, currently '+previewZoom+'%'} onClick={()=>setPreviewZoom(100)}>{previewZoom}%</button>
            <button type="button" title="Zoom in" aria-label="Zoom in preview" onClick={()=>adjustZoom(25)} disabled={previewZoom>=200}>+</button>
          </div>
        </div>
      </aside>
  );
  return <div className="ef-app">
    <div className="ef-toolbar">
      <div><h2>201 Master Application</h2></div>
      <div className="ef-toolbar-actions"><span className="ef-autosave">● Browser draft</span><button className="ef-btn" onClick={onSave}>Save Draft</button>{reviewMode?<button className="ef-btn ef-btn-primary" onClick={()=>setReviewMode(false)}>Continue Editing</button>:<button className="ef-btn ef-btn-primary" onClick={beginExport}>Export for Enrollment ↗</button>}</div>
    </div>
    <div className={'ef-layout'+(railCollapsed?' ef-rail-collapsed':'')+(floating.form?' ef-form-popped':'')+(floating.preview&&showPreview?' ef-preview-popped':'')}>
      <aside className="ef-rail">
        <div className="ef-rail-head"><div><span className="ef-rail-heading">FORM PAGES</span>{!railCollapsed&&<small>1–12</small>}</div><button type="button" className="ef-rail-toggle" onClick={()=>setRailCollapsed(v=>!v)} aria-expanded={!railCollapsed} title={railCollapsed?'Expand form contents':'Collapse form contents'} aria-label={railCollapsed?'Expand form contents':'Collapse form contents'}>{railCollapsed?'›':'‹'}</button></div>
        {EDITOR_PAGES.map((label,i)=>{const number=i+1;const mapped=number<=MAPPED_PAGES;const didCheck=checked[number];const count=issueByPage[number]?.length||0;return <button type="button" key={number} className={'ef-page'+(page===number?' selected':'')} onClick={()=>goPage(number)} title={label} aria-label={'Page '+number+' · '+label} aria-current={page===number?'page':undefined}>
          <span className="ef-page-number">{String(number).padStart(2,'0')}</span>{!railCollapsed&&<span className="ef-page-copy"><strong>{label}</strong><small>{!mapped?'Mapping pending':didCheck?(count?count+' to review':'Checked · clear'):'Not checked'}</small></span>}
          {mapped&&didCheck&&<span className={'ef-page-dot'+(count?' warn':' done')}/>}
        </button>})}
        
      </aside>
      {floating.form
        ? <div className="ef-pop-placeholder ef-pop-form"><strong>Form Editor is floating</strong><p>Use the movable Form Editor window to enter data and compare it with the preview.</p><button type="button" className="ef-btn" onClick={()=>dock('form')}>Dock Form</button></div>
        : formPanel}
      {showPreview && (floating.preview
        ? <div className="ef-pop-placeholder ef-pop-preview"><strong>Reference Preview is floating</strong><p>The reference follows the selected page and stays updated as you type.</p><button type="button" className="ef-btn" onClick={()=>dock('preview')}>Dock Preview</button></div>
        : previewPanel)}
    </div>
    {floating.form&&<FloatingPanel kind="form" title={'Enrollment Form · Page '+page} active={frontPanel==='form'} onBringToFront={()=>setFrontPanel('form')} onDock={()=>dock('form')}>{formPanel}</FloatingPanel>}
    {floating.preview&&showPreview&&<FloatingPanel kind="preview" title={'Reference Preview · Page '+page} active={frontPanel==='preview'} onBringToFront={()=>setFrontPanel('preview')} onDock={()=>dock('preview')}>{previewPanel}</FloatingPanel>}
    {exportModal&&<div role="dialog" aria-modal="true" aria-labelledby="ef-export-title" className="ef-review-backdrop" onClick={()=>setExportModal(false)}>
      <div className="ef-review-dialog ef-export-dialog" onClick={e=>e.stopPropagation()}>
        <div className="ef-review-header"><div><span className="ef-overline">EXPORT FOR ENROLLMENT</span><h3 id="ef-export-title">Check the form before exporting</h3></div><button type="button" className="ef-btn" onClick={()=>setExportModal(false)} aria-label="Close export dialog">✕</button></div>
        <p className="ef-review-info">We found <strong>{allIssues.length} possible missing or incorrect answers</strong> on the five mapped pages. Please review them before using this form for enrollment.</p>
        <div className="ef-export-stats"><div><strong>{allIssues.filter(x=>x.severity==='missing').length}</strong><span>Missing</span></div><div><strong>{allIssues.filter(x=>x.severity==='error').length}</strong><span>Possible errors</span></div><div><strong>{EDITOR_PAGES.length-MAPPED_PAGES}</strong><span>Pages not mapped</span></div></div>
        {allIssues.length>0&&<div className="ef-export-summary">{allIssues.slice(0,4).map((x,i)=><p key={x.key+i}><strong>Page {x.page} · {x.label}</strong><span>{x.message}</span></p>)}{allIssues.length>4&&<small>And {allIssues.length-4} more items…</small>}</div>}
        <div className="ef-export-caveat"><strong>Prototype export only</strong><p>Confirm Export opens a printable review copy that can be saved as PDF. It is not the official OEWD 201 application. Exporting does not mark the Case Enrolled or submit anything, and pages 5–12 still need mapping.</p></div>
        <div className="ef-export-actions"><button className="ef-btn" onClick={()=>setExportModal(false)}>Cancel</button><button className="ef-btn" onClick={reviewAll}>Review Issues</button><button className="ef-btn ef-btn-primary" onClick={confirmExport}>Confirm Export ↗</button></div>
      </div>
    </div>}
    {exportNotice&&<div className="ef-export-notice" role="status">{exportNotice} <button type="button" onClick={()=>setExportNotice('')}>Dismiss</button></div>}
    <p className="ef-disclaimer">Synthetic-data browser prototype · drafts are stored locally · exported review copies are not official OEWD PDFs and do not submit or enroll a Case.</p>
  </div>;
}
