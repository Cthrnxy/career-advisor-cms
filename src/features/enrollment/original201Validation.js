import schema from './original201Schema.json' with {type:'json'};
// Ported from the original CMS master_201 validation, scoped to the 12-page Adult packet.
export function originalConsistencyIssues(values){
 const issues=[],fields=schema.fields;
 const matching=name=>fields.filter(f=>f.name===name);
 const present=name=>matching(name).some(f=>values[f.key]);
 const text=name=>String(values[matching(name)[0]?.key]??'').trim();
 const choice=name=>matching(name).find(f=>values[f.key])?.on||'';
 const add=(name,message)=>{const f=matching(name)[0];if(f)issues.push({key:f.key,page:f.page,message})};
 const expect=(name,value)=>{if(!choice(name).startsWith(value))add(name,`${name}: select ${value}.`)};
 const noDetails=(pattern,label)=>{for(const f of fields.filter(f=>pattern.test(f.name)&&values[f.key]))issues.push({key:f.key,page:f.page,message:`Clear this answer: ${label}.`})};
 if(present('Option 4 Basic Skills Deficient'))expect('100 English language learner','Yes');
 const language=choice('100 English language learner');if(language.startsWith('Yes')||language.startsWith('No'))expect('101 Basic skills deficient',language.startsWith('Yes')?'Yes':'No');
 if(present('38 No skip to 54'))noDetails(/^38[a-i]\b/,'disability status is No');
 if(present('39 No answer No for 40 and 42 continue to next section')){expect('40 Eligible migrant and seasonal farmworker as defined in WIOA Sec 167i','No');if(!present('42 No_8'))add('42 No_8','Question 42 must be No when question 39 is No.');}
 if(present('43 No skip to next section')){for(const f of fields.filter(f=>f.page===4&&/^(4[4-9]|5\d|6[01])\b/.test(f.name)&&values[f.key]))issues.push({key:f.key,page:f.page,message:'Clear veteran details when veteran status is No.'});if(!present('54 No_72'))add('54 No_72','Question 54 must be No when veteran status is No.');}
 const employed=present('62 Employed')||present('62 Employed but received notice of termination of employment or'),unemployed=present('62 Not Employed');
 if(unemployed&&!choice('66 If employed are you underemployed').toLowerCase().includes('not'))add('66 If employed are you underemployed','Choose Not Applicable when not employed.');
 if(employed){if(text('63 never employed age x 52')!=='0')add('63 never employed age x 52','Question 63 must be 0 when employed.');expect('64 Unemployed for 27 or more weeks','No');if(!present('67 Not Applicable_3'))add('67 Not Applicable_3','Question 67 must be Not Applicable when employed.');}
 if(unemployed&&!present('67 No Neither Claimant nor Exhaustee'))add('67 No Neither Claimant nor Exhaustee','Choose Neither Claimant nor Exhaustee when not employed.');
 if(employed||unemployed)expect('72 If working does your job lack opportunity to advance or have a wage gain',employed?'Yes':'No');
 const weeks=text('63 never employed age x 52');if(weeks){if(!Number.isFinite(Number(weeks))||Number(weeks)<0)add('63 never employed age x 52','Enter nonnegative weeks unemployed.');else {expect('64 Unemployed for 27 or more weeks',Number(weeks)>=27?'Yes':'No');expect('105 Poor work history',Number(weeks)>=13?'Yes':'No');}}
 for(const [control,pattern] of [['70 UI Claimant has been exempted from work search',/^71 /],['73 Received a termination or layoff notice',/^(74|75) /],['76 Did you attend a Rapid Response orientation',/^(77|78) /]])if(choice(control).startsWith('No'))noDetails(pattern,`${control.split(' ')[0]} is No`);
 if(present('92 Not attending school HS Graduate or has a recognized equivalent')){if(!present('93 12th Grade'))add('93 12th Grade','Choose 12th Grade for the selected school status.');expect('95 High School Diploma or equivalent received','Yes');}
 for(const [control,dependent] of [['133 CalWORKS/TANF','134 Not applicable'],['139 Receiving Refugee Cash Assistance RCA','140 Not applicable_2'],['141 Receiving General Assistance GA','142 Not applicable_3']])if(choice(control).startsWith('No')&&!present(dependent))add(dependent,'Choose Not Applicable for this recipient type.');
 if(present('112 NA')&&['112 Gang member','112 Gang involved','112 At risk of gang involvement'].some(present))add('112 NA','N/A cannot be combined with another gang involvement answer.');
 const family=text('148 Family Size'),income=text('150 Annual family income');
 if(family&&income){const count=Number(family),amount=Number(income.replace(/[$,\s]/g,''));if(!Number.isInteger(count)||count<1||!Number.isFinite(amount)||amount<0)add('148 Family Size','Enter a valid family size and nonnegative income.');else {const limits=[16016,26243,36018,44464,52473,61370];expect('151 Low income',amount<=(count<=6?limits[count-1]:61370+(count-6)*8897)?'Yes':'No');}}
 const validateParts=(names,required=false)=>{const parts=names.map(text);if(!parts.some(Boolean)&&!required)return;if(!parts.every(Boolean)){add(names[0],'Enter the complete date.');return}const [m,d,y]=parts.map(Number),date=new Date(y,m-1,d);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d){add(names[0],'Enter a valid calendar date.');return}return date};
 if(present('29 AlienRefugee Lawfully Admitted to US Complete 30  31')||present('29 US Permanent Resident Complete 30  31')){if(!text('30 Alien registration number USCIS'))add('30 Alien registration number USCIS','USCIS registration number is required.');validateParts(['31 USCIS exp date MM','31 USCIS exp date DD','31 USCIS exp date YYYY'],true);}
 const dob=validateParts(['24 DOB MM','24 DOB DD','24 DOB YYYY']);if(dob){const now=new Date();if(dob>now)add('24 DOB MM','Date of birth cannot be in the future.');const age=now.getFullYear()-dob.getFullYear()-Number(now.getMonth()<dob.getMonth()||(now.getMonth()===dob.getMonth()&&now.getDate()<dob.getDate()));if(text('24a Age')&&Number(text('24a Age'))!==age)add('24a Age','Age must match date of birth.');}
 for(const [control,detail] of [['14 Other_0','14 undefined_0'],['26 Not Listed Please specify_2','26 Not Listed Please specify Reasoning'],['27 Not Listed Please specify','27 undefined_2']])if(present(control)&&!text(detail))add(detail,'Describe the option that is not listed.');
 for(const [control,group] of [['34 Asian','asian_ethnicity'],['34 HawaiianOther Pacific Islander','pacific_ethnicity']])if(present(control)&&!fields.some(f=>f.group===group&&values[f.key]))add(control,'Choose the corresponding ethnicity.');
 for(const group of new Set(fields.map(f=>f.group).filter(Boolean))){const selected=fields.filter(f=>f.group===group&&values[f.key]);if(selected.length>1)add(selected[0].name,'Choose only one answer for '+selected[0].groupLabel+'.');}
 return issues;
}
