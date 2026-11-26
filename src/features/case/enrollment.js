import {caseReadiness} from './caseFiles.js';
export function recordApplicationNumber(record,applicationNumber){
 const number=String(applicationNumber||'').trim();
 if(number&&!record.exportedAt&&!record.enrolled)throw new Error('Complete and export the application before adding its application number.');
 if(record.enrolled&&!number)throw new Error('An Enrolled Case must retain its application number.');
 return {...record,applicationNumber:number,enrolled:Boolean(record.enrolled||(record.exportedAt&&number))};
}
export function recordSuccessfulExport(record,{artifactId,completed,official},now=new Date().toISOString()){
 if(!artifactId||!completed||!official)throw new Error('A completed official application export is required.');
 if(['201','999'].includes(String(record.form))&&caseReadiness(record).length)throw new Error('Case evidence and signatures are incomplete.');
 return {...record,exportedAt:now,exportArtifactId:artifactId};
}
