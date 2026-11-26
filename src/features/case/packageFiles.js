import {fileStore} from '../documents/fileStore.js';
// A standard uncompressed TAR keeps every Case-owned binary intact.
export function tarHeader(name,size){
 const bytes=new Uint8Array(512),encoder=new TextEncoder();
 const put=(offset,value,length)=>bytes.set(encoder.encode(value).slice(0,length),offset);
 put(0,name,100);put(100,'0000644\0',8);put(108,'0000000\0',8);put(116,'0000000\0',8);
 put(124,size.toString(8).padStart(11,'0')+'\0',12);put(136,'00000000000\0',12);
 bytes.fill(32,148,156);bytes[156]=48;put(257,'ustar\0',6);put(263,'00',2);
 const sum=bytes.reduce((a,b)=>a+b,0);put(148,sum.toString(8).padStart(6,'0')+'\0 ',8);return bytes;
}
export async function buildCasePackage(record,read=fileStore,applicationPdf=null){
 const files=[...(record.attachments||[]),...Object.values(record.signatureFiles||{}).filter(Boolean)];
 const chunks=[],manifest=[];
 if(applicationPdf){chunks.push(tarHeader('application-201.pdf',applicationPdf.size),applicationPdf,new Uint8Array((512-applicationPdf.size%512)%512));}
 for(const [i,file] of files.entries()){
  if(!file.blobKey)throw new Error('An attachment has no file content. Replace it before packaging.');
  const blob=await read('get',file.blobKey);if(!blob)throw new Error('An attachment is missing in this browser.');
  const name=`files/${i+1}-${(file.name||'document').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-75)}`;
  chunks.push(tarHeader(name,blob.size),blob,new Uint8Array((512-blob.size%512)%512));
  manifest.push({path:name,title:file.title||file.kind,evidence:file.evidence||{}});
 }
 const json=new Blob([JSON.stringify({caseId:record.id,form:record.form,applicationNumber:record.applicationNumber,files:manifest},null,2)]);
 chunks.push(tarHeader('manifest.json',json.size),json,new Uint8Array((512-json.size%512)%512),new Uint8Array(1024));
 return new Blob(chunks,{type:'application/x-tar'});
}
