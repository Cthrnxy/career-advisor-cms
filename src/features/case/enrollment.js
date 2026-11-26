export function confirmEnrollment(record,program,enrollmentDate){
 const cleanProgram=String(program||'').trim();
 if(!cleanProgram)throw new Error('Program is required.');
 const date=String(enrollmentDate||'');
 const parsed=new Date(`${date}T00:00:00Z`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)throw new Error('Choose a valid enrollment date.');
 return {...record,program:cleanProgram,enrollmentDate:date,enrolled:true};
}
