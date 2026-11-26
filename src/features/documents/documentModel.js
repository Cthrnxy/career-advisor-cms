export const documentId=(d,i)=>d.id||`legacy-${i}`;
export function changeDocuments(client,docs,oldFile,newFile){
 const rename=oldFile&&oldFile.name!==newFile?.name;
 return {...client,docs,cases:rename?(client.cases||[]).map(r=>({...r,exit:r.exit?{...r.exit,evidence:r.exit.evidence===oldFile.name?(newFile?.name||''):r.exit.evidence}:r.exit,followups:(r.followups||[]).map(f=>({...f,file:f.file===oldFile.name?(newFile?.name||''):f.file}))})):client.cases};
}
export const newestDocuments=docs=>docs.map((d,index)=>({...d,index})).sort((a,b)=>(b.uploadedAt||'').localeCompare(a.uploadedAt||'')||b.index-a.index);
export function validateFile(file){if(!file||!file.size)throw new Error('Select a non-empty file.');if(file.size>32*1024*1024)throw new Error('Maximum file size is 32 MB.');}
