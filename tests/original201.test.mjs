import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {schema,automaticValues,updateOriginal,applyProfile,originalIssues,validFormDate} from '../src/features/enrollment/original201Model.js';
import {fillOriginal201} from '../src/features/enrollment/original201Pdf.js';
import {buildCasePackage} from '../src/features/case/packageFiles.js';

const template=await readFile(new URL('../public/templates/201-blank.pdf',import.meta.url));
test('201 template is blank, editable and limited to the 12-page main application',async()=>{
 const pdf=await PDFDocument.load(template),fields=pdf.getForm().getFields();
 assert.equal(pdf.getPageCount(),12);assert.equal(fields.length,573);
 assert.equal(new Set(schema.fields.map(f=>f.key)).size,573);
 assert.deepEqual(fields.map(f=>f.getName()).sort(),schema.fields.map(f=>f.key).sort());
 for(const field of fields){if(field.getText)assert.ok(!field.getText());if(field.isChecked)assert.equal(field.isChecked(),false);}
});
test('official PDF writes text and evidence without flattening fields',async()=>{
 const values=automaticValues({p3w7:'Demo',p7w28:'2',p11w1:'Demo Example'},{applicationNumber:'ABC123',attachments:[{blobKey:'a',evidence:{A:['U.S. Passport']}}]});
 const bytes=await fillOriginal201(values,{},template),pdf=await PDFDocument.load(bytes),form=pdf.getForm();
 assert.equal(form.getTextField('p3w7').getText(),'Demo');assert.equal(form.getTextField('p7w28').getText(),'2');
 assert.equal(form.getTextField('p3w6').getText(),'ABC123');assert.ok(form.getCheckBox('p1w4').isChecked());assert.equal(form.getFields().length,573);
});
test('Case application number and evidence replace stale draft values',()=>{
 const values=automaticValues({p3w6:'old',p1w4:true},{applicationNumber:'new',attachments:[]});
 assert.equal(values.p3w6,'new');assert.equal(values.p8w5,'new');assert.equal(values.p1w4,false);
});
test('name changes sync duplicate fields while selective Profile updates preserve other edits',()=>{
 const values=updateOriginal({p3w7:'Demo',p3w8:'Old'},schema.fields.find(f=>f.key==='p3w8'),'New');
 assert.equal(values.p11w1,'Demo New');assert.equal(values.p12w1,'Demo New');
 const merged=applyProfile({...values,p3w10:'Edited address'},{name:'Other Person',address:'New address'},['name']);
 assert.equal(merged.p3w7,'Other');assert.equal(merged.p3w10,'Edited address');
});
test('radio groups are exclusive and invalid calendar dates are rejected',()=>{
 const peers=schema.fields.filter(f=>f.group==='citizenship');assert.ok(peers.length>1);
 const values=updateOriginal({[peers[0].key]:true},peers[1],true);
 assert.equal(values[peers[0].key],false);assert.equal(values[peers[1].key],true);
 assert.ok(validFormDate('02/29/2024'));assert.ok(validFormDate('2026-11-25'));
 assert.equal(validFormDate('02/30/2026'),false);assert.equal(validFormDate('2026-13-01'),false);
 assert.ok(originalIssues({p3w5:'2026-02-30'},{attachments:[]}).some(i=>i.key==='p3w5'));
});
test('export archive includes separate original IEP bytes and the main PDF',async()=>{
 const iep=new Blob(['original IEP file bytes']),pdf=new Blob(['main 201 bytes']);
 const archive=await buildCasePackage({id:'demo',form:'201',attachments:[{name:'IEP.pdf',title:'IEP',blobKey:'iep'}]},async(action,key)=>{assert.equal(action,'get');assert.equal(key,'iep');return iep},pdf);
 const data=new Uint8Array(await archive.arrayBuffer()),decoder=new TextDecoder(),entries={};
 for(let offset=0;offset<data.length;){const name=decoder.decode(data.slice(offset,offset+100)).split('\0')[0];if(!name)break;const size=parseInt(decoder.decode(data.slice(offset+124,offset+136)),8);entries[name]=decoder.decode(data.slice(offset+512,offset+512+size));offset+=512+Math.ceil(size/512)*512;}
 assert.equal(entries['application-201.pdf'],'main 201 bytes');assert.equal(entries['files/1-IEP.pdf'],'original IEP file bytes');
 assert.equal(JSON.parse(entries['manifest.json']).files[0].title,'IEP');
});
