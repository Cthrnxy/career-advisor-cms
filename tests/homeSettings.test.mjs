import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_HOME_SETTINGS,HOME_MODULES,normalizeHomeSettings,moveHomeModule,setHomeModuleVisible} from '../src/homeSettings.js';

test('homepage preferences default to existing five modules, order, and comfortable spacing',()=>{
 const prefs=normalizeHomeSettings();
 assert.deepEqual(prefs,DEFAULT_HOME_SETTINGS);
 assert.equal(prefs.order.length,HOME_MODULES.length);
});
test('settings can hide modules, show them again, and persist order independently of visibility',()=>{
 let prefs=normalizeHomeSettings();
 prefs=setHomeModuleVisible(prefs,'followup',false);
 assert.deepEqual(prefs.hidden,['followup']);
 prefs=moveHomeModule(prefs,'followup',-1);
 assert.deepEqual(prefs.order,['quickAccess','appointments','todo','followup','enrolled']);
 assert.deepEqual(prefs.hidden,['followup']);
 prefs=setHomeModuleVisible(prefs,'followup',true);
 assert.deepEqual(prefs.hidden,[]);
});
test('invalid and stale settings are normalized and missing modules restored',()=>{
 const prefs=normalizeHomeSettings({order:['followup','random','followup'],hidden:['todo','not-real'],density:'unknown'});
 assert.deepEqual(prefs.order,['followup','quickAccess','appointments','todo','enrolled']);
 assert.deepEqual(prefs.hidden,['todo']);
 assert.equal(prefs.density,'comfortable');
 assert.deepEqual(normalizeHomeSettings({density:'compact'}).density,'compact');
});
test('moving boundary or unknown widgets does not corrupt preferences',()=>{
 const prefs=normalizeHomeSettings();
 assert.deepEqual(moveHomeModule(prefs,'quickAccess',-1),prefs);
 assert.deepEqual(moveHomeModule(prefs,'nonexistent',1),prefs);
 assert.deepEqual(setHomeModuleVisible(prefs,'nonexistent',false),prefs);
});
