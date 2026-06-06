import { useState } from 'react';
import { AtopoWordmark, Icon } from '../../components/Icons';
import TopoStage from '../../components/TopoStage';
import { STANAGE_PHOTO, STANAGE_ASPECT, STANAGE_ROUTES } from '../../data/stanage';
import { convertGrade } from '../../data/grades';
import type { Route } from '../../types';

type StudioTab = 'editor' | 'table' | 'publish';

const CHECKS = [
  { label: 'All routes have grades',       ok: true },
  { label: 'All route lines attached',     ok: true },
  { label: 'Topo image credited',          ok: false },
  { label: 'Crag has access notes',        ok: true },
  { label: 'All routes have descriptions', ok: false },
  { label: 'Download size calculated',     ok: true },
  { label: 'Version number set',           ok: true },
];

function Inspector({ route, onChange }: { route: Route | null; onChange: (r: Route) => void }) {
  if (!route) return (
    <div style={{ padding: 24, color: 'var(--ink-faint)', fontSize: 13.5, textAlign: 'center', marginTop: 40 }}>
      <Icon.edit />
      <div style={{ marginTop: 12 }}>Select a route to edit its details</div>
    </div>
  );

  const set = (key: keyof Route, val: unknown) => onChange({ ...route, [key]: val });

  return (
    <div style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: route.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, flex: 'none' }}>{route.n}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>{route.name || 'Unnamed route'}</span>
      </div>

      <div className="fld-row">
        <div className="fld" style={{ flex: '0 0 48px' }}>
          <label>#</label>
          <input value={route.n} readOnly style={{ background: 'var(--surface-2)', color: 'var(--ink-faint)' }} />
        </div>
        <div className="fld" style={{ flex: 1 }}>
          <label>Name</label>
          <input value={route.name} onChange={e => set('name', e.target.value)} />
        </div>
      </div>

      <div className="fld-row">
        <div className="fld" style={{ flex: 1 }}>
          <label>Grade</label>
          <input value={route.grade} onChange={e => set('grade', e.target.value)} />
        </div>
        <div className="fld" style={{ flex: 1 }}>
          <label>Stars</label>
          <select value={route.stars} onChange={e => set('stars', Number(e.target.value))}>
            {[0,1,2,3].map(n => <option key={n} value={n}>{'★'.repeat(n) || 'None'}</option>)}
          </select>
        </div>
      </div>

      <div className="fld-row">
        <div className="fld" style={{ flex: 1 }}>
          <label>Style</label>
          <select value={route.style} onChange={e => set('style', e.target.value)}>
            {['Trad','Sport','Boulder','Top-rope'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="fld" style={{ flex: '0 0 70px' }}>
          <label>Length (m)</label>
          <input type="number" value={route.len} onChange={e => set('len', Number(e.target.value))} />
        </div>
      </div>

      <div className="fld">
        <label>Description</label>
        <textarea rows={4} value={route.desc} onChange={e => set('desc', e.target.value)} />
      </div>

      {route.warn !== undefined && (
        <div className="fld">
          <label>Warning notes</label>
          <textarea rows={2} value={route.warn || ''} onChange={e => set('warn', e.target.value)} />
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-faint)' }}>Pitches & stances</span>
        </div>
        {route.stances && route.stances.length > 0 ? (
          route.stances.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <svg width="12" height="12" viewBox="0 0 8 8" style={{ flex: 'none' }}>
                <path d="M4 0.5 L7.5 4 L4 7.5 L0.5 4 Z" fill={route.color} />
              </svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', flex: 'none', minWidth: 60 }}>P{s.p} · {s.x.toFixed(2)} {s.y.toFixed(2)}</span>
              <input value={s.note} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 7, padding: '5px 8px', fontSize: 12, fontFamily: 'var(--font-ui)' }}
                onChange={e => {
                  const ns = route.stances!.map((ss, j) => j === i ? { ...ss, note: e.target.value } : ss);
                  set('stances', ns);
                }} />
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12.5, color: 'var(--ink-faint)', fontStyle: 'italic' }}>No stances — single-pitch</div>
        )}
      </div>
    </div>
  );
}

function RouteTable({ routes, selected, onSelect }: { routes: Route[]; selected: number | null; onSelect: (n: number) => void }) {
  return (
    <div style={{ flex: 1, overflow: 'auto' }} className="thin-scroll">
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
        {['Missing grade','No route line','Unpublished'].map((f, i) => (
          <span key={i} className="chip" style={{ fontSize: 11.5, padding: '4px 10px', cursor: 'pointer' }}>{f}</span>
        ))}
      </div>
      <table className="st-table">
        <thead>
          <tr>
            <th>#</th><th>Route name</th><th>Grade</th><th>Stars</th><th>Style</th><th>m</th><th>Sector</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(r => (
            <tr key={r.n} className={selected === r.n ? 'on' : ''} onClick={() => onSelect(r.n)} style={{ cursor: 'pointer' }}>
              <td>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: r.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11 }}>{r.n}</span>
              </td>
              <td style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.name}</td>
              <td><span className="grade" style={{ fontSize: 11, padding: '2px 6px' }}>{r.grade}</span></td>
              <td><span className="stars" style={{ fontSize: 11 }}>{'★'.repeat(r.stars)}</span></td>
              <td>{r.style}</td>
              <td>{r.len}</td>
              <td style={{ color: 'var(--ink-faint)', fontSize: 12 }}>{r.sector || 'Main Wall'}</td>
              <td>
                {r.status && r.status !== 'none' && (
                  <span className={'chip chip-' + (r.status === 'sent' || r.status === 'flash' ? 'moss' : 'rust')} style={{ padding: '2px 7px', fontSize: 10.5 }}>{r.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PublishPanel() {
  return (
    <div style={{ flex: 1, padding: 28, maxWidth: 520 }}>
      <h3 style={{ fontSize: 20, marginBottom: 6 }}>Publish checklist</h3>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 22 }}>All items should be green before publishing a new version.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {CHECKS.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--line)', background: 'var(--card)' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.ok ? 'rgba(63,95,75,.14)' : 'rgba(200,107,60,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              {c.ok
                ? <span style={{ color: 'var(--moss)' }}><Icon.check /></span>
                : <span style={{ color: 'var(--rust)' }}><Icon.alert /></span>}
            </span>
            <span style={{ fontSize: 13.5, color: c.ok ? 'var(--ink)' : 'var(--ink-soft)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost btn-sm">Save Draft</button>
        <button className="btn btn-primary">Publish Update v1.1</button>
        <button className="btn btn-ghost btn-sm"><Icon.phone /> Preview Mobile</button>
      </div>
    </div>
  );
}

export default function StudioApp() {
  const [activeTab, setActiveTab] = useState<StudioTab>('editor');
  const [routes, setRoutes] = useState<Route[]>(STANAGE_ROUTES);
  const [selected, setSelected] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isolate, setIsolate] = useState(false);

  const selRoute = selected != null ? routes.find(r => r.n === selected) || null : null;

  const updateRoute = (updated: Route) => {
    setRoutes(rs => rs.map(r => r.n === updated.n ? updated : r));
  };
  const updateLine = (n: number, line: [number, number][]) => {
    setRoutes(rs => rs.map(r => r.n === n ? { ...r, line } : r));
  };

  const navItems = [
    { label: 'Dark Peak Grit Demo', type: 'guide' },
    { label: 'Bracken Edge', type: 'crag', active: true },
    { label: 'The Nose Buttress', type: 'sector', indent: true },
    { label: 'Central Walls', type: 'sector', indent: true },
    { label: 'Skyline Buttress', type: 'sector', indent: true },
    { label: 'Lime Kiln Quarry', type: 'crag' },
    { label: 'Horseshoe Quarry', type: 'crag' },
  ];

  return (
    <div className="st-app">
      {/* App bar */}
      <div className="st-appbar">
        <AtopoWordmark size={20} />
        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginLeft: 8 }}>Dark Peak Grit Demo</span>
        <span className="chip chip-rust" style={{ fontSize: 11.5 }}>Draft</span>
        <button className="btn btn-ghost btn-sm">Save Draft</button>
        <button className="btn btn-primary btn-sm">Publish Update</button>
      </div>

      {/* View tabs */}
      <div className="st-tabs">
        {(['editor', 'table', 'publish'] as const).map(t => (
          <button key={t} className={'st-tab' + (activeTab === t ? ' on' : '')} onClick={() => setActiveTab(t)}>
            {t === 'editor' ? 'Topo Editor' : t === 'table' ? 'Route Table' : 'Publish'}
          </button>
        ))}
      </div>

      <div className="st-body">
        {/* Left sidebar */}
        <div className="st-side">
          <div style={{ padding: '12px 18px 8px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>Content</span>
          </div>
          {navItems.map((item, i) => (
            <button key={i} className={'tree-row' + (item.active ? ' on' : '')}
              style={{ marginLeft: item.indent ? 16 : 0, paddingLeft: item.indent ? 14 : 18 }}>
              <span style={{ fontSize: 10, opacity: .5 }}>
                {item.type === 'guide' ? '📖' : item.type === 'crag' ? '🧗' : '—'}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main canvas */}
        {activeTab === 'editor' && (
          <div className="st-main">
            <div className="st-toolbar">
              <button className="tbtn on"><Icon.edit /> Select</button>
              <button className="tbtn" disabled><Icon.layers /> Draw Route</button>
              <div className="tbsep" />
              <button className="tbtn"><Icon.undo /> Undo</button>
              <button className="tbtn"><Icon.redo /> Redo</button>
              <div className="tbsep" />
              <button className={'tbtn' + (showLabels ? ' on' : '')} onClick={() => setShowLabels(v => !v)}>
                <Icon.eye /> Labels
              </button>
              <button className={'tbtn' + (isolate ? ' on' : '')} onClick={() => setIsolate(v => !v)}>
                <Icon.layers /> Isolate
              </button>
              <div className="tbsep" />
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)' }}>
                {routes.length} routes
              </span>
            </div>
            <div style={{ flex: 1, padding: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {selRoute && (
                <div style={{ position: 'absolute', top: 28, left: 28, zIndex: 20, background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, color: 'var(--ink-soft)', pointerEvents: 'none', boxShadow: 'var(--sh-sm)' }}>
                  <b style={{ color: 'var(--ink)' }}>{selRoute.name}</b> — drag white handles to adjust
                </div>
              )}
              <TopoStage
                photo={STANAGE_PHOTO}
                aspect={STANAGE_ASPECT}
                routes={routes}
                selected={selected}
                onSelect={setSelected}
                showLabels={showLabels}
                dimUnselected={isolate}
                editable={true}
                onUpdateLine={updateLine}
                stances={selRoute?.stances || null}
                style={{ flex: 1, borderRadius: 'var(--r-md)', overflow: 'hidden' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          <div className="st-main">
            <RouteTable routes={routes} selected={selected} onSelect={setSelected} />
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="st-main" style={{ overflow: 'auto' }}>
            <PublishPanel />
          </div>
        )}

        {/* Right inspector — only in editor mode */}
        {activeTab === 'editor' && (
          <div className="st-insp">
            <div style={{ padding: '12px 18px 8px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>Inspector</span>
            </div>
            <Inspector route={selRoute} onChange={updateRoute} />
          </div>
        )}
      </div>
    </div>
  );
}
