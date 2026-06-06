import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import type { Route, Stance } from '../types';

interface Props {
  photo: string;
  aspect: number;
  routes: Route[];
  selected: number | null;
  onSelect?: (n: number | null) => void;
  showLabels?: boolean;
  dimUnselected?: boolean;
  minZoom?: number;
  maxZoom?: number;
  controls?: boolean;
  initialZoom?: number;
  editable?: boolean;
  onUpdateLine?: (n: number, line: [number, number][]) => void;
  onUpdateStance?: (idx: number, x: number, y: number) => void;
  stances?: Stance[] | null;
  drawingMode?: boolean;
  onDrawComplete?: (line: [number, number][]) => void;
  onDrawCancel?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function catmullRom(pts: [number, number][], vbH: number): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0][0]*1000},${pts[0][1]*vbH} L ${pts[1][0]*1000},${pts[1][1]*vbH}`;
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${p[1][0]*1000},${p[1][1]*vbH}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0,y0] = p[i-1], [x1,y1] = p[i], [x2,y2] = p[i+1], [x3,y3] = p[i+2];
    const cp1x = x1 + (x2 - x0) / 6; const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6; const cp2y = y2 - (y3 - y1) / 6;
    d += ` C ${cp1x*1000},${cp1y*vbH} ${cp2x*1000},${cp2y*vbH} ${x2*1000},${y2*vbH}`;
  }
  return d;
}

const zbtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: 0,
  background: 'rgba(21,20,15,.6)', color: '#fff', fontSize: 20,
  fontWeight: 600, cursor: 'pointer',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', lineHeight: 1,
};

export default function TopoStage({
  photo, aspect, routes, selected, onSelect,
  showLabels = true, dimUnselected = true,
  minZoom = 1, maxZoom = 4, controls = true, initialZoom = 1,
  editable = false, onUpdateLine, onUpdateStance,
  stances = null,
  drawingMode = false, onDrawComplete, onDrawCancel,
  className = '', style = {},
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // Refs so doZoom always has fresh values without pan/zoom in its dep array
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;
  const drag = useRef<{ sx: number; sy: number; px: number; py: number; moved: number } | null>(null);
  const didInit = useRef(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Natural (zoom=1) dimensions — zoom is applied via CSS scale so both
  // size and position animate together in a single transform transition.
  const H = box.h;
  const W = H * aspect;
  const vbH = 1000 / aspect;

  const clamp = useCallback((p: { x: number; y: number }, z = zoom) => ({
    x: Math.min(0, Math.max(box.w - W * z, p.x)),
    y: Math.min(0, Math.max(box.h - H * z, p.y)),
  }), [box.w, box.h, W, H, zoom]);

  useEffect(() => {
    if (didInit.current || !box.w) return;
    didInit.current = true;
    // Start with the image horizontally centred so zoom buttons feel natural
    setPan({ x: Math.min(0, (box.w - W) / 2), y: 0 });
  }, [box.w, box.h]); // eslint-disable-line

  useEffect(() => {
    if (selected == null || !box.w) return;
    const r = routes.find(rr => rr.n === selected);
    if (!r) return;
    const xs = r.line.map(p => p[0]);
    const ys = r.line.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    setPan(clamp({ x: box.w / 2 - cx * W * zoom, y: box.h * 0.56 - cy * H * zoom }));
  }, [selected, box.w, box.h, zoom]); // eslint-disable-line

  const doZoom = useCallback((nz: number, ox?: number, oy?: number) => {
    nz = Math.max(minZoom, Math.min(maxZoom, nz));
    const cx = ox ?? box.w / 2, cy = oy ?? box.h / 2;
    const ratio = nz / zoomRef.current;
    const newX = cx - (cx - panRef.current.x) * ratio;
    const newY = cy - (cy - panRef.current.y) * ratio;
    setZoom(nz);
    setPan({
      x: Math.min(0, Math.max(box.w - W * nz, newX)),
      y: Math.min(0, Math.max(box.h - H * nz, newY)),
    });
  }, [box.w, box.h, W, H, minZoom, maxZoom]);

  // Drawing state
  const [drawPts, setDrawPts] = useState<[number, number][]>([]);
  const [drawCursor, setDrawCursor] = useState<[number, number] | null>(null);
  const drawPtsRef = useRef(drawPts);
  drawPtsRef.current = drawPts;
  const onDrawCompleteRef = useRef(onDrawComplete);
  onDrawCompleteRef.current = onDrawComplete;
  const onDrawCancelRef = useRef(onDrawCancel);
  onDrawCancelRef.current = onDrawCancel;

  useEffect(() => {
    if (!drawingMode) { setDrawPts([]); setDrawCursor(null); return; }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawPts([]); onDrawCancelRef.current?.(); }
      if (e.key === 'Enter' && drawPtsRef.current.length >= 2) {
        onDrawCompleteRef.current?.(drawPtsRef.current); setDrawPts([]);
      }
      if (e.key === 'Backspace') {
        setDrawPts(p => p.slice(0, -1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawingMode]);

  const tapRouteN = useRef<number | null>(null);

  const toNorm = useCallback((clientX: number, clientY: number): [number, number] => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left - pan.x) / (W * zoom)));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top - pan.y) / (H * zoom)));
    return [+nx.toFixed(4), +ny.toFixed(4)];
  }, [pan, W, H, zoom]);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (drawingMode) {
      // double-click = finish
      if (e.detail === 2 && drawPts.length >= 2) {
        onDrawComplete?.(drawPts); setDrawPts([]); return;
      }
      const pt = toNorm(e.clientX, e.clientY);
      setDrawPts(p => [...p, pt]);
      return;
    }
    // Detect tap on a route hit-area — store it; fire selection in onUp if not a drag
    const hit = (e.target as Element).closest('[data-route-n]');
    tapRouteN.current = hit ? Number(hit.getAttribute('data-route-n')) : null;
    drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drawingMode) {
      setDrawCursor(toNorm(e.clientX, e.clientY));
      return;
    }
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
    drag.current.moved += Math.abs(dx) + Math.abs(dy);
    // Capture px/py now so the value is safe even if drag.current is cleared before React flushes
    const { px, py } = drag.current;
    setPan(clamp({ x: px + dx, y: py + dy }));
  };
  const onUp = (e: React.PointerEvent) => {
    if (drawingMode) return;
    if (drag.current && drag.current.moved < 6) {
      onSelect?.(tapRouteN.current); // null = background tap → deselects
    }
    tapRouteN.current = null;
    drag.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };
  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      doZoom(zoom * (e.deltaY < 0 ? 1.12 : 0.89), e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    } else {
      setPan(p => clamp({ x: p.x - (e.shiftKey ? e.deltaY : e.deltaX || e.deltaY), y: p.y }));
    }
  };

  // editable handles
  const stanceDrag = useRef<{ idx: number; rect: DOMRect } | null>(null);
  const onStanceDown = (e: React.PointerEvent, idx: number) => {
    e.stopPropagation();
    const rect = wrapRef.current!.getBoundingClientRect();
    stanceDrag.current = { idx, rect };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onStanceMove = (e: React.PointerEvent) => {
    if (!stanceDrag.current) return;
    e.stopPropagation();
    const { idx, rect } = stanceDrag.current;
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left - pan.x) / (W * zoom)));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top - pan.y) / (H * zoom)));
    onUpdateStance?.(idx, +nx.toFixed(4), +ny.toFixed(4));
  };
  const onStanceUp = (e: React.PointerEvent) => { stanceDrag.current = null; (e.target as HTMLElement).releasePointerCapture(e.pointerId); };

  const handleDrag = useRef<{ idx: number; rect: DOMRect } | null>(null);
  const onHandleDown = (e: React.PointerEvent, idx: number) => {
    e.stopPropagation();
    const rect = wrapRef.current!.getBoundingClientRect();
    handleDrag.current = { idx, rect };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHandleDblClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    const r = routes.find(rr => rr.n === selected);
    if (r && r.line.length > 2) {
      const nl = r.line.filter((_, i) => i !== idx) as [number, number][];
      onUpdateLine?.(selected!, nl);
    }
  };
  const onHandleMove = (e: React.PointerEvent) => {
    if (!handleDrag.current) return;
    e.stopPropagation();
    const { idx, rect } = handleDrag.current;
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left - pan.x) / (W * zoom)));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top - pan.y) / (H * zoom)));
    const r = routes.find(rr => rr.n === selected);
    if (!r) return;
    const nl = r.line.map((p, i) => i === idx ? [+nx.toFixed(4), +ny.toFixed(4)] : p) as [number,number][];
    onUpdateLine?.(selected!, nl);
  };
  const onHandleUp = (e: React.PointerEvent) => { handleDrag.current = null; (e.target as HTMLElement).releasePointerCapture(e.pointerId); };

  // Midpoint handle: drag inserts a new point between i and i+1
  const onMidDown = (e: React.PointerEvent, afterIdx: number) => {
    e.stopPropagation();
    const r = routes.find(rr => rr.n === selected);
    if (!r) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    const a = r.line[afterIdx], b = r.line[afterIdx + 1];
    const mid: [number, number] = [+((a[0] + b[0]) / 2).toFixed(4), +((a[1] + b[1]) / 2).toFixed(4)];
    const nl = [...r.line.slice(0, afterIdx + 1), mid, ...r.line.slice(afterIdx + 1)] as [number,number][];
    onUpdateLine?.(selected!, nl);
    // immediately hand off to normal handle drag at the new index
    handleDrag.current = { idx: afterIdx + 1, rect };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const selRoute = editable && selected != null ? routes.find(r => r.n === selected) : null;

  return (
    <div
      ref={wrapRef}
      className={'topo-stage ' + className}
      style={{ position: 'relative', overflow: 'hidden', background: '#15140f', touchAction: 'none', cursor: drawingMode ? 'crosshair' : drag.current ? 'grabbing' : 'grab', ...style }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      onWheel={onWheel}
    >
      <div style={{
        position: 'absolute', width: W, height: H,
        transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        transition: 'none',
        willChange: 'transform',
      }}>
        <img src={photo} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', userSelect: 'none' }} />

        <svg viewBox={`0 0 1000 ${vbH}`} preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {drawingMode && drawPts.length > 0 && (() => {
            const preview = drawCursor ? [...drawPts, drawCursor] : drawPts;
            const pts = preview.map(p => `${p[0] * 1000},${p[1] * vbH}`).join(' ');
            return (
              <g>
                <polyline points={pts} fill="none" stroke="#fff" vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 8, opacity: .4, strokeDasharray: '6 4' }}
                  strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={pts} fill="none" stroke="#F2453A" vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 3, strokeDasharray: '6 4', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.75))' }}
                  strokeLinecap="round" strokeLinejoin="round" />
                {drawPts.map((p, i) => (
                  <circle key={i} cx={p[0] * 1000} cy={p[1] * vbH} r={i === 0 ? 7 : 5}
                    fill={i === 0 ? '#F2453A' : '#fff'} stroke={i === 0 ? '#fff' : '#F2453A'}
                    vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
                ))}
              </g>
            );
          })()}
          {routes.map(r => {
            const isSel = selected === r.n;
            const dim = dimUnselected && selected != null && !isSel;
            const d = catmullRom(r.line, vbH);
            if (!d) return null;  // no line drawn yet
            return (
              <g key={r.n} style={{ transition: 'opacity .3s' }} opacity={dim ? 0.32 : 1}>
                {isSel && <path d={d} fill="none" stroke="#fff" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 8, opacity: .55 }} strokeLinecap="round" strokeLinejoin="round" />}
                <path d={d} fill="none" stroke={r.color} vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: isSel ? 4 : 2.6, cursor: 'pointer', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.75))' }}
                  strokeLinecap="round" strokeLinejoin="round" />
                {/* Wide invisible hit area */}
                <path d={d} fill="none" stroke="transparent"
                  vectorEffect="non-scaling-stroke"
                  data-route-n={r.n}
                  style={{ strokeWidth: 28, cursor: 'pointer' }}
                  strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={r.line[0][0] * 1000} cy={r.line[0][1] * vbH} r={isSel ? 6 : 4}
                  fill={r.color} stroke="#fff" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1.5 }} />
              </g>
            );
          })}
        </svg>

        {showLabels && routes.map(r => {
          const isSel = selected === r.n;
          const dim = dimUnselected && selected != null && !isSel;
          const top = r.line[r.line.length - 1];
          if (!top) return null;  // route has no line yet — skip label
          return (
            <button key={'lab' + r.n} onClick={e => { e.stopPropagation(); onSelect?.(r.n); }}
              style={{ position: 'absolute', left: `${top[0] * 100}%`, top: `${top[1] * 100}%`,
                transform: 'translate(-50%,-150%)', display: 'flex', alignItems: 'center', gap: 6,
                padding: 0, border: 0, background: 'none', cursor: 'pointer',
                opacity: dim ? 0.4 : 1, transition: 'opacity .3s', zIndex: isSel ? 5 : 2 }}>
              <span style={{ width: isSel ? 26 : 21, height: isSel ? 26 : 21, borderRadius: '50%', flex: 'none',
                border: `2px solid ${r.color}`, background: isSel ? r.color : 'rgba(255,255,255,.95)',
                color: isSel ? '#fff' : 'var(--slate)', fontFamily: 'var(--font-mono)', fontWeight: 700,
                fontSize: isSel ? 13 : 11, lineHeight: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.55)' }}>{r.n}</span>
            </button>
          );
        })}

        {stances && stances.map((s, i) => (
          <div key={'s' + i}
            onPointerDown={editable ? e => onStanceDown(e, i) : undefined}
            onPointerMove={editable ? onStanceMove : undefined}
            onPointerUp={editable ? onStanceUp : undefined}
            style={{ position: 'absolute', left: `${s.x * 100}%`, top: `${s.y * 100}%`,
              transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, zIndex: 9, pointerEvents: editable ? 'all' : 'none' }}>
            <div style={{ width: editable ? 20 : 16, height: editable ? 20 : 16, borderRadius: '50%',
              background: 'rgba(255,255,255,.92)', border: `2.5px solid ${selRoute?.color || '#fff'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,.6)', cursor: editable ? 'grab' : 'default', flexShrink: 0 }}>
              <svg width="7" height="7" viewBox="0 0 8 8">
                <path d="M4 0.5 L7.5 4 L4 7.5 L0.5 4 Z" fill={selRoute?.color || '#555'} />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 8.5, color: '#fff',
              background: 'rgba(20,20,15,.72)', padding: '1px 5px', borderRadius: 4,
              whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}>P{s.p}</span>
          </div>
        ))}

        {selRoute && selRoute.line.map((p, i) => (
          <div key={'h' + i}
            onPointerDown={e => onHandleDown(e, i)}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onDoubleClick={e => onHandleDblClick(e, i)}
            style={{ position: 'absolute', left: `${p[0] * 100}%`, top: `${p[1] * 100}%`,
              transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%',
              background: '#fff', border: `3px solid ${selRoute.color}`,
              boxShadow: '0 1px 5px rgba(0,0,0,.6)', cursor: 'grab', zIndex: 8, touchAction: 'none' }} />
        ))}
        {selRoute && selRoute.line.slice(0, -1).map((p, i) => {
          const next = selRoute.line[i + 1];
          const mx = (p[0] + next[0]) / 2;
          const my = (p[1] + next[1]) / 2;
          return (
            <div key={'mid' + i}
              onPointerDown={e => onMidDown(e, i)}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              style={{ position: 'absolute', left: `${mx * 100}%`, top: `${my * 100}%`,
                transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)', border: `2px solid ${selRoute.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,.5)', cursor: 'copy', zIndex: 7, touchAction: 'none',
                opacity: 0.75 }} />
          );
        })}
      </div>

      {drawingMode && (
        <div style={{ position: 'absolute', bottom: 54, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          background: 'rgba(21,20,15,.72)', backdropFilter: 'blur(8px)', borderRadius: 8,
          padding: '6px 14px', fontSize: 12, color: '#fff', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {drawPts.length === 0
            ? 'Click to place first point'
            : drawPts.length === 1
            ? 'Click to add more points — double-click to finish'
            : `${drawPts.length} points — double-click or Enter to finish · Backspace to undo · Esc to cancel`}
        </div>
      )}
      {controls && (
        <div style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
          <button onClick={() => doZoom(zoom * 1.25)} style={zbtn}>+</button>
          <button onClick={() => doZoom(zoom / 1.25)} style={zbtn}>–</button>
        </div>
      )}
    </div>
  );
}
