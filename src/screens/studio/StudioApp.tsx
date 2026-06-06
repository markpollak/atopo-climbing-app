import { useState, useEffect, useRef, useCallback } from 'react';
import { AtopoWordmark, Icon } from '../../components/Icons';
import TopoStage from '../../components/TopoStage';
import { convertGrade } from '../../data/grades';
import { STANAGE_PHOTO, STANAGE_ASPECT } from '../../data/stanage';
import { api, type ApiRoute, type ApiCrag } from '../../api/client';
import type { Route } from '../../types';

type StudioTab = 'editor' | 'table' | 'publish';

function chaikin(pts: [number, number][], iterations = 2): [number, number][] {
  let p: [number, number][] = pts;
  for (let iter = 0; iter < iterations; iter++) {
    const np: [number, number][] = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      np.push([+(0.75*p[i][0] + 0.25*p[i+1][0]).toFixed(4), +(0.75*p[i][1] + 0.25*p[i+1][1]).toFixed(4)]);
      np.push([+(0.25*p[i][0] + 0.75*p[i+1][0]).toFixed(4), +(0.25*p[i][1] + 0.75*p[i+1][1]).toFixed(4)]);
    }
    np.push(p[p.length - 1]);
    p = np;
  }
  return p;
}

function DrawHelp() {
  const steps = [
    { key: 'Click', desc: 'Place a point on the topo' },
    { key: 'Double-click', desc: 'Finish the route line' },
    { key: 'Enter', desc: 'Finish (keyboard)' },
    { key: 'Backspace', desc: 'Remove last point' },
    { key: 'Esc', desc: 'Cancel drawing' },
  ];
  return (
    <div style={{ padding: '20px 18px' }}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20, lineHeight: 1.5 }}>
        Click on the topo photo to place waypoints along the route. Finish when done — the route will be saved automatically.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, background: 'var(--surface-2)', border: '1px solid var(--line-strong)', borderRadius: 5, padding: '3px 7px', color: 'var(--ink)', whiteSpace: 'nowrap', flex: 'none' }}>{s.key}</kbd>
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Convert ApiRoute → Route shape used by TopoStage / Inspector
function toRoute(r: ApiRoute): Route {
  return {
    n: r.n,
    name: r.name,
    grade: r.grade,
    stars: r.stars as 0 | 1 | 2 | 3,
    style: r.style as Route['style'],
    len: r.len,
    desc: r.desc,
    warn: r.warn ?? undefined,
    color: r.color,
    line: r.line,
    stances: r.stances,
    sector: undefined,
    status: r.status as Route['status'],
  };
}

// ─── Inspector ────────────────────────────────────────────────────────────────

function Inspector({
  route,
  onChange,
  saving,
}: {
  route: ApiRoute | null;
  onChange: (r: ApiRoute) => void;
  saving: boolean;
}) {
  if (!route)
    return (
      <div style={{ padding: 24, color: 'var(--ink-faint)', fontSize: 13.5, textAlign: 'center', marginTop: 40 }}>
        <Icon.edit />
        <div style={{ marginTop: 12 }}>Select a route to edit its details</div>
      </div>
    );

  const set = (key: keyof ApiRoute, val: unknown) => onChange({ ...route, [key]: val });

  return (
    <div style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: route.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, flex: 'none' }}>{route.n}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, flex: 1 }}>{route.name || 'Unnamed route'}</span>
        {saving && <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>saving…</span>}
      </div>

      <div className="fld-row">
        <div className="fld" style={{ flex: '0 0 48px' }}>
          <label>#</label>
          <input value={route.n} readOnly style={{ background: 'var(--surface-2)', color: 'var(--ink-faint)' }} />
        </div>
        <div className="fld" style={{ flex: 1 }}>
          <label>Name</label>
          <input value={route.name} onChange={e => set('name', e.target.value)} onBlur={() => onChange(route)} />
        </div>
      </div>

      <div className="fld-row">
        <div className="fld" style={{ flex: 1 }}>
          <label>Grade</label>
          <input value={route.grade} onChange={e => set('grade', e.target.value)} onBlur={() => onChange(route)} />
        </div>
        <div className="fld" style={{ flex: 1 }}>
          <label>Stars</label>
          <select value={route.stars} onChange={e => { const r2 = { ...route, stars: Number(e.target.value) as ApiRoute['stars'] }; onChange(r2); }}>
            {[0, 1, 2, 3].map(n => <option key={n} value={n}>{'★'.repeat(n) || 'None'}</option>)}
          </select>
        </div>
      </div>

      <div className="fld-row">
        <div className="fld" style={{ flex: 1 }}>
          <label>Style</label>
          <select value={route.style} onChange={e => { const r2 = { ...route, style: e.target.value }; onChange(r2); }}>
            {['Trad', 'Sport', 'Boulder', 'Top-rope'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="fld" style={{ flex: '0 0 70px' }}>
          <label>Length (m)</label>
          <input type="number" value={route.len} onChange={e => set('len', Number(e.target.value))} onBlur={() => onChange(route)} />
        </div>
      </div>

      <div className="fld">
        <label>Description</label>
        <textarea rows={4} value={route.desc} onChange={e => set('desc', e.target.value)} onBlur={() => onChange(route)} />
      </div>

      <div className="fld">
        <label>Warning notes</label>
        <textarea rows={2} value={route.warn ?? ''} onChange={e => set('warn', e.target.value)} onBlur={() => onChange(route)} />
      </div>

      {route.stances && route.stances.length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 2 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-faint)', marginBottom: 12 }}>Pitches &amp; stances</div>
          {route.stances.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <svg width="12" height="12" viewBox="0 0 8 8" style={{ flex: 'none' }}><path d="M4 0.5 L7.5 4 L4 7.5 L0.5 4 Z" fill={route.color} /></svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', flex: 'none', minWidth: 60 }}>P{s.p} · {s.x.toFixed(2)} {s.y.toFixed(2)}</span>
              <input value={s.note} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 7, padding: '5px 8px', fontSize: 12, fontFamily: 'var(--font-ui)' }}
                onChange={e => {
                  const ns = route.stances.map((ss, j) => j === i ? { ...ss, note: e.target.value } : ss);
                  set('stances', ns);
                }}
                onBlur={() => onChange(route)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Route table ──────────────────────────────────────────────────────────────

function RouteTable({ routes, selected, onSelect }: { routes: ApiRoute[]; selected: number | null; onSelect: (id: number) => void }) {
  return (
    <div style={{ flex: 1, overflow: 'auto' }} className="thin-scroll">
      <table className="st-table">
        <thead>
          <tr><th>#</th><th>Route name</th><th>Grade</th><th>Stars</th><th>Style</th><th>m</th><th>Status</th></tr>
        </thead>
        <tbody>
          {routes.map(r => (
            <tr key={r.id} className={selected === r.id ? 'on' : ''} onClick={() => onSelect(r.id)} style={{ cursor: 'pointer' }}>
              <td><span style={{ width: 22, height: 22, borderRadius: '50%', background: r.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11 }}>{r.n}</span></td>
              <td style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.name}</td>
              <td><span className="grade" style={{ fontSize: 11, padding: '2px 6px' }}>{r.grade}</span></td>
              <td><span className="stars" style={{ fontSize: 11 }}>{'★'.repeat(r.stars)}</span></td>
              <td>{r.style}</td>
              <td>{r.len}</td>
              <td>
                {r.status && r.status !== 'none' && (
                  <span className={'chip chip-' + (['sent', 'flash'].includes(r.status) ? 'moss' : 'rust')} style={{ padding: '2px 7px', fontSize: 10.5 }}>{r.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Photo upload panel ───────────────────────────────────────────────────────

function PhotoUpload({ crag, onUploaded }: { crag: ApiCrag; onUploaded: (c: ApiCrag) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const updated = await api.crags.uploadPhoto(crag.id, file);
      onUploaded(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const currentSrc = crag.photo_url || null;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-faint)', marginBottom: 12 }}>Topo photo</div>

      {currentSrc && (
        <div style={{ marginBottom: 14, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--line)' }}>
          <img src={currentSrc} alt="Topo" style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }} />
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--rust)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--r-md)',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragging ? 'rgba(200,107,60,.06)' : 'transparent',
          transition: 'all .15s',
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        {uploading
          ? <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Uploading…</span>
          : <>
              <div style={{ fontSize: 22, marginBottom: 6 }}>🏔</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{currentSrc ? 'Replace photo' : 'Upload topo photo'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 3 }}>Drag &amp; drop or click — JPG / PNG</div>
            </>
        }
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--rust)' }}>{error}</div>}
    </div>
  );
}

// ─── Publish panel ────────────────────────────────────────────────────────────

function PublishPanel({ routes, crag, onUploaded }: { routes: ApiRoute[]; crag: ApiCrag | null; onUploaded: (c: ApiCrag) => void }) {
  const checks = crag ? [
    { label: 'All routes have grades', ok: routes.every(r => r.grade) },
    { label: 'Topo photo uploaded', ok: !!crag.photo_url },
    { label: 'All routes have descriptions', ok: routes.every(r => r.desc) },
    { label: 'Crag has access notes', ok: !!crag.access_notes },
  ] : [];

  return (
    <div style={{ flex: 1, padding: 28, overflow: 'auto' }} className="thin-scroll">
      <h3 style={{ fontSize: 20, marginBottom: 6 }}>Publish checklist</h3>
      <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 22 }}>All items should be green before publishing.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {checks.map((c, i) => (
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
      {crag && <PhotoUpload crag={crag} onUploaded={onUploaded} />}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button className="btn btn-ghost btn-sm">Save Draft</button>
        <button className="btn btn-primary">Publish Update v1.1</button>
      </div>
    </div>
  );
}

// ─── StudioApp ────────────────────────────────────────────────────────────────

const CRAG_ID = 1;

export default function StudioApp() {
  const [activeTab, setActiveTab] = useState<StudioTab>('editor');
  const [crag, setCrag] = useState<ApiCrag | null>(null);
  const [apiRoutes, setApiRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isolate, setIsolate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<'select' | 'draw'>('select');

  // Photo: use uploaded URL if present, fall back to bundled asset
  const photoSrc = crag?.photo_url || STANAGE_PHOTO;
  const photoAspect = crag?.photo_aspect || STANAGE_ASPECT;

  useEffect(() => {
    Promise.all([api.crags.get(CRAG_ID), api.routes.list(CRAG_ID)])
      .then(([c, rs]) => { setCrag(c); setApiRoutes(rs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selApiRoute = selectedId != null ? apiRoutes.find(r => r.id === selectedId) ?? null : null;
  const selN = selApiRoute?.n ?? null;

  // Convert to Route[] for TopoStage (keyed by n)
  const routes: Route[] = apiRoutes.map(toRoute);

  // Save a route to the API (debounced via useRef so rapid keystrokes batch)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveRoute = useCallback((updated: ApiRoute) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setApiRoutes(rs => rs.map(r => r.id === updated.id ? updated : r));
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const saved = await api.routes.update(CRAG_ID, updated.id, {
          name: updated.name,
          grade: updated.grade,
          stars: updated.stars,
          style: updated.style,
          len: updated.len,
          desc: updated.desc,
          warn: updated.warn,
          stances: updated.stances,
          status: updated.status,
        });
        setApiRoutes(rs => rs.map(r => r.id === saved.id ? saved : r));
      } catch (e) {
        console.error('Save failed:', e);
      } finally {
        setSaving(false);
      }
    }, 600);
  }, []);

  const handleDrawComplete = useCallback(async (line: [number, number][]) => {
    setTool('select');
    setSaving(true);
    try {
      const created = await api.routes.create(CRAG_ID, { line });
      setApiRoutes(rs => [...rs, created]);
      setSelectedId(created.id);
    } catch (e) {
      console.error('Create route failed:', e);
    } finally {
      setSaving(false);
    }
  }, []);

  // Save line coords immediately on drag-end
  const saveLine = useCallback(async (n: number, line: [number, number][]) => {
    setApiRoutes(rs => rs.map(r => r.n === n ? { ...r, line } : r));
    const target = apiRoutes.find(r => r.n === n);
    if (!target) return;
    setSaving(true);
    try {
      const saved = await api.routes.update(CRAG_ID, target.id, { line });
      setApiRoutes(rs => rs.map(r => r.id === saved.id ? saved : r));
    } catch (e) {
      console.error('Line save failed:', e);
    } finally {
      setSaving(false);
    }
  }, [apiRoutes]);

  const navItems = [
    { label: 'Dark Peak Grit Demo', type: 'guide' },
    { label: crag?.name || 'Stanage Edge', type: 'crag', active: true },
    ...((crag as ApiCrag & { sectors?: { name: string }[] })?.sectors ?? []).map(s => ({ label: s.name, type: 'sector', indent: true })),
  ];

  if (loading) {
    return (
      <div className="st-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div className="st-app">
      {/* App bar */}
      <div className="st-appbar">
        <AtopoWordmark size={20} />
        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginLeft: 8 }}>Dark Peak Grit Demo</span>
        <span className="chip chip-rust" style={{ fontSize: 11.5 }}>Draft</span>
        {saving && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)' }}>Saving…</span>}
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
            <button key={i} className={'tree-row' + ((item as { active?: boolean }).active ? ' on' : '')}
              style={{ marginLeft: (item as { indent?: boolean }).indent ? 16 : 0, paddingLeft: (item as { indent?: boolean }).indent ? 14 : 18 }}>
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
              <button className={'tbtn' + (tool === 'select' ? ' on' : '')} onClick={() => setTool('select')}><Icon.edit /> Select</button>
              <button className={'tbtn' + (tool === 'draw' ? ' on' : '')} onClick={() => setTool(t => t === 'draw' ? 'select' : 'draw')}><Icon.layers /> Draw Route</button>
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
              {selApiRoute && (
                <div style={{ position: 'absolute', top: 28, left: 28, zIndex: 20, background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, color: 'var(--ink-soft)', pointerEvents: 'none', boxShadow: 'var(--sh-sm)' }}>
                  <b style={{ color: 'var(--ink)' }}>{selApiRoute.name}</b> — drag white handles to adjust
                </div>
              )}
              <TopoStage
                photo={photoSrc}
                aspect={photoAspect}
                routes={routes}
                selected={selN}
                onSelect={n => {
                  if (tool === 'select') {
                    const r = apiRoutes.find(r => r.n === n);
                    setSelectedId(r?.id ?? null);
                  }
                }}
                showLabels={showLabels}
                dimUnselected={isolate}
                editable={tool === 'select'}
                onUpdateLine={saveLine}
                stances={selApiRoute?.stances || null}
                drawingMode={tool === 'draw'}
                onDrawComplete={handleDrawComplete}
                onDrawCancel={() => setTool('select')}
                style={{ flex: 1, borderRadius: 'var(--r-md)', overflow: 'hidden' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          <div className="st-main">
            <RouteTable routes={apiRoutes} selected={selectedId} onSelect={setSelectedId} />
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="st-main" style={{ overflow: 'auto' }}>
            <PublishPanel routes={apiRoutes} crag={crag} onUploaded={c => setCrag(c)} />
          </div>
        )}

        {/* Right inspector — only in editor mode */}
        {activeTab === 'editor' && (
          <div className="st-insp">
            <div style={{ padding: '12px 18px 8px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                {tool === 'draw' ? 'Draw Route' : 'Inspector'}
              </span>
            </div>
            {tool === 'draw' ? (
              <DrawHelp />
            ) : (
              <>
                <Inspector route={selApiRoute} onChange={saveRoute} saving={saving} />
                {selApiRoute && (
                  <div style={{ padding: '0 18px 18px' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%' }}
                      onClick={async () => {
                        const smoothed = chaikin(selApiRoute.line, 2);
                        await saveRoute({ ...selApiRoute, line: smoothed });
                      }}
                    >
                      Smooth line
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
