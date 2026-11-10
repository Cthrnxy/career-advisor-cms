/** Stable keys for independent opened client, case, and form workspaces. */
export function getTabId(screen,clientId,caseId){
  if(screen==='Client Detail')return 'client:'+clientId;
  if(screen==='Case Detail')return 'case:'+clientId+':'+caseId;
  if(screen==='Form Editor')return 'form:'+clientId+':'+caseId;
  return screen;
}
export function getTabTitle(screen,client,record){
  if(screen==='Client Detail')return client?.name||'Client';
  if(screen==='Case Detail')return (client?.name||'Client')+' · '+(record?.form||'Case')+(record?.form?' Case':'');
  if(screen==='Form Editor')return (client?.name||'Client')+' · '+(record?.form||'Form')+(record?.form?' Form':'');
  return screen;
}
