import React from 'react';
import {getBreadcrumbs} from './navigation.js';
import './breadcrumb.css';

/** A single route, back arrow and clickable ancestors. No workspace tabs. */
export default function BreadcrumbNav({screen,client,record,onNavigate,onBack,backLabel='Previous page'}){
 const items=getBreadcrumbs(screen,client,record);
 if(!items.length)return null;
 return <nav className="workspace-breadcrumb" aria-label="Page location">
  <button type="button" className="workspace-previous" onClick={onBack} title={'Back to '+backLabel} aria-label={'Back to '+backLabel}><span aria-hidden="true">←</span><span>Back</span></button>
  <span className="workspace-breadcrumb-divider" aria-hidden="true"/>
  <ol>
   {items.map((item,index)=><li key={index}>
    {index>0&&<span className="workspace-breadcrumb-chevron" aria-hidden="true">›</span>}
    {index===items.length-1?<strong aria-current="page">{item.label}</strong>:<button type="button" onClick={()=>onNavigate(item)}>{item.label}</button>}
   </li>)}
  </ol>
 </nav>;
}
