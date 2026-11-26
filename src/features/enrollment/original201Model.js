import {originalConsistencyIssues} from './original201Validation.js';
import schema from './original201Schema.json' with {type:'json'};
import {caseReadiness} from '../case/caseFiles.js';
export {schema};
export const profileKeys={name:['p1w1','p11w1','p12w1'],phone:['p3w20'],email:['p3w33'],address:['p3w10'],unit:['p3w11'],city:['p3w12'],state:['p3w13'],zip:['p3w14']};
export const profileSnapshot=client=>Object.fromEntries(Object.keys(profileKeys).map(k=>[k,client[k]||'']));
export function applyProfile(values,profile,keys=Object.keys(profileKeys)){
 const next={...values};for(const key of keys)for(const field of profileKeys[key])next[field]=profile[key]||'';
 if(keys.includes('name')){const [first,...last]=(profile.name||'').trim().split(/\s+/);next.p3w7=first||'';next.p3w8=last.join(' ')}return next;
}
export function initialOriginalValues(record,client){
 if(record.fields?.original201)return {...record.fields.original201};
 const old=record.fields?.enrollmentEditor||{};
 const next=applyProfile({},profileSnapshot(client));
 const map={firstName:'p3w7',lastName:'p3w8',phone:'p3w20',email:'p3w33',address:'p3w10',city:'p3w12',state:'p3w13',zip:'p3w14',county:'p3w15',familySize:'p2w2',annualIncome:'p2w3'};
 for(const [key,field] of Object.entries(map))if(old[key]!==undefined)next[field]=old[key];
 next.p3w1=old.agency||'SHE';next.p3w5=old.applicationDate||record.applicationDate||'';next.p8w4=next.p3w5;
 next.p3w6=record.applicationNumber||'';next.p8w5=next.p3w6;
 const eligibility={income:'p2w1',benefits:'p2w5',homeless:'p2w10',skills:'p2w11'};if(eligibility[old.adultEligibility])next[eligibility[old.adultEligibility]]=true;
 return next;
}
export const evidenceMap={
 'U.S. Passport':'p1w4','Permanent Resident Card (I-551)':'p1w5','Foreign passport with temporary I-551 stamp':'p1w6','Employment Authorization Document (I-766)':'p1w7',
 "Valid Driver's License or ID Card":'p1w10','Federal, state or local government ID':'p1w11','School ID card with photograph':'p1w12',"Voter's Registration Card":'p1w13',
 'Unrestricted Social Security Card':'p1w19','Certification of Birth Abroad':'p1w20','Original or certified U.S. birth certificate':'p1w21','U.S. Citizen ID Card (I-197)':'p1w23',
 'Foreign passport with Form I-94 or I-94A':'p1w8','Passport from Micronesia or Marshall Islands with Form I-94':'p1w9',
 'U.S. Military card or draft record':'p1w14','Military dependent ID card':'p1w15','U.S. Coast Guard Merchant Mariner card':'p1w16','Native American tribal document (List B)':'p1w17','Canadian driver license':'p1w18',
 'Native American tribal document (List C)':'p1w22','Resident Citizen ID Card (I-179)':'p1w24','DHS employment authorization document':'p1w25'
};
export function automaticValues(values,record){
 const next={...values,p1w2:true,p1w3:false,p3w2:true,p3w3:false,p3w4:false,p8w1:true,p8w2:false,p8w3:false,p3w6:record.applicationNumber||'',p8w5:record.applicationNumber||''};
 for(let i=4;i<=25;i++)next['p1w'+i]=false;
 for(const file of record.attachments||[])if(file.blobKey)for(const options of Object.values(file.evidence||{}))for(const option of options)if(evidenceMap[option])next[evidenceMap[option]]=true;
 const weeksField=schema.fields.find(f=>f.name==='63 never employed age x 52');const weeks=next[weeksField?.key];
 if(String(weeks??'').trim()!==''&&Number.isFinite(Number(weeks))&&Number(weeks)>=0)for(const f of schema.fields.filter(f=>f.name==='64 Unemployed for 27 or more weeks'))next[f.key]=f.on.startsWith(Number(weeks)>=27?'Yes':'No');
 return next;
}
export function updateOriginal(values,field,value){
 const next={...values,[field.key]:value};
 if(field.group&&value)for(const peer of schema.fields.filter(f=>f.group===field.group&&f.key!==field.key))next[peer.key]=false;
 if(field.multi&&value)for(const peer of schema.fields.filter(f=>f.multi===field.multi&&f.key!==field.key&&(field.exclusive||f.exclusive)))next[peer.key]=false;
 if(['p2w1','p2w5','p2w10','p2w11'].includes(field.key)&&value)for(const k of ['p2w1','p2w5','p2w10','p2w11'])if(k!==field.key)next[k]=false;
 if(['p3w7','p3w8'].includes(field.key)){const name=[next.p3w7,next.p3w8].filter(Boolean).join(' ');for(const key of profileKeys.name)next[key]=name;}
 const shared=schema.shared[field.key];if(shared)for(const [k,v] of Object.entries(schema.shared))if(v===shared)next[k]=value;
 return next;
}
export function originalIssues(values,record,reviewed={}){
 const issues=originalConsistencyIssues(values);const add=(key,message)=>{const field=schema.fields.find(f=>f.key===key);issues.push({key,page:field?.page||1,message})};
 const need=(key,label)=>{if(!String(values[key]??'').trim())add(key,`${label} is required.`)};
 for(const [key,label] of [['p3w7','First name'],['p3w8','Last name'],['p3w9','SSN'],['p3w10','Residential address'],['p3w12','City'],['p3w13','State'],['p3w14','ZIP'],['p3w5','Application date']])need(key,label);
 if(!values.p3w20&&!values.p3w33)add('p3w20','Enter a phone number or email.');
 if(!schema.fields.some(f=>f.group==='citizenship'&&values[f.key]))add(schema.fields.find(f=>f.group==='citizenship')?.key,'Choose citizenship.');
 if(!['p2w1','p2w5','p2w10','p2w11'].some(k=>values[k]))add('p2w1','Choose an Adult eligibility option.');
 if(values.p2w1){need('p2w2','Family size');need('p2w3','Annual family income')}
 if(!schema.fields.some(f=>f.page===1&&f.name.startsWith('II ')&&values[f.key]))add('p1w26','Select Selective Service evidence or exemption.');
 for(const missing of caseReadiness(record))add('p1w4',`Case is missing ${missing}.`);
 for(const file of record.attachments||[])for(const options of Object.values(file.evidence||{}))for(const option of options)if(!evidenceMap[option])add('p1w4',`Choose a specific evidence type instead of “${option}”.`);
 for(const key of [...Object.values(schema.signingDates),'p3w5'])if(values[key]&&!validFormDate(values[key]))add(key,'Enter a valid date using MM/DD/YYYY or YYYY-MM-DD.');
 for(const f of schema.fields.filter(f=>f.type==='Signature'))if(values['apply-'+f.key]){if(!record.signatureFiles?.[f.role]?.blobKey)add(f.key,'Select a saved signature for this role.');const dateKey=schema.signingDates[f.key];if(dateKey)need(dateKey,'Signing date');}
 for(let p=1;p<=12;p++)if(!reviewed[p])issues.push({page:p,key:'review-'+p,message:`Review all applicable fields on ${schema.titles[p-1]}.`});
 return issues;
}

export function validFormDate(value){
 const text=String(value).trim();let year,month,day;
 if(/^\d{4}-\d{2}-\d{2}$/.test(text))[year,month,day]=text.split('-').map(Number);
 else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text))[month,day,year]=text.split('/').map(Number);
 else return false;
 const date=new Date(Date.UTC(year,month-1,day));return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
}
