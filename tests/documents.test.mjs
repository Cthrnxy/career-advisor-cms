import test from 'node:test';
import assert from 'node:assert/strict';
import {changeDocuments,newestDocuments,validateFile} from '../src/features/documents/documentModel.js';
import {processSignature} from '../src/features/documents/signatureProcessing.js';
test('replacement updates links without changing case or service dates',()=>{const client={docs:[{name:'old.pdf',kind:'Photo ID'}],cases:[{enrollmentDate:'2026-11-01',exit:{date:'2026-11-10',evidence:'old.pdf'},followups:[{date:'2027-01-03',file:'old.pdf'}]}]};const next=changeDocuments(client,[{name:'new.pdf'}],client.docs[0],{name:'new.pdf'});assert.equal(next.cases[0].exit.evidence,'new.pdf');assert.equal(next.cases[0].followups[0].file,'new.pdf');assert.equal(next.cases[0].followups[0].date,'2027-01-03');assert.equal(next.cases[0].enrollmentDate,'2026-11-01');assert.equal(client.cases[0].exit.evidence,'old.pdf')});
test('deletion clears linked attachment without falsely completing follow-up',()=>{const client={cases:[{followups:[{date:'2027-01-03',file:'old.pdf'}]}]};const next=changeDocuments(client,[],{name:'old.pdf'},null);assert.equal(next.cases[0].followups[0].file,'');assert.equal(next.cases[0].followups[0].date,'2027-01-03')});
test('legacy files remain visible after dated files and invalid files are rejected',()=>{assert.deepEqual(newestDocuments([{name:'legacy'},{name:'new',uploadedAt:'2026-11-25'}]).map(d=>d.name),['new','legacy']);assert.throws(()=>validateFile({size:0}));assert.throws(()=>validateFile({size:33*1024*1024}));validateFile({size:1024})});
test('signature processing removes paper and preserves ink',()=>{const data=new Uint8ClampedArray(20*20*4).fill(255);const i=(10*20+10)*4;data[i]=data[i+1]=data[i+2]=0;const out=processSignature({width:20,height:20,data},true);assert.equal(out.data[3],0);assert.ok(out.data[i+3]>0);assert.ok(out.bounds.width<20);assert.equal(data[3],255)});
test('signature processing rejects blank paper and dark backgrounds',()=>{assert.throws(()=>processSignature({width:10,height:10,data:new Uint8ClampedArray(400).fill(255)},true),/No visible/);const data=new Uint8ClampedArray(400);for(let i=3;i<data.length;i+=4)data[i]=255;assert.throws(()=>processSignature({width:10,height:10,data},true),/too dark/);assert.equal(processSignature({width:10,height:10,data},false).bounds.width,10)});

test('document display titles hide source filenames and preserve user titles',async()=>{
 const {documentTitle}=await import('../src/features/documents/documentLabels.js');
 assert.equal(documentTitle({kind:'Photo ID',name:'private-scan.pdf'}),'ID');
 assert.equal(documentTitle({kind:'Green Card / Work Permit',name:'GreenCard.pdf'}),'Green Card');
 assert.equal(documentTitle({kind:'Other Documents',name:'original-secret.pdf',title:'Job Offer'}),'Job Offer');
 assert.equal(documentTitle({kind:'Photo ID',name:'original-secret.pdf',title:'Updated ID'}),'Updated ID');
});
