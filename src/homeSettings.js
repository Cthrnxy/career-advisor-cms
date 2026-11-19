/**
 * Local, per-browser homepage preferences.  Search and navigation remain always available,
 * and the Enrolled / Follow-up case preview limit remains five.
 */
export const HOME_MODULES=[
  {id:'quickAccess',name:'Quick Access',description:'Add clients, Ready for Enroll, and Exited Cases'},
  {id:'appointments',name:'Appointments',description:'Today’s scheduled client visits'},
  {id:'todo',name:'To-do',description:'Daily tasks and reminders'},
  {id:'enrolled',name:'Enrolled (Not Exited)',description:'Cases awaiting Exit (up to five)'},
  {id:'followup',name:'Follow-up',description:'Cases with a follow-up currently due (up to five)'}
];
export const DEFAULT_HOME_SETTINGS={
  order:HOME_MODULES.map(module=>module.id),
  hidden:[],
  density:'comfortable'
};
const IDS=HOME_MODULES.map(module=>module.id);
export function normalizeHomeSettings(raw){
  const order=Array.isArray(raw?.order)?raw.order.filter(id=>IDS.includes(id)):[];
  const unique=[...new Set(order)];
  const hidden=Array.isArray(raw?.hidden)?[...new Set(raw.hidden.filter(id=>IDS.includes(id)))]:[];
  return {order:[...unique,...IDS.filter(id=>!unique.includes(id))],hidden,density:raw?.density==='compact'?'compact':'comfortable'};
}
export function moveHomeModule(value,id,step){
  const next=normalizeHomeSettings(value);
  const start=next.order.indexOf(id);
  const target=start+(step===-1?-1:step===1?1:0);
  if(start<0||target<0||target>=next.order.length||target===start)return next;
  const order=[...next.order];
  [order[start],order[target]]=[order[target],order[start]];
  return {...next,order};
}
export function setHomeModuleVisible(value,id,visible){
  const next=normalizeHomeSettings(value);
  if(!IDS.includes(id))return next;
  return {...next,hidden:visible?next.hidden.filter(value=>value!==id):[...new Set([...next.hidden,id])]};
}
