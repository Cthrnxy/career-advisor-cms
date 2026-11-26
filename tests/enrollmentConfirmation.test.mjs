import test from 'node:test';
import assert from 'node:assert/strict';
import {recordApplicationNumber,recordSuccessfulExport} from '../src/features/case/enrollment.js';
import {caseReadiness,evidenceValues} from '../src/features/case/caseFiles.js';
import {buildCasePackage} from '../src/features/case/packageFiles.js';
import {getCaseStatus} from '../src/caseWorkflow.js';
const signatures={'Client Signature':{blobKey:'client'},'Employer Signature':{blobKey:'employer'}};
const ready={form:'201',attachments:[{blobKey:'a',evidence:{A:['Passport']}}],signatureFiles:signatures};
test('201 accepts A or B+C with client and employer signature copies',()=>{
 assert.deepEqual(caseReadiness(ready),[]);
 assert.deepEqual(caseReadiness({...ready,attachments:[{blobKey:'bc',evidence:{B:['ID'],C:['SSN']}}]}),[]);
 assert.ok(caseReadiness({...ready,attachments:[{blobKey:'b',evidence:{B:['ID']}}]}).length);
 assert.ok(caseReadiness({...ready,signatureFiles:{}}).includes('Client Signature'));
 assert.equal(evidenceValues([{evidence:{A:['filename only']}}]).listA,'');
});
test('official completed export becomes In Process, number becomes Enrolled',()=>{
 assert.equal(getCaseStatus(ready),'Draft');
 assert.throws(()=>recordApplicationNumber(ready,'123'),/export/);
 assert.throws(()=>recordSuccessfulExport(ready,{artifactId:'review',completed:true,official:false}),/official/);
 const exported=recordSuccessfulExport(ready,{artifactId:'pdf',completed:true,official:true});
 assert.equal(getCaseStatus(exported),'In Process');
 const enrolled=recordApplicationNumber(exported,' 123 ');
 assert.equal(getCaseStatus(enrolled),'Enrolled');assert.equal(enrolled.applicationNumber,'123');
 assert.throws(()=>recordApplicationNumber(enrolled,''),/retain/);
});
test('Case package contains actual copied bytes and fails on missing content',async()=>{
 const record={id:'test',attachments:[{name:'id.txt',blobKey:'copy',evidence:{B:['ID']}}]};
 const blob=await buildCasePackage(record,async()=>new Blob(['independent copy']));
 const text=await blob.text();assert.ok(text.includes('independent copy'));assert.ok(text.includes('manifest.json'));
 await assert.rejects(()=>buildCasePackage(record,async()=>null),/missing/);
});
