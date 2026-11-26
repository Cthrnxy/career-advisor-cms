import {PDFDocument,StandardFonts} from 'pdf-lib';
import schema from './original201Schema.json' with {type:'json'};
import {fileStore} from '../documents/fileStore.js';
let templatePromise;
export async function templateBytes(){
 if(!templatePromise)templatePromise=fetch('/templates/201-blank.pdf').then(r=>{if(!r.ok)throw new Error('Could not load the blank 201 template.');return r.arrayBuffer()}).catch(e=>{templatePromise=null;throw e});
 return templatePromise;
}
export async function fillOriginal201(values,record,sourceBytes,read=fileStore){
 const doc=await PDFDocument.load(sourceBytes||await templateBytes());const form=doc.getForm(),font=await doc.embedFont(StandardFonts.Helvetica);
 for(const field of schema.fields){
  const value=values[field.key];
  if(field.type==='Text'){
   const target=form.getTextField(field.key);target.setText(String(value??''));
   const height=field.rect[3]-field.rect[1],width=field.rect[2]-field.rect[0]-4;
   const textWidth=Math.max(1,...String(value??'').split(/\r?\n/).map(line=>font.widthOfTextAtSize(line,1)));
   target.setFontSize(Math.min(10,Math.max(4,Math.min(height*.65,width/textWidth))));
  }else if(['CheckBox','RadioButton'].includes(field.type)){
   const target=form.getCheckBox(field.key);value?target.check():target.uncheck();
  }else if(field.type==='Signature'&&values['apply-'+field.key]){
   const file=record.signatureFiles?.[field.role];if(!file?.blobKey)throw new Error(`Missing ${field.role}.`);
   const blob=await read('get',file.blobKey);if(!blob)throw new Error(`Signature content is unavailable: ${field.role}.`);
   const data=await blob.arrayBuffer();const img=blob.type==='image/jpeg'?await doc.embedJpg(data):await doc.embedPng(data);
   const page=doc.getPage(field.page-1),[x,y,right,bottom]=field.rect;const dims=img.scaleToFit(right-x,bottom-y);
   page.drawImage(img,{x,y:page.getHeight()-bottom,width:dims.width,height:dims.height});
  }
 }
 form.updateFieldAppearances(font);return doc.save();
}
