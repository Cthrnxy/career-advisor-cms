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
export function caseReadiness(record){
 const evidence=evidenceValues(record.attachments);
 const missing=[];
 if(!evidence.listA&&!(evidence.listB&&evidence.listC))missing.push('List A or List B + List C');
 for(const role of ['Client Signature','Employer Signature'])if(!record.signatureFiles?.[role]?.blobKey)missing.push(role);
 return missing;
}
