import {firstIncompleteFollowup,getFollowupQuarterStart} from '../../caseWorkflow.js';
export const dateKey=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
export const listAppointments=clients=>clients.flatMap(c=>(c.appointments||[]).map(a=>({...a,clientId:c.id,name:c.name}))).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||''));
export function calendarTasks(clients){return clients.flatMap(c=>(c.cases||[]).flatMap(r=>{
 if(!r.enrolled)return [{id:r.id,clientId:c.id,record:r,name:c.name,taskKey:'prepare',label:'Prepare enrollment',date:r.taskSchedule?.prepare||null}];
 if(!r.exit?.date)return [{id:r.id,clientId:c.id,record:r,name:c.name,taskKey:'review',label:'Review enrolled case',date:r.taskSchedule?.review||null}];
 const i=firstIncompleteFollowup(r),d=i<0?null:getFollowupQuarterStart(r.exit.date,i);
 return d?[{id:r.id,clientId:c.id,record:r,name:c.name,taskKey:`followup-${i}`,label:`Follow-up ${i+1}`,dueDate:dateKey(d),date:r.taskSchedule?.[`followup-${i}`]||null}]:[];
}));}
export function completeAppointment(client,id,date,notes){
 if(!date||!notes.trim())throw new Error('Service date and comment are required.');
 const a=(client.appointments||[]).find(a=>a.id===id);
 if(!a||a.completed)return client;
 return {...client,appointments:client.appointments.map(a=>a.id===id?{...a,completed:true,completedDate:date}:a),visits:[...(client.visits||[]),{date,notes:notes.trim(),appointmentId:id}]};
}
export function monthDays(month){const first=new Date(month.getFullYear(),month.getMonth(),1);first.setDate(1-first.getDay());return Array.from({length:42},(_,i)=>new Date(first.getFullYear(),first.getMonth(),first.getDate()+i));}
