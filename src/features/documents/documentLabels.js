export const PRIMARY_DOCUMENTS=['Photo ID','Work Permit','Green Card'];
export const documentTitle=file=>{
 if(file.title)return file.title;
 if(file.kind==='Photo ID')return 'ID';
 if(file.kind==='Work Permit')return 'Work Permit';
 if(file.kind==='Green Card')return 'Green Card';
 if(file.kind==='Green Card / Work Permit')return /green/i.test(file.name||'')?'Green Card':/permit|work/i.test(file.name||'')?'Work Permit':'Work Permit / Green Card';
 return file.title||file.label||file.kind||'Untitled document';
};
export const isPrimary=kind=>PRIMARY_DOCUMENTS.includes(kind)||kind==='Green Card / Work Permit';
export const documentIcon=file=>file.kind?.includes('Signature')?'✒':file.kind==='Photo ID'?'▣':file.kind?.includes('Green Card')?'▤':file.kind==='Work Permit'?'▥':file.mime==='application/pdf'||file.name?.toLowerCase().endsWith('.pdf')?'▧':'▦';
