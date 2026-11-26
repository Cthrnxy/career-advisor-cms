import {fileStore} from '../documents/fileStore.js';
export async function copyCaseFile(file){
 if(!file.blobKey)throw new Error('Replace this filename-only demo entry with an uploaded file first.');
 const blob=await fileStore('get',file.blobKey);
 if(!blob)throw new Error('File content is missing. Upload it in Profile again.');
 const id=crypto.randomUUID();await fileStore('put',id,blob);
 return {...structuredClone(file),id,blobKey:id,name:id+'-'+file.name,sourceId:file.id||file.name,copiedAt:new Date().toISOString()};
}
export function evidenceValues(files=[]){
 const groups={A:[],B:[],C:[]};
 for(const file of files.filter(f=>f.blobKey))for(const key of Object.keys(groups))groups[key].push(...(file.evidence?.[key]||[]));
 return {workRoute:groups.A.length?'A':groups.B.length||groups.C.length?'BC':'',listA:groups.A[0]||'',listB:groups.B[0]||'',listC:groups.C[0]||''};
}
export const caseFileKey=file=>file.id||file.blobKey||file.name;
export function assignedCaseFile(record,role){
 const key=record.evidenceAssignments?.[role];
 return key?(record.attachments||[]).find(file=>caseFileKey(file)===key&&file.blobKey):undefined;
}
export function caseReadiness(record){
 const missing=[];
 if(String(record.form)==='999'){
  if(!assignedCaseFile(record,'ID'))missing.push('CA-selected ID');
  if(!assignedCaseFile(record,'IEP'))missing.push('IEP');
  for(const role of ['Client Signature','CA Signature'])if(!record.signatureFiles?.[role]?.blobKey)missing.push(role);
 }else{
  const evidence=evidenceValues(record.attachments);
  if(!evidence.listA&&!(evidence.listB&&evidence.listC))missing.push('List A or List B + List C');
  if(!record.signatureFiles?.['Client Signature']?.blobKey)missing.push('Client Signature');
  if(!record.signatureFiles?.['Employer Signature']?.blobKey&&!assignedCaseFile(record,'EV'))missing.push('Employer Signature or Employment Verification');
 }
 return missing;
}
