import test from 'node:test';
import assert from 'node:assert/strict';
import {caseReadiness} from '../src/features/case/caseFiles.js';
import {recordSuccessfulExport} from '../src/features/case/enrollment.js';
import {prefillCase,prefillSources} from '../src/features/enrollment/casePrefill.js';
import {initialOriginalValues} from '../src/features/enrollment/original201Model.js';
const a={id:'a',blobKey:'a',evidence:{A:['U.S. Passport']}};
const client={'Client Signature':{blobKey:'sig'}};
test('201 accepts a selected EV instead of an employer signature, but not an unselected Paystub',()=>{
 const record={form:'201',signatureFiles:client,attachments:[a,{id:'ev',blobKey:'ev'}],evidenceAssignments:{EV:'ev'}};
 assert.deepEqual(caseReadiness(record),[]);
 assert.ok(recordSuccessfulExport(record,{artifactId:'pdf',completed:true,official:true}).exportedAt);
 assert.ok(caseReadiness({...record,evidenceAssignments:{},attachments:[a,{id:'stub',title:'Paystub',blobKey:'stub'}]}).includes('Employer Signature or Employment Verification'));
 assert.ok(caseReadiness({...record,attachments:[a]}).length);
 assert.ok(caseReadiness({...record,attachments:[a,{id:'ev'}]}).length);
});
test('999 requires CA-designated ID, IEP, client and CA signatures; no employment or employer signature gate',()=>{
 const ready={form:'999',attachments:[{id:'id',blobKey:'id'},{id:'iep',blobKey:'iep'}],evidenceAssignments:{ID:'id',IEP:'iep'},signatureFiles:{...client,'CA Signature':{blobKey:'ca'}}};
 assert.deepEqual(caseReadiness(ready),[]);
 for(const role of ['ID','IEP'])assert.ok(caseReadiness({...ready,evidenceAssignments:{...ready.evidenceAssignments,[role]:''}}).length);
 assert.ok(caseReadiness({...ready,signatureFiles:client}).includes('CA Signature'));
 assert.throws(()=>recordSuccessfulExport({...ready,attachments:[]},{artifactId:'pdf',completed:true,official:true}),/incomplete/);
});
test('prefill recommends newest 201 or 999 and copies answers without old dates, signatures, files or status',()=>{
 const source={id:'old',form:'201',applicationDate:'2026-01-01',applicationNumber:'old-number',enrolled:true,signatureFiles:client,attachments:[a],fields:{original201:{p3w7:'Demo',p3w8:'Example',p3w5:'2026-01-01',p3w6:'old-number',p7w53:'2026-01-01','apply-p7w52':true},reviewed201:{1:true}}};
 const target={id:'new',form:'201',fields:{},applicationDate:'',applicationNumber:'',enrolled:false};
 const copied=prefillCase(target,source);
 const values=initialOriginalValues(copied,{name:'Demo Example',phone:'4155550199'});
 assert.equal(values.p3w7,'Demo');assert.equal(values.p3w20,'4155550199');assert.equal(values.p3w5,'');assert.equal(values.p7w53,undefined);assert.equal(values['apply-p7w52'],undefined);
 assert.equal(copied.signatureFiles,undefined);assert.equal(copied.attachments,undefined);assert.equal(copied.applicationNumber,'');assert.equal(copied.enrolled,false);assert.deepEqual(copied.fields.reviewed201,{});
 copied.fields.commonAnswers.firstName='Changed';assert.equal(source.fields.original201.p3w7,'Demo');
 assert.equal(prefillSources([source,{id:'recent',form:'999',createdAt:'2026-11-25'}])[0].id,'recent');
});
test('common answers transfer both ways while unrelated legacy data is excluded',()=>{
 const old999={id:'old999',form:'999',fields:{commonAnswers:{firstName:'Test',phone:'4155550100',applicationDate:'old',signature:'old'}}};
 const next=prefillCase({form:'201',fields:{}},old999);assert.equal(next.fields.prefill201.p3w7,'Test');assert.equal(next.fields.commonAnswers.applicationDate,undefined);
 const next999=prefillCase({form:'999',fields:{}},{id:'201',form:'201',fields:{original201:{p3w7:'Other',p3w20:'4155550101',p3w5:'old'}}});
 assert.equal(next999.fields.commonAnswers.firstName,'Other');assert.equal(next999.fields.original201,undefined);assert.equal(next999.fields.commonAnswers.applicationDate,undefined);
});
