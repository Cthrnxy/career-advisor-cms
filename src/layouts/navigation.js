/**
 * One current workspace, not browser-style multi-tab navigation.
 * Breadcrumbs describe the information hierarchy rather than pretending the
 * user must have visited every parent.  "Back" follows actual workspace history.
 */
export function getRouteId(screen,clientId,caseId){
 if(screen==='Client Detail')return 'client:'+clientId;
 if(screen==='Case Detail')return 'case:'+clientId+':'+caseId;
 if(screen==='Form Editor')return 'form:'+clientId+':'+caseId;
 return screen;
}
export function getRouteLabel(route,client,record){
 if(!route)return 'Home';
 switch(route.screen){
  case 'Home': return 'Home';
  case 'Client Detail':return client?.name||'Client Profile';
  case 'Case Detail':return (record?.form||'Enrollment')+' Case';
  case 'Form Editor':return (record?.form||'Enrollment')+' Form';
  case 'Enroll Clients':return 'Ready for Enroll';
  case 'Follow-ups':return 'Follow-up Cases';
  case 'Enrolled Cases':return 'Enrolled Cases';
  default:return route.screen||'Home';
 }
}
export function getBreadcrumbs(screen,client,record){
 const home={label:'Home',screen:'Home'};
 const name=client?.name||'Client Profile';
 const clientsItem={label:'Clients',screen:'Clients'};
 const clientItem={label:name,screen:'Client Detail',clientId:client?.id};
 const caseItem={label:(record?.form||'Enrollment')+' Case',screen:'Case Detail',clientId:client?.id,caseId:record?.id};
 if(screen==='Home')return [];
 if(screen==='Client Detail')return [home,clientsItem,clientItem];
 if(screen==='Case Detail')return [home,clientsItem,clientItem,caseItem];
 if(screen==='Form Editor')return [home,clientsItem,clientItem,caseItem,{label:'Enrollment Form',screen:'Form Editor',clientId:client?.id,caseId:record?.id}];
 const labels={
  'Enroll Clients':'Ready for Enroll',
  'Enrolled Cases':'Enrolled Cases',
  'Follow-ups':'Follow-up Cases',
  'Exited Cases':'Exited Cases',
  'Clients':'Clients',
  'Calendar':'Calendar',
  'Settings':'Settings'
 };
 return [home,{label:labels[screen]||screen,screen}];
}
export function pushNavigationHistory(history,route){
 return [...(history||[]),{screen:route.screen,clientId:route.clientId,caseId:route.caseId}].slice(-40);
}
