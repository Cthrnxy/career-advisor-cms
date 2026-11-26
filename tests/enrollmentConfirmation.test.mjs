import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmEnrollment} from '../src/features/case/enrollment.js';
test('enrollment permits no documents or signatures and preserves independent records',()=>{
 const record={form:'999',enrolled:false,applicationDate:'2026-11-01',activities:[],followups:[],exit:null,fields:{}};
 const next=confirmEnrollment(record,' IHSS ','2026-11-12');
 assert.equal(next.enrolled,true);assert.equal(next.program,'IHSS');assert.equal(next.enrollmentDate,'2026-11-12');
 assert.equal(next.applicationDate,record.applicationDate);assert.deepEqual(next.activities,[]);assert.equal(record.enrolled,false);
});
test('enrollment requires explicit valid date and program',()=>{
 for(const date of ['',undefined,'2026-02-30','invalid'])assert.throws(()=>confirmEnrollment({},'IHSS',date),/valid enrollment date/);
 assert.throws(()=>confirmEnrollment({},'  ','2026-11-12'),/Program/);
});
