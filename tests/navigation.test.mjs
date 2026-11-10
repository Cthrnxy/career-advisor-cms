import test from 'node:test';
import assert from 'node:assert/strict';
import {getTabId,getTabTitle} from '../src/layouts/navigation.js';
test('tab IDs are stable and isolate resource contexts',()=>{
  assert.equal(getTabId('Home'),'Home');
  assert.notEqual(getTabId('Client Detail','CL-1'),getTabId('Client Detail','CL-2'));
  assert.notEqual(getTabId('Case Detail','CL-1','201'),getTabId('Case Detail','CL-1','999'));
  assert.notEqual(getTabId('Case Detail','CL-1','201'),getTabId('Form Editor','CL-1','201'));
  assert.notEqual(getTabId('Case Detail','CL-1','201'),getTabId('Case Detail','CL-2','201'));
});
test('case and form workspace labels include the client name',()=>{
  assert.equal(getTabTitle('Home'),'Home');
  assert.equal(getTabTitle('Client Detail',{name:'Mei Chen'}),'Mei Chen');
  assert.equal(getTabTitle('Case Detail',{name:'Mei Chen'},{form:'201'}),'Mei Chen · 201 Case');
  assert.equal(getTabTitle('Form Editor',{name:'Mei Chen'},{form:'999'}),'Mei Chen · 999 Form');
});
