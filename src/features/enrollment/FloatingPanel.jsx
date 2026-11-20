import React, {useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import './floatingPanel.css';

function initialFrame(kind) {
  const availableWidth = Math.max(320, window.innerWidth - 30);
  const width = Math.min(kind === 'form' ? 680 : 495, availableWidth);
  const height = Math.min(kind === 'form' ? 720 : 760, Math.max(320, window.innerHeight - 40));
  const left = kind === 'form'
    ? Math.max(12, Math.min(window.innerWidth - width - 12, 65))
    : Math.max(12, window.innerWidth - width - 55);
  return {left, top: Math.min(kind === 'form' ? 75 : 105, Math.max(12, window.innerHeight - height - 12)), width, height};
}

/** Non-modal, movable and resizable in-page window.
 * Keeping it inside the same React tree lets edits and preview stay live.
 */
export default function FloatingPanel({kind, title, active, onBringToFront, onDock, children}) {
  const [frame, setFrame] = useState(()=>initialFrame(kind));
  const boxRef = useRef(null);
  const dragRef = useRef(null);

  const startDrag = event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    onBringToFront();
    const bounds = boxRef.current?.getBoundingClientRect();
    if (!bounds) return;
    dragRef.current = {pointerId:event.pointerId, dx:event.clientX-bounds.left, dy:event.clientY-bounds.top};
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const moveDrag = event => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const width = boxRef.current?.offsetWidth || frame.width;
    const height = boxRef.current?.offsetHeight || frame.height;
    setFrame(old=>({...old,
      left:Math.max(0,Math.min(window.innerWidth-width,event.clientX-drag.dx)),
      top:Math.max(0,Math.min(window.innerHeight-48,event.clientY-drag.dy))
    }));
  };
  const endDrag = event => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const panel = <section ref={boxRef} className={'ef-floating-window ef-floating-'+kind}
    style={{left:frame.left, top:frame.top, width:frame.width, height:frame.height, zIndex:active?26:25}}
    role="region" aria-label={title} onPointerDown={onBringToFront}>
    <div className="ef-floating-drag" onPointerDown={startDrag} onPointerMove={moveDrag}
      onPointerUp={endDrag} onPointerCancel={endDrag} title="Drag to move this window">
      <div className="ef-floating-title">
        <span className="ef-floating-grip" aria-hidden="true">⠿</span>
        <strong>{title}</strong><span className="ef-floating-sub">Drag to move · Resize from lower-right</span>
      </div>
      <button type="button" className="ef-btn ef-floating-dock" onClick={onDock}>Dock ↙</button>
    </div>
    <div className="ef-floating-body">{children}</div>
    <span className="ef-floating-resize-indicator" aria-hidden="true">◢</span>
  </section>;
  return createPortal(panel, document.body);
}
