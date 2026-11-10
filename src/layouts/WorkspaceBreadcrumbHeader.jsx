import React, {useEffect, useMemo, useRef, useState} from 'react';
import './breadcrumb.css';

/**
 * Hierarchical breadcrumb, not a browser history list.
 *
 * When the path becomes too long, keep its last two levels visible
 * and put every earlier ancestor inside the folder dropdown.
 * The current page is always the final, non-clickable segment.
 */
export default function WorkspaceBreadcrumbHeader({items,onNavigate}) {
  const pathRef=useRef(null);
  const overflowRef=useRef(null);
  const [pathWidth,setPathWidth]=useState(800);
  const [dropdownOpen,setDropdownOpen]=useState(false);
  const pathSignature=items.map(item=>item.key+':'+item.label).join(' / ');

  useEffect(()=>{
    const element=pathRef.current;
    if(!element)return;
    const measure=()=>setPathWidth(element.clientWidth);
    measure();
    if(typeof ResizeObserver==='undefined'){
      window.addEventListener('resize',measure);
      return ()=>window.removeEventListener('resize',measure);
    }
    const observer=new ResizeObserver(measure);
    observer.observe(element);
    return ()=>observer.disconnect();
  },[]);

  useEffect(()=>setDropdownOpen(false),[pathSignature]);
  useEffect(()=>{
    if(!dropdownOpen)return;
    function onPointerDown(event){
      if(overflowRef.current&&!overflowRef.current.contains(event.target))setDropdownOpen(false);
    }
    function onKeyDown(event){if(event.key==='Escape')setDropdownOpen(false)}
    document.addEventListener('pointerdown',onPointerDown);
    document.addEventListener('keydown',onKeyDown);
    return ()=>{
      document.removeEventListener('pointerdown',onPointerDown);
      document.removeEventListener('keydown',onKeyDown);
    };
  },[dropdownOpen]);

  const estimatedWidth=useMemo(
    ()=>items.reduce((total,item)=>total+Math.min(245,49+item.label.length*7.8),0),
    [pathSignature]
  );
  const collapse = items.length>4 || (items.length>2 && estimatedWidth>pathWidth);
  const hidden = collapse?items.slice(0,-2):[];
  const visible = collapse?items.slice(-2):items;

  const openAncestor=key=>{setDropdownOpen(false);onNavigate(key)};

  return <header className="workspace-breadcrumb-header">
    <nav className="breadcrumb-path" aria-label="Current page path" ref={pathRef}>
      {hidden.length>0&&<div className="breadcrumb-overflow" ref={overflowRef}>
        <button type="button" className={'breadcrumb-folder '+(dropdownOpen?'is-open':'')} aria-label="Show hidden parent paths" aria-haspopup="menu" aria-expanded={dropdownOpen} onClick={()=>setDropdownOpen(open=>!open)} title="Show earlier paths">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span aria-hidden="true" className="folder-chevron">⌄</span>
        </button>
        {dropdownOpen&&<div className="breadcrumb-menu" role="menu" aria-label="Hidden parent paths">
          <span className="breadcrumb-menu-title">Previous levels</span>
          {hidden.map((item,index)=><button type="button" role="menuitem" key={item.key+index} className="breadcrumb-menu-item" onClick={()=>openAncestor(item.key)}>
            <span className="breadcrumb-menu-icon" aria-hidden="true">▤</span><span className="breadcrumb-menu-label">{item.label}</span>
          </button>)}
        </div>}
      </div>}
      {visible.map((item,index)=><React.Fragment key={item.key+':'+index}>
        {(index>0||hidden.length>0)&&<span className="breadcrumb-separator" aria-hidden="true">›</span>}
        {index===visible.length-1?<span className="breadcrumb-current" aria-current="page" title={item.label}>{item.label}</span>:
          <button type="button" className="breadcrumb-link" onClick={()=>openAncestor(item.key)} title={'Go to '+item.label}>{item.label}</button>}
      </React.Fragment>)}
    </nav>
    <div className="breadcrumb-meta"><span className="breadcrumb-meta-brand">Career Advisor CMS</span><span className="breadcrumb-meta-status">Prototype · Synthetic data only</span></div>
  </header>;
}
