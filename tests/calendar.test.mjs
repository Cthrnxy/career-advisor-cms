import test from 'node:test';
import assert from 'node:assert/strict';
import {completeAppointment,listAppointments,calendarTasks,monthDays,dateKey} from '../src/features/calendar/calendarModel.js';
test('completion records service exactly once without changing enrollment or appointment date',()=>{
 const client={cases:[{enrollmentDate:'2026-11-01'}],appointments:[{id:'a',date:'2026-11-20'}],visits:[]};
 const next=completeAppointment(client,'a','2026-11-25','  Resume help  ');
 assert.equal(next.appointments[0].date,'2026-11-20');assert.equal(next.appointments[0].completed,true);
 assert.deepEqual(next.visits,[{date:'2026-11-25',notes:'Resume help',appointmentId:'a'}]);assert.equal(next.cases,client.cases);
 assert.equal(completeAppointment(next,'a','2026-11-25','again'),next);
 assert.throws(()=>completeAppointment(client,'a','2026-11-25','   '));
});
test('appointments without time sort before timed appointments across clients',()=>{
 const items=listAppointments([{id:'x',name:'X',appointments:[{id:'a',date:'2026-12-01',time:'10:00'}]},{id:'y',name:'Y',appointments:[{id:'b',date:'2026-12-01',time:''}]}]);
 assert.deepEqual(items.map(a=>a.id),['b','a']);assert.equal(items[0].clientId,'y');
});
test('calendar uses actual follow-up quarter and leaves review tasks undated',()=>{
 const tasks=calendarTasks([{id:'x',cases:[{id:'draft'},{id:'enrolled',enrolled:true},{id:'exited',enrolled:true,form:'999',exit:{date:'2026-11-25'},followups:[]}]}]);
 assert.deepEqual(tasks.map(t=>t.date),[null,null,null]);assert.equal(tasks[2].dueDate,'2027-01-01');
});
test('month grid spans year boundaries with complete weeks',()=>{const days=monthDays(new Date(2027,0,1));assert.equal(days.length,42);assert.equal(days[0].getDay(),0);assert.equal(dateKey(days[0]),'2026-12-27');});

test('task plans are separate for each stage and preserve follow-up due dates',()=>{
 const r={id:'c',enrolled:true,form:'201',exit:{date:'2026-08-01'},followups:[],taskSchedule:{review:'2026-08-02','followup-0':'2026-11-26'}};
 const task=calendarTasks([{id:'x',cases:[r]}])[0];assert.equal(task.date,'2026-11-26');assert.equal(task.dueDate,'2026-10-01');
 const next=calendarTasks([{id:'x',cases:[{...r,followups:[{date:'2026-11-26',file:'proof.pdf'}]}]}])[0];assert.equal(next.date,null);assert.equal(next.dueDate,'2027-01-01');
});
