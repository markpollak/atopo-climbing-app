import { useState, useRef, useEffect } from 'react';
import TopoStage from '../../components/TopoStage';
import { Icon } from '../../components/Icons';
import { convertGrade, STATUS_META } from '../../data/grades';
import type { Route, Crag, GradeSystem, RouteStatus } from '../../types';

interface Props {
  crag?: Crag;
  routes?: Route[];
  photo?: string;
  aspect?: number;
  onBack?: () => void;
  gradeSystem?: GradeSystem;
}

export default function TopoScreen({ crag, routes = [], photo = '', aspect = 2, onBack, gradeSystem = 'uk' }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [labels, setLabels] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [ticks, setTicks] = useState<Record<number, RouteStatus>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const route = sel != null ? routes.find(r => r.n === sel) : null;

  useEffect(() => {
    if (sel == null || !listRef.current) return;
    const row = listRef.current.querySelector<HTMLElement>(`[data-n="${sel}"]`);
    if (!row) return;
    const c = listRef.current;
    c.scrollTo({ top: Math.max(0, row.offsetTop - c.clientHeight / 2 + row.clientHeight / 2), behavior: 'smooth' });
  }, [sel]);

  const statusOf = (r: Route): RouteStatus => ticks[r.n] || r.status || 'none';
  const stageH = expanded ? '82%' : '43%';

  return (
    <>
      <div style={{ position: 'relative', height: stageH, flex: 'none', transition: 'height .35s cubic-bezier(.22,.61,.36,1)' }}>
        <TopoStage photo={photo} aspect={aspect} routes={routes}
          selected={sel} onSelect={setSel} showLabels={labels}
          stances={route?.stances || null}
          style={{ width: '100%', height: '100%' }} />
        {/* Back arrow */}
        <button className="iconbtn" onClick={onBack}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 20,
            background: 'rgba(21,20,15,.52)', color: '#fff',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: 0 }}>
          <Icon.back />
        </button>
        {/* Label toggle — smaller */}
        <button onClick={() => setLabels(v => !v)}
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 20,
            width: 28, height: 28, borderRadius: 8, border: 0,
            background: labels ? 'var(--rust)' : 'rgba(21,20,15,.52)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        </button>
        {/* Expand/collapse */}
        <button onClick={() => setExpanded(v => !v)}
          style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 10, width: 34, height: 34,
            borderRadius: 9, border: 0, background: 'rgba(21,20,15,.56)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          {expanded ? <Icon.compress /> : <Icon.expand />}
        </button>
      </div>

      <div className="listhead">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>{crag?.name}</div>
        <span className="chip" style={{ padding: '3px 9px', fontSize: 11.5, marginLeft: 'auto' }}>{routes.length}</span>
      </div>

      <div className="list thin-scroll" ref={listRef}>
        {routes.map(r => {
          const sm = STATUS_META[statusOf(r)];
          const gDisplay = convertGrade(r.grade, gradeSystem);
          return (
            <button key={r.n} data-n={r.n}
              className={'rrow' + (sel === r.n ? ' sel' : '')}
              style={{ ['--rl-color' as string]: r.color }}
              onClick={() => setSel(v => v === r.n ? null : r.n)}>
              <span className="rnum" style={{ background: r.color, width: 22, height: 22, fontSize: 11 }}>{r.n}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="rname">{r.name}</span>
                <span className="rmeta">
                  <span className="stars" style={{ fontSize: 10 }}>{'★'.repeat(r.stars)}</span>
                  {' '}{r.type || r.style} · {r.len}m
                </span>
              </span>
              {sm.label !== 'Not tried' && (
                <span className={'chip ' + sm.cls} style={{ padding: '2px 7px', fontSize: 10 }}>{sm.label}</span>
              )}
              <span className="grade" style={{ fontSize: 12, padding: '2px 7px' }}>{gDisplay}</span>
            </button>
          );
        })}
        <div style={{ height: route ? 260 : 16 }}></div>
      </div>

      <div className={'sheet' + (route ? ' open' : '')} onClick={e => e.stopPropagation()}>
        <div className="grip"></div>
        {route && (
          <>
            {/* Sheet header: number + name on left, grade + actions + close on right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {/* Route number */}
              <span className="rnum" style={{ background: route.color, width: 30, height: 30, fontSize: 13, flex: 'none' }}>{route.n}</span>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{route.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 1 }}>{route.type || route.style} · {route.len}m · <span className="stars" style={{ fontSize: 10 }}>{'★'.repeat(route.stars)}</span></div>
              </div>

              {/* Grade pill */}
              <span className="grade" style={{ fontSize: 12.5, padding: '4px 9px', flex: 'none' }}>{convertGrade(route.grade, gradeSystem)}</span>

              {/* Project button */}
              <button onClick={() => setTicks(t => ({ ...t, [route.n]: t[route.n] === 'project' ? 'none' : 'project' }))}
                title="Project"
                style={{ width: 30, height: 30, borderRadius: 9, flex: 'none',
                  border: `1.5px solid ${statusOf(route) === 'project' ? 'var(--slate)' : 'var(--line-strong)'}`,
                  background: statusOf(route) === 'project' ? 'var(--slate)' : 'transparent',
                  color: statusOf(route) === 'project' ? 'var(--chalk)' : 'var(--ink-faint)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>

              {/* Tick button */}
              <button onClick={() => setTicks(t => ({ ...t, [route.n]: t[route.n] === 'sent' ? 'none' : 'sent' }))}
                title="Tick"
                style={{ width: 30, height: 30, borderRadius: 9, flex: 'none',
                  border: `1.5px solid ${statusOf(route) === 'sent' ? 'var(--moss)' : 'var(--line-strong)'}`,
                  background: statusOf(route) === 'sent' ? 'var(--moss)' : 'transparent',
                  color: statusOf(route) === 'sent' ? '#fff' : 'var(--ink-faint)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              </button>

              {/* Close — rust background, white ✕ */}
              <button onClick={() => setSel(null)}
                style={{ width: 30, height: 30, borderRadius: 9, flex: 'none',
                  border: 0, background: 'var(--rust)', color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--sh-sm)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)', maxHeight: 72, overflowY: 'auto', whiteSpace: 'pre-line', paddingRight: 4, marginTop: 8 }} className="thin-scroll">
              {route.desc}
            </div>
          </>
        )}
      </div>
    </>
  );
}
