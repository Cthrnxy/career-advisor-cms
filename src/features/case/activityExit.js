export const EXIT_OUTCOMES=['Job Found','Training or Education','Unable to Contact','Other'];
export function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const [y,m,d]=value.split('-').map(Number),v=new Date(y,m-1,d);return v.getFullYear()===y&&v.getMonth()===m-1&&v.getDate()===d;}
export function activityRequirements(record){
 if(String(record.form)!=='201')return [];
 const done=(record.activities||[]).filter(a=>validDate(a.date));
 return [...(done.some(a=>a.type==='IEP')?[]:['Complete IEP']),...(done.filter(a=>a.type==='Job Searching').length>=2?[]:['Complete two Job Searching activities'])];
}
export function activityTasks(record){
 if(!record.enrolled||record.exit?.date)return [];
 const done=(record.activities||[]).filter(a=>validDate(a.date));
 return ['IEP','Job Searching'].filter(type=>!done.some(a=>a.type===type)).map(type=>({key:type==='IEP'?'activity-iep':'activity-job-search',type}));
}
export function editActivity(record,index,activity){
 if(activity&&(!validDate(activity.date)||!activity.type?.trim()))throw Error('Activity type and a valid completed date are required.');
 const activities=[...(record.activities||[])];
 if(index===null){activities.push({...activity,id:crypto.randomUUID()});}
 else {if(!activities[index])throw Error('Activity no longer exists.');if(activity)activities[index]={...activities[index],...activity};else activities.splice(index,1);}
 const next={...record,activities};
 if(record.exit?.date&&activityRequirements(next).length)throw Error('This change would invalidate the 201 Exit requirements. Reopen Exit first.');
 return next;
}
export const exitFileKey=file=>file.id||file.blobKey||file.name;
export function exitEvidence(record){return [...(record.attachments||[]),record.signatureFiles?.['Employer Signature']].filter(f=>f?.blobKey);}
export function saveExitRecord(record,draft,complete=false,now=new Date().toISOString()){
 if(!complete)return {...record,exitDraft:{...draft}};
 if(!record.enrolled)throw Error('Enroll this Case before completing Exit.');
 const missing=activityRequirements(record);if(missing.length)throw Error(missing.join('. '));
 if(!validDate(draft.date))throw Error('Enter a valid Exit date.');
 if(!EXIT_OUTCOMES.includes(draft.outcome))throw Error('Select an Exit outcome.');
 if(draft.outcome==='Other'&&!draft.note?.trim())throw Error('Describe the Other outcome.');
 const file=exitEvidence(record).find(f=>exitFileKey(f)===draft.evidenceRef);
 if(!file||!draft.evidenceConfirmed)throw Error('Select evidence and confirm it can be used for this Exit.');
 if(!['EV','Paystub','Employer Signature'].includes(draft.evidenceType))throw Error('Identify the Exit evidence type.');
 const previous=record.exit||null,exit={...draft,evidence:file.name,completedAt:previous?.completedAt||now,updatedAt:now};
 const changed=!!previous?.date&&previous.date!==exit.date;
 return {...record,exit,exitDraft:null,followupNeedsReview:record.followupNeedsReview||changed,exitHistory:[...(record.exitHistory||[]),{at:now,action:previous?.date?'Updated':'Completed',before:previous,after:exit}]};
}
export function reopenExit(record,now=new Date().toISOString()){
 if(!record.exit?.date)return record;
 return {...record,exitDraft:{...record.exit,evidenceConfirmed:false},exit:null,followupNeedsReview:true,exitHistory:[...(record.exitHistory||[]),{at:now,action:'Reopened',before:record.exit,after:null}]};
}
