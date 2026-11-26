import {activityTasks} from '../case/activityExit.js';
import {firstIncompleteFollowup,getFollowupQuarterStart,followupCount,isFollowupComplete} from '../../caseWorkflow.js';
export const dateKey=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
export const listAppointments=clients=>clients.flatMap(c=>(c.appointments||[]).map(a=>({...a,clientId:c.id,name:c.name}))).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||''));
export function calendarTasks(clients){return clients.flatMap(c=>(c.cases||[]).flatMap(r=>{
 if(!r.enrolled)return [{id:r.id,clientId:c.id,record:r,name:c.name,taskKey:'prepare',label:'Prepare enrollment',date:r.taskSchedule?.prepare||null}];
 if(!r.exit?.date)return [{id:r.id,clientId:c.id,record:r,name:c.name,taskKey:'review',label:r.exitDraft?'Finish Exit draft':'Review enrolled case',date:r.taskSchedule?.review||null},...activityTasks(r).map(t=>({id:r.id,clientId:c.id,record:r,name:c.name,taskKey:t.key,label:'Complete '+t.type,date:r.taskSchedule?.[t.key]||null}))];
 const i=firstIncompleteFollowup(r);
 return Array.from({length:followupCount(r)},(_,index)=>index).filter(index=>!isFollowupComplete(r.followups?.[index])&&(index===i||r.taskSchedule?.[`followup-${index}`])).flatMap(index=>{const start=getFollowupQuarterStart(r.exit.date,index);return start?[{id:r.id,clientId:c.id,record:r,name:c.name,taskKey:`followup-${index}`,label:`Follow-up ${index+1}`,dueDate:dateKey(start),date:r.taskSchedule?.[`followup-${index}`]||null}]:[]});
}));}
export function completeAppointment(client,id,date,notes){
 if(!date||!notes.trim())throw new Error('Service date and comment are required.');
 const a=(client.appointments||[]).find(a=>a.id===id);
 if(!a||a.completed)return client;
 return {...client,appointments:client.appointments.map(a=>a.id===id?{...a,completed:true,completedDate:date}:a),visits:[...(client.visits||[]),{date,notes:notes.trim(),appointmentId:id}]};
}
export function monthDays(month){const first=new Date(month.getFullYear(),month.getMonth(),1);first.setDate(1-first.getDay());return Array.from({length:42},(_,i)=>new Date(first.getFullYear(),first.getMonth(),first.getDate()+i));}
