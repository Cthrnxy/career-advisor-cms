import test from 'node:test';
import assert from 'node:assert/strict';
import {EDITOR_PAGES, MAPPED_PAGES, enrollmentIssues} from '../src/features/enrollment/formEditorRules.js';

test('201 form lists the first 12 PDF pages; IEP pages are separate uploaded documents', ()=>{
  assert.equal(EDITOR_PAGES.length,12);
  assert.equal(MAPPED_PAGES,5);
  assert.equal(EDITOR_PAGES[0],'Work Authorization');
  assert.equal(EDITOR_PAGES[11],'Photo Release');
});

test('List A needs one document and List B+C needs both documents', ()=>{
  assert.deepEqual(enrollmentIssues({workRoute:'A',selectiveRoute:'exempt',selectiveEvidence:'Born Female'},1).map(x=>x.key),['listA']);
  assert.deepEqual(enrollmentIssues({workRoute:'BC',listB:"Valid Driver's License or ID Card",selectiveRoute:'exempt',selectiveEvidence:'Born Female'},1).map(x=>x.key),['listC']);
  assert.deepEqual(enrollmentIssues({workRoute:'A',listA:'U.S. Passport',selectiveRoute:'registered',selectiveEvidence:'SSS Internet Verification'},1),[]);
});
test('eligibility only requires detail for the selected category', ()=>{
  assert.deepEqual(enrollmentIssues({adultEligibility:'homeless'},2),[]);
  assert.deepEqual(enrollmentIssues({adultEligibility:'income'},2).map(x=>x.key),['familySize','annualIncome']);
  assert.deepEqual(enrollmentIssues({adultEligibility:'benefits',publicBenefit:'SNAP / CalFresh'},2),[]);
});
test('application number can be blank pending approval, while email and ZIP format are checked', ()=>{
  const valid={firstName:'Mei',lastName:'Chen',applicationDate:'2026-11-19',applicationNumber:''};
  assert.deepEqual(enrollmentIssues(valid,3),[]);
  const bad=enrollmentIssues({...valid,email:'not-email',zip:'123'},3);
  assert.deepEqual(bad.map(x=>x.key),['email','zip']);
});
test('conditional language prompt and unavailable pages never claim completion', ()=>{
  const v={otherLanguage:'Yes',farmworker:'No',veteran:'No',employment:'Not Employed'};
  assert.deepEqual(enrollmentIssues(v,4).map(x=>x.key),['language']);
  assert.deepEqual(enrollmentIssues({},8),[]);
});


test('201 page 5 skips layoff details after None of the above', ()=>{
  const complete={ucStatus:'neither',layoffCategory:'none'};
  assert.deepEqual(enrollmentIssues(complete,5),[]);
  assert.deepEqual(enrollmentIssues({...complete,workSearchExemptDate:'invalid',dislocationWage:'abc'},5),[]);
});
test('201 page 5 validates only applicable dislocation questions', ()=>{
  const simple=enrollmentIssues({ucStatus:'neither',layoffCategory:'6'},5);
  assert.deepEqual(simple.map(x=>x.key),['terminationNotice']);
  assert.deepEqual(enrollmentIssues({ucStatus:'neither',layoffCategory:'6',terminationNotice:'No'},5),[]);
  const category1={ucStatus:'claimant',layoffCategory:'1',workSearchExempt:'Yes',terminationNotice:'No',rapidResponse:'No',decliningOccupation:'No'};
  const issues=enrollmentIssues(category1,5);
  assert.deepEqual(issues.map(x=>x.key),['uiReferral','workSearchExemptDate']);
  const ok={...category1,uiReferral:'Not Applicable',workSearchExemptDate:'2026-10-02'};
  assert.deepEqual(enrollmentIssues(ok,5),[]);
  assert.deepEqual(enrollmentIssues({...ok,dislocationWage:'-500'},5).map(x=>x.key),['dislocationWage']);
});
