import React,{useEffect,useRef,useState} from 'react';
import './tabs.css';
/** Open workspaces are distinct from breadcrumb ancestors. */
export default function WorkspaceTabs({tabs,activeId,onActivate,onClose,onHome}){
  const [listOpen,setListOpen]=useState(false);
  const menuRef=useRef(null);
  const activeRef=useRef(null);
  useEffect(()=>{activeRef.current?.scrollIntoView({inline:'nearest',block:'nearest'});},[activeId]);
  useEffect(()=>{
    if(!listOpen)return;
    const outside=event=>{if(menuRef.current&&!menuRef.current.contains(event.target))setListOpen(false)};
    const escape=event=>{if(event.key==='Escape')setListOpen(false)};
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
  },[listOpen]);
  const iconFor=screen=>screen==='Home'?'⌂':screen==='Client Detail'?'♙':screen==='Case Detail'?'▤':screen==='Form Editor'?'▧':'☷';
  return <div className="workspace-tabs" aria-label="Workspaces">
    <div className="workspace-tabs-scroll" role="tablist" aria-label="Open work tabs">
      {tabs.map(tab=><div key={tab.id} className={'workspace-tab '+(tab.id===activeId?'active':'')} ref={tab.id===activeId?activeRef:null}>
        <button type="button" className="workspace-tab-open" role="tab" aria-selected={tab.id===activeId} title={tab.title} onClick={()=>onActivate(tab)}>
          <span aria-hidden="true" className="workspace-tab-symbol">{iconFor(tab.screen)}</span>
          <span className="workspace-tab-text">{tab.title}</span>
        </button>
        {tab.id!=='Home'&&<button type="button" className="workspace-tab-close" title={'Close '+tab.title} aria-label={'Close '+tab.title} onClick={()=>onClose(tab.id)}>×</button>}
      </div>)}
    </div>
    <div className="workspace-tabs-actions" ref={menuRef}>
      <button type="button" className="workspace-tabs-home" title="Go to Home" aria-label="Go to Home" onClick={onHome}>＋</button>
      <button type="button" className="workspace-tabs-list-button" aria-label="Show all open tabs" aria-haspopup="menu" aria-expanded={listOpen} onClick={()=>setListOpen(v=>!v)}>
        Open ({tabs.length}) <span aria-hidden="true">⌄</span>
      </button>
      {listOpen&&<div className="workspace-tab-menu" role="menu" aria-label="All open tabs">
        <div className="workspace-tab-menu-heading">OPEN WORKSPACES</div>
        {tabs.map(tab=><button type="button" key={tab.id} className={'workspace-tab-menu-row '+(tab.id===activeId?'selected':'')} role="menuitem" onClick={()=>{setListOpen(false);onActivate(tab)}}>
          <span aria-hidden="true">{iconFor(tab.screen)}</span><span>{tab.title}</span>{tab.id===activeId&&<span aria-hidden="true">✓</span>}
        </button>)}
      </div>}
    </div>
  </div>;
}
