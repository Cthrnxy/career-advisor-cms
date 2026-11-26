import test from 'node:test';
import assert from 'node:assert/strict';
import {addAttempt,saveRound,roundStatus,quarterLabel} from '../src/features/followup/followupModel.js';
import {getCaseStatus,dueFollowupCases} from '../src/caseWorkflow.js';
import {calendarTasks} from '../src/features/calendar/calendarModel.js';
import {changeDocuments} from '../src/features/documents/documentModel.js';
const record={id:'r',form:'201',enrolled:true,exit:{date:'2026-08-01'},followups:[],attachments:[{name:'one.pdf',blobKey:'one'}]};
const values={date:'2026-11-26',file:'one.pdf',employment:'Employed',note:'Reached'};
test('contact attempts do not complete a round or overwrite its answers',()=>{
 const next=addAttempt(record,0,{date:'2026-11-26',method:'Phone',result:'No Answer',note:'Try again'});
 assert.equal(next.followups[0].date,undefined);assert.equal(next.followups[0].file,undefined);assert.equal(roundStatus(next.followups[0]),'Draft');assert.equal(getCaseStatus(next),'Follow-up 1');
 assert.throws(()=>addAttempt(record,0,{date:'2026-02-30',method:'Phone',result:'Reached'}));
});
test('missing file stays pending; real file completes and edit history preserves previous values',()=>{
 const draft=saveRound(record,0,{...values,file:'',nextContactDate:'2026-12-01'});
 assert.equal(roundStatus(draft.followups[0]),'Missing File');assert.equal(calendarTasks([{id:'client',cases:[draft]}])[0].date,'2026-12-01');
 const complete=saveRound(draft,0,values);assert.equal(roundStatus(complete.followups[0]),'Complete');assert.equal(getCaseStatus(complete),'Follow-up 2');assert.equal(complete.taskSchedule['followup-0'],null);
 const reopened=saveRound(complete,0,{...values,file:''});assert.equal(getCaseStatus(reopened),'Follow-up 1');assert.equal(reopened.followups[0].history.at(-1).before.file,'one.pdf');
 assert.throws(()=>saveRound(record,0,{...values,file:'not-uploaded'}));
 assert.throws(()=>saveRound(record,0,{...values,hourlyWage:'-1'}));
});
test('optional employment details can be blank and the last round automatically completes the Case',()=>{
 const next=saveRound({...record,form:'999'},0,values);assert.equal(next.followups[0].employer,'');assert.equal(getCaseStatus(next),'Complete');assert.equal(calendarTasks([{cases:[next]}]).length,0);
});
test('scheduled contact on a later round is visible without hiding the earliest pending quarter',()=>{
 const next=saveRound(record,2,{file:'',employment:'Unknown',nextContactDate:'2027-04-01'});
 const tasks=calendarTasks([{id:'client',cases:[next]}]);assert.deepEqual(tasks.map(t=>t.taskKey),['followup-0','followup-2']);assert.equal(tasks[1].date,'2027-04-01');assert.equal(quarterLabel(record,0),'Q4 2026');
});
test('file removal reopens a completed round and records the removal',()=>{
 const complete=saveRound({...record,form:'999'},0,values);
 const updated=changeDocuments({cases:[complete]},[],record.attachments[0],null).cases[0];assert.equal(getCaseStatus(updated),'Follow-up 1');assert.equal(updated.followups[0].history.at(-1).action,'File removed');
});
test('overdue quarters sort before current quarter, and files cannot be reused across rounds',()=>{
 const done=saveRound(record,0,values);assert.throws(()=>saveRound(done,1,values),/own file/);
 const list=dueFollowupCases([{name:'A',cases:[{...record,id:'current',exit:{date:'2026-11-01'}},{...record,id:'old',exit:{date:'2026-05-01'}}]}],new Date(2027,0,15));assert.deepEqual(list.map(x=>x.record.id),['old','current']);
});
