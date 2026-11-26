import schema from './original201Schema.json' with {type:'json'};
// Reusable answers are copied values, never links to an older Case.
export const commonAnswerFields={firstName:'First name',lastName:'Last name',phone:'Phone',email:'Email',address:'Address',unit:'Unit',city:'City',state:'State',zip:'ZIP',county:'County',familySize:'Family size',annualIncome:'Annual family income',employment:'Employment status',language:'Primary language'};
const common201={firstName:'p3w7',lastName:'p3w8',phone:'p3w20',email:'p3w33',address:'p3w10',unit:'p3w11',city:'p3w12',state:'p3w13',zip:'p3w14',county:'p3w15',familySize:'p7w28',annualIncome:'p7w31'};
const forbidden=new Set([...Object.keys(schema.signingDates),...Object.values(schema.signingDates),'p3w1','p3w2','p3w3','p3w4','p3w5','p3w6','p8w1','p8w2','p8w3','p8w4','p8w5']);
const reusable201=new Set(schema.fields.filter(f=>!forbidden.has(f.key)&&f.type!=='Signature'&&f.page>2&&!/date|\bDOB\b|\bMM\b|\bDD\b|\bYYYY\b|signature/i.test(f.name)).map(f=>f.key));
export function prefillSources(cases=[]){
 return cases.filter(c=>['201','999'].includes(String(c.form))).map((record,index)=>({record,index,time:Date.parse(record.createdAt||record.applicationDate||record.enrollmentDate||'')||0})).sort((a,b)=>b.time-a.time||a.index-b.index).map(x=>x.record);
}
export function reusableAnswers(source){
 const values={...source.fields?.enrollmentEditor,...source.fields?.commonAnswers};
 if(source.fields?.original201)for(const [key,field] of Object.entries(common201))if(source.fields.original201[field]!==undefined)values[key]=source.fields.original201[field];
 return Object.fromEntries(Object.keys(commonAnswerFields).filter(key=>values[key]!==undefined).map(key=>[key,structuredClone(values[key])]));
}
export function prefillCase(target,source){
 if(!source)return target;
 const commonAnswers=reusableAnswers(source),fields={...target.fields,commonAnswers,prefillSource:{id:source.id,form:source.form},reviewed201:{}};
 if(String(target.form)==='201'){
  const original201=String(source.form)==='201'?Object.fromEntries(Object.entries(source.fields?.original201||{}).filter(([key])=>reusable201.has(key))):{};
  for(const [key,field] of Object.entries(common201))if(commonAnswers[key]!==undefined)original201[field]=commonAnswers[key];
  // Leave initialization to the editor so uncopied fields can come from Profile.
  fields.prefill201=original201;
 }
 return {...target,fields};
}
