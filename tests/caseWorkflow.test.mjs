import test from 'node:test';
import assert from 'node:assert/strict';
import {followupCount,isFollowupComplete,firstIncompleteFollowup,getFollowupQuarterStart,getCurrentFollowup,getCaseStatus,enrolledCases,dueFollowupCases} from '../src/caseWorkflow.js';
const exited=(date,form='201')=>({id:'demo',form,enrolled:true,exit:{date},followups:[]});
test('follow-up 1 for May and June exit both opens July 1',()=>{
 const a=getFollowupQuarterStart('2026-05-15',0),b=getFollowupQuarterStart('2026-06-30',0);
 assert.deepEqual([a.getFullYear(),a.getMonth()+1,a.getDate()],[2026,7,1]);
 assert.deepEqual([b.getFullYear(),b.getMonth()+1,b.getDate()],[2026,7,1]);
 assert.deepEqual([getFollowupQuarterStart('2026-05-15',1).getMonth()+1,getFollowupQuarterStart('2026-05-15',2).getFullYear()],[10,2027]);
});
test('date AND document are required to mark an individual follow-up complete',()=>{
 assert.equal(isFollowupComplete({date:'2026-08-12',file:''}),false);
 assert.equal(isFollowupComplete({date:'',file:'FU.pdf'}),false);
 assert.equal(isFollowupComplete({date:'2026-08-12',file:'FU.pdf'}),true);
});
test('home listing skips complete early round and waits until next quarter',()=>{
 const r=exited('2026-05-15');r.followups=[{date:'2026-08-12',file:'FU1.pdf'}];
 assert.equal(getCurrentFollowup(r,new Date(2026,7,20)),null);
 assert.equal(getCurrentFollowup(r,new Date(2026,9,1)).round,2);
 r.followups[1]={date:'2026-09-20',file:'FU2.pdf'};
 assert.equal(getCurrentFollowup(r,new Date(2026,9,1)),null);
 assert.equal(getCurrentFollowup(r,new Date(2027,0,1)).round,3);
});
test('out-of-order edits never skip earlier incomplete rounds and every case appears at most once',()=>{
 const r=exited('2026-05-15');r.followups=[{}, {date:'2026-10-02',file:'FU2.pdf'}];
 assert.equal(firstIncompleteFollowup(r),0);
 assert.equal(getCaseStatus(r),'Follow-up 1');
 const clients=[{id:'A',name:'Mei Chen',cases:[r,exited('2026-06-20','999')]}];
 const result=dueFollowupCases(clients,new Date(2026,10,17));
 assert.equal(result.length,2);
 assert.equal(result.filter(c=>c.record.id===r.id).length,1);
});
test('201 has four rounds and 999 one; not-exited Case filter is independent of client status',()=>{
 const r=exited('2026-05-15','999');r.followups=[{date:'2026-08-12',file:'File.pdf'}];
 assert.equal(followupCount(r),1);
 assert.equal(getCaseStatus(r),'Complete');
 assert.equal(dueFollowupCases([{name:'Mei',cases:[r]}],new Date(2026,10,17)).length,0);
 const noExit={id:'c1',form:'201',enrolled:true,exit:null,enrollmentDate:'2026-10-01'};
 assert.equal(enrolledCases([{name:'Mei',status:'Exited',cases:[noExit]}]).length,1);
});
