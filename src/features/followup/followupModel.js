import {validDate} from '../case/activityExit.js';
import {followupCount,isFollowupComplete,getFollowupQuarterStart} from '../../caseWorkflow.js';
export const METHODS=['Phone','Text','Email','In Person','Other'];
export const RESULTS=['Reached','No Answer','Left Message','Invalid Contact','Other'];
export const EMPLOYMENT=['Employed','Not Employed','Unknown'];
const roundAt=(record,index)=>{if(!Number.isInteger(index)||index<0||index>=followupCount(record))throw Error('Invalid Follow-up round.');return record.followups?.[index]||{}};
const replaceRound=(record,index,round)=>{const followups=[...(record.followups||[])];while(followups.length<=index)followups.push({});followups[index]=round;return {...record,followups}};
export function roundStatus(round={}){if(isFollowupComplete(round))return 'Complete';if(round.date&&!round.file)return 'Missing File';return round.note||round.file||round.attempts?.length||round.employment?'Draft':'Pending';}
export function quarterLabel(record,index){const start=getFollowupQuarterStart(record.exit?.date,index);return start?`Q${Math.floor(start.getMonth()/3)+1} ${start.getFullYear()}`:'Awaiting Exit';}
export function saveRound(record,index,values,now=new Date().toISOString()){
 const before=roundAt(record,index);
 if(values.date&&!validDate(values.date))throw Error('Enter a valid completed date.');
 if(values.nextContactDate&&!validDate(values.nextContactDate))throw Error('Enter a valid next contact date.');
 if(!EMPLOYMENT.includes(values.employment||'Unknown'))throw Error('Choose employment status.');
 for(const key of ['hourlyWage','weeklyHours'])if(values[key]!==''&&values[key]!=null&&(!Number.isFinite(Number(values[key]))||Number(values[key])<0))throw Error('Wage and hours must be nonnegative numbers.');
 const file=values.file||'';
 if(file&&file!==before.file&&!record.attachments?.some(f=>f.name===file&&f.blobKey))throw Error('Choose an uploaded Case file.');
 if(file&&(record.followups||[]).some((r,i)=>i!==index&&r.file===file))throw Error('Each Follow-up round needs its own file.');
 const next={...before,...Object.fromEntries(['date','note','file','employment','employer','position','hourlyWage','weeklyHours','nextContactDate'].map(k=>[k,values[k]??'']))};
 const snapshot=round=>Object.fromEntries(Object.entries(round).filter(([k])=>k!=='history'));
 next.history=[...(before.history||[]),{at:now,action:'Saved',before:snapshot(before),after:snapshot(next)}];
 const updated=replaceRound(record,index,next);
 return {...updated,taskSchedule:{...record.taskSchedule,[`followup-${index}`]:isFollowupComplete(next)?null:next.nextContactDate||null}};
}
export function addAttempt(record,index,attempt,now=new Date().toISOString()){
 const before=roundAt(record,index);
 if(!validDate(attempt.date)||!METHODS.includes(attempt.method)||!RESULTS.includes(attempt.result))throw Error('Choose a valid date, contact method and result.');
 const next={...before,attempts:[...(before.attempts||[]),{id:crypto.randomUUID(),date:attempt.date,method:attempt.method,result:attempt.result,note:attempt.note||'',recordedAt:now}]};
 return replaceRound(record,index,next);
}
