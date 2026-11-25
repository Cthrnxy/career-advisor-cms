import test from 'node:test';
import assert from 'node:assert/strict';
import {matchingClients,phoneKey} from '../src/features/calendar/clientMatching.js';
const clients=[{id:'1',name:'Lihua Zhang',phone:'(415) 555-0123'},{id:'2',name:'Linda Zhang',phone:'415-555-0999'},{id:'3',name:'Other Person',phone:'+1 415 555 0123'}];
test('name suggestions tolerate a typo and partial names',()=>{assert.equal(matchingClients(clients,'Lihau','').length,0);assert.equal(matchingClients(clients,'Lihua Zhan','')[0].client.id,'1');assert.equal(matchingClients(clients,'Zhang','').length,2)});
test('formatted US numbers normalize and shared numbers keep multiple choices',()=>{assert.equal(phoneKey('+1 (415) 555-0123'),'4155550123');assert.deepEqual(matchingClients(clients,'','4155550123').map(x=>x.client.id),['1','3']);assert.equal(matchingClients(clients,'','').length,0)});
