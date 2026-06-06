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
  const stageH = expanded ? '66%' : '43%';

  return (
    <>
      <div className="topbar">
        <button className="iconbtn" onClick={onBack}><Icon.back /></button>
        <div style={{ flex: 1, lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>{crag?.name}</div>
          <div style={{ fontSize: 11.5, opacity: .82, marginTop: 1 }}>{crag?.area} · {crag?.type} · {routes.length} routes</div>
        </div>
        <div className="pill-offline" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>
          <span className="dot"></span>Offline
        </div>
        <button className={'iconbtn' + (labels ? ' on' : '')} onClick={() => setLabels(v => !v)} title="Toggle labels">
          <Icon.tag />
        </button>
      </div>

      <div style={{ position: 'relative', height: stageH, flex: 'none', transition: 'height .35s cubic-bezier(.22,.61,.36,1)' }}>
        <TopoStage photo={photo} aspect={aspect} routes={routes}
          selected={sel} onSelect={setSel} showLabels={labels}
          stances={route?.stances || null}
          style={{ width: '100%', height: '100%' }} />
        <button onClick={() => setExpanded(v => !v)}
          style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 10, width: 34, height: 34,
            borderRadius: 9, border: 0, background: 'rgba(21,20,15,.56)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          {expanded ? <Icon.compress /> : <Icon.expand />}
        </button>
      </div>

      <div className="listhead">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>Routes</div>
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
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <span className="rnum" style={{ background: route.color, width: 28, height: 28, fontSize: 12, flex: 'none' }}>{route.n}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.05, marginBottom: 1 }}>{route.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{route.type || route.style} · {route.len}m · <span className="stars" style={{ fontSize: 11 }}>{'★'.repeat(route.stars)}</span></div>
              </div>
              <span className="grade" style={{ fontSize: 13, padding: '4px 9px' }}>{convertGrade(route.grade, gradeSystem)}</span>
              <button className="iconbtn lite" style={{ width: 30, height: 30, flex: 'none' }} onClick={() => setSel(null)}><Icon.close /></button>
            </div>

            <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-soft)', maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-line', paddingRight: 4, marginBottom: 12 }} className="thin-scroll">
              {route.desc}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setTicks(t => ({ ...t, [route.n]: t[route.n] === 'project' ? 'none' : 'project' }))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '9px 0',
                  border: `1.5px solid ${statusOf(route) === 'project' ? 'var(--slate)' : 'var(--line-strong)'}`,
                  borderRadius: 12, background: statusOf(route) === 'project' ? 'var(--slate)' : 'transparent',
                  color: statusOf(route) === 'project' ? 'var(--chalk)' : 'var(--ink-soft)',
                  cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13 }}>
                <Icon.project /> {statusOf(route) === 'project' ? 'Saved' : 'Project'}
              </button>
              <button onClick={() => setTicks(t => ({ ...t, [route.n]: 'sent' }))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '9px 0',
                  border: `1.5px solid ${statusOf(route) === 'sent' ? 'var(--moss)' : 'var(--line-strong)'}`,
                  borderRadius: 12, background: statusOf(route) === 'sent' ? 'var(--moss)' : 'transparent',
                  color: statusOf(route) === 'sent' ? '#fff' : 'var(--ink-soft)',
                  cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13 }}>
                <Icon.tick /> {statusOf(route) === 'sent' ? 'Ticked ✓' : 'Tick'}
              </button>
              <button title="Add note"
                style={{ width: 40, height: 40, borderRadius: 12, border: '1.5px solid var(--line-strong)',
                  background: 'transparent', color: 'var(--ink-faint)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon.note />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
