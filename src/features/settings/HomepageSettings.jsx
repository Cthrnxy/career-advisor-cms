import React from 'react';
import {HOME_MODULES,DEFAULT_HOME_SETTINGS,normalizeHomeSettings,moveHomeModule,setHomeModuleVisible} from '../../homeSettings.js';
import './settings.css';

export default function HomepageSettings({value,onChange,onGoHome}){
 const settings=normalizeHomeSettings(value);
 const labels=new Map(HOME_MODULES.map(module=>[module.id,module]));
 return <div className="homepage-settings">
   <header className="settings-intro">
     <div><span className="settings-eyebrow">WORKSPACE PREFERENCES</span><h1>Customize Homepage</h1><p>Choose what appears on your dashboard and the order you want to see it.</p></div>
     <button type="button" className="settings-preview-button" onClick={onGoHome}>View Homepage &nbsp;›</button>
   </header>
   <div className="settings-layout">
     <section className="settings-section">
       <div className="settings-section-header"><div><h2>Dashboard modules</h2><p>Switch modules on or off. Use the arrows to move them up or down.</p></div><span>{HOME_MODULES.length-settings.hidden.length} visible</span></div>
       <div className="settings-modules">
       {settings.order.map((id,index)=>{
         const module=labels.get(id);
         return <div className={'settings-module '+(settings.hidden.includes(id)?'is-hidden':'')} key={id}>
           <span className="settings-order-num">{index+1}</span>
           <div className="settings-module-copy"><strong>{module.name}</strong><span>{module.description}</span></div>
           <label className="settings-switch"><input type="checkbox" checked={!settings.hidden.includes(id)} onChange={event=>onChange(state=>setHomeModuleVisible(state,id,event.target.checked))}/><span>{settings.hidden.includes(id)?'Hidden':'Visible'}</span></label>
           <div className="settings-reorder-controls"><button type="button" disabled={index===0} onClick={()=>onChange(state=>moveHomeModule(state,id,-1))} aria-label={'Move '+module.name+' up'} title="Move up">↑</button><button type="button" disabled={index===settings.order.length-1} onClick={()=>onChange(state=>moveHomeModule(state,id,1))} aria-label={'Move '+module.name+' down'} title="Move down">↓</button></div>
         </div>;
       })}
       </div>
       <p className="settings-saving-note">Changes save automatically in this browser and appear immediately on Homepage.</p>
     </section>
     <aside className="settings-sidebar">
       <section className="settings-section">
         <h2>Display density</h2><p className="settings-explain">Choose how much spacing to use on Homepage.</p>
         <div className="settings-density-list">
           <label className={settings.density==='comfortable'?'selected':''}><input type="radio" name="homepage-density" checked={settings.density==='comfortable'} onChange={()=>onChange(state=>({...normalizeHomeSettings(state),density:'comfortable'}))}/><span><strong>Comfortable</strong><small>More spacing for easier scanning</small></span></label>
           <label className={settings.density==='compact'?'selected':''}><input type="radio" name="homepage-density" checked={settings.density==='compact'} onChange={()=>onChange(state=>({...normalizeHomeSettings(state),density:'compact'}))}/><span><strong>Compact</strong><small>More information in less space</small></span></label>
         </div>
       </section>
       <section className="settings-section">
         <h2>Always available</h2>
         <p className="settings-explain">Client search, workspace tabs, and left navigation stay available, even if you hide dashboard modules.</p>
         <div className="settings-fixed-info">Enrolled and Follow-up tables preview a maximum of <strong>5 Cases</strong>. View All opens each complete list.</div>
         <button type="button" className="settings-reset-button" onClick={()=>onChange(normalizeHomeSettings(DEFAULT_HOME_SETTINGS))}>↺ &nbsp; Restore default Homepage</button>
       </section>
     </aside>
   </div>
 </div>;
}
