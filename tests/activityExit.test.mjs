import test from 'node:test';
import assert from 'node:assert/strict';
import {activityTasks,activityRequirements,editActivity,saveExitRecord,reopenExit} from '../src/features/case/activityExit.js';
import {getCaseStatus,getCurrentFollowup,enrolledCases} from '../src/caseWorkflow.js';
const activities=['IEP','Job Searching','Job Searching'].map(type=>({type,date:'2026-11-20',note:''}));
const ready={id:'case',form:'201',enrolled:true,activities,attachments:[{id:'ev',blobKey:'ev',name:'EV.pdf'}],followups:[{date:'2027-01-02',file:'proof.pdf'}]};
const draft={date:'2026-11-25',outcome:'Job Found',evidenceRef:'ev',evidenceType:'EV',evidenceConfirmed:true,note:''};
test('enrollment creates pending tasks without creating completed activities',()=>{
 assert.deepEqual(activityTasks({...ready,activities:[],enrolled:false}),[]);
 assert.deepEqual(activityTasks({...ready,activities:[]}).map(t=>t.type),['IEP','Job Searching']);
 assert.deepEqual(activityTasks(ready),[]);assert.equal(ready.activities.length,3);
});
test('201 requires IEP and two Job Searching; other activities do not substitute',()=>{
 assert.equal(activityRequirements(ready).length,0);
 assert.ok(activityRequirements({...ready,activities:[activities[0],activities[1],{type:'Other',date:'2026-11-20'}]}).length);
 assert.deepEqual(activityRequirements({form:'999',activities:[]}),[]);
});
test('Exit draft never moves Case to Follow-up or out of pending Exit',()=>{
 const next=saveExitRecord(ready,{...draft,evidenceRef:''},false);
 assert.equal(getCaseStatus(next),'Enrolled');assert.equal(getCurrentFollowup(next),null);
 assert.equal(enrolledCases([{cases:[next]}]).length,1);assert.equal(next.exit,undefined);
});
test('completed Exit requires activity, date, evidence and explicit CA confirmation',()=>{
 for(const changed of [{date:'2026-02-30'},{evidenceConfirmed:false},{evidenceRef:'missing'},{outcome:'Other',note:''}])assert.throws(()=>saveExitRecord(ready,{...draft,...changed},true));
 assert.throws(()=>saveExitRecord({...ready,activities:[]},draft,true),/IEP/);
 const next=saveExitRecord(ready,draft,true);assert.equal(next.exit.evidence,'EV.pdf');assert.equal(next.exitHistory.length,1);
 assert.throws(()=>editActivity(next,0,null),/Reopen/);
 assert.throws(()=>editActivity(next,1,{type:'Other',date:'2026-11-20'}),/Reopen/);
 const extra=editActivity(next,null,{type:'Other',date:'2026-11-26'});assert.equal(editActivity(extra,3,null).activities.length,3);
});
test('Exit date revisions retain Follow-up data and history; reopening preserves draft and enables correction',()=>{
 const exited=saveExitRecord(ready,draft,true,'2026-11-25T12:00:00Z');
 const changed=saveExitRecord(exited,{...draft,date:'2026-12-01'},true,'2026-12-02T12:00:00Z');
 assert.equal(changed.followupNeedsReview,true);assert.deepEqual(changed.followups,ready.followups);assert.equal(changed.exitHistory[1].before.date,draft.date);
 const reopened=reopenExit(changed);assert.equal(reopened.exit,null);assert.equal(reopened.exitDraft.evidenceConfirmed,false);assert.equal(getCaseStatus(reopened),'Enrolled');assert.equal(editActivity(reopened,0,null).activities.length,2);
});
