import test from 'node:test';
import assert from 'node:assert/strict';
import {getRouteId,getRouteLabel,getBreadcrumbs,pushNavigationHistory} from '../src/layouts/navigation.js';

test('route IDs distinguish cases, forms and clients without creating tabs',()=>{
  assert.equal(getRouteId('Home'),'Home');
  assert.notEqual(getRouteId('Client Detail','CL-1'),getRouteId('Client Detail','CL-2'));
  assert.notEqual(getRouteId('Case Detail','CL-1','201'),getRouteId('Case Detail','CL-1','999'));
  assert.notEqual(getRouteId('Case Detail','CL-1','201'),getRouteId('Form Editor','CL-1','201'));
  assert.notEqual(getRouteId('Case Detail','CL-1','201'),getRouteId('Case Detail','CL-2','201'));
});
test('breadcrumbs always express client, enrollment case, and follow-up structure',()=>{
  const client={id:'CL-1024',name:'Mei Chen'};
  const record={id:'case-201',form:'201'};
  assert.deepEqual(getBreadcrumbs('Home',client,record),[]);
  assert.deepEqual(getBreadcrumbs('Client Detail',client,record).map(x=>x.label),['Home','Clients','Mei Chen']);
  assert.deepEqual(getBreadcrumbs('Case Detail',client,record).map(x=>x.label),['Home','Clients','Mei Chen','201 Case']);
  assert.deepEqual(getBreadcrumbs('Form Editor',client,record).map(x=>x.label),['Home','Clients','Mei Chen','201 Case','Enrollment Form']);
  assert.deepEqual(getBreadcrumbs('Follow-ups',client,record).map(x=>x.label),['Home','Follow-up Cases']);
  assert.equal(getBreadcrumbs('Case Detail',client,record)[1].screen,'Clients');
  assert.equal(getBreadcrumbs('Case Detail',client,record)[2].screen,'Client Detail');
  assert.equal(getBreadcrumbs('Case Detail',client,record)[3].caseId,'case-201');
});
test('back history stores the actual prior screen regardless of breadcrumb hierarchy',()=>{
 const prior={screen:'Home',clientId:'CL-1024',caseId:'case-201'};
 const h=pushNavigationHistory([],prior);
 assert.deepEqual(h,[prior]);
 const list=pushNavigationHistory(h,{screen:'Follow-ups',clientId:'CL-1024',caseId:'case-201'});
 assert.equal(list.at(-1).screen,'Follow-ups');
 assert.equal(getRouteLabel(list.at(-1)),'Follow-up Cases');
 assert.equal(getRouteLabel({screen:'Case Detail'}, {name:'Mei Chen'},{form:'201'}),'201 Case');
 assert.equal(pushNavigationHistory(Array.from({length:40},(_,i)=>({screen:'p'+i})),prior).length,40);
});
