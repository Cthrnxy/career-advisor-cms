// Quarter-aligned case scheduling for the synthetic Career Advisor CMS prototype.
// Start each follow-up in the NEXT calendar quarter after the exit quarter.
// Each round is complete only when both a completed date and its independent file exist.
export const followupCount=record=>String(record?.form)==='201'?4:1;
export const isFollowupComplete=round=>Boolean(round?.date && round?.file);
export function firstIncompleteFollowup(record){
  for(let i=0;i<followupCount(record);i++){
    if(!isFollowupComplete((record?.followups||[])[i]))return i;
  }
  return -1;
}
export function getFollowupQuarterStart(exitDate,index){
  if(typeof exitDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(exitDate)||!Number.isInteger(index)||index<0)return null;
  const [y,m,d]=exitDate.split('-').map(Number);
  const date=new Date(y,m-1,d);
  if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return null;
  return new Date(y,(Math.floor((m-1)/3)+index+1)*3,1);
}
export function getCurrentFollowup(record,now=new Date()){
  if(!record?.enrolled||!record?.exit?.date)return null;
  const index=firstIncompleteFollowup(record);
  if(index<0)return null;
  const start=getFollowupQuarterStart(record.exit.date,index);
  if(!start)return null;
  const date=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(date<start)return null;
  return {index,round:index+1,start,overdue:date>=new Date(start.getFullYear(),start.getMonth()+3,1)};
}
export function getCaseStatus(record){
  if(!record?.enrolled)return 'Draft';
  if(!record?.exit?.date)return 'Enrolled';
  const index=firstIncompleteFollowup(record);
  return index===-1?'Complete':'Follow-up '+(index+1);
}
export function enrolledCases(clients){
  return clients.flatMap(client=>(client.cases||[])
    .filter(record=>record.enrolled&&!record.exit?.date)
    .map(record=>({client,record})))
    .sort((a,b)=>(b.record.enrollmentDate||'').localeCompare(a.record.enrollmentDate||''));
}
export function dueFollowupCases(clients,now=new Date()){
  return clients.flatMap(client=>(client.cases||[]).map(record=>{
    const due=getCurrentFollowup(record,now);
    return due?{client,record,...due}:null;
  }).filter(Boolean))
    .sort((a,b)=>a.start-b.start||a.client.name.localeCompare(b.client.name));
}
