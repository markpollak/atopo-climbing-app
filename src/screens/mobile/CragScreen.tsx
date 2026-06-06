import { useState } from 'react';
import { Icon } from '../../components/Icons';
import { BRACKEN_PHOTO, BRACKEN_CRAG, BRACKEN_ROUTES } from '../../data/bracken';

function gradeBands(routes: typeof BRACKEN_ROUTES) {
  const order = ['VDiff', 'Severe', 'HS', 'VS', 'HVS', 'E1', 'E2', 'E3', 'E4'];
  const counts: Record<string, number> = {};
  routes.forEach(r => { const k = r.grade.split(' ')[0]; counts[k] = (counts[k] || 0) + 1; });
  return order.filter(k => counts[k]).map(k => ({ k, c: counts[k] }));
}

interface Props {
  onBack: () => void;
  onOpenTopo: () => void;
}

export default function CragScreen({ onBack, onOpenTopo }: Props) {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', 'Approach', 'Access', 'Sectors'];
  const c = BRACKEN_CRAG;
  const bands = gradeBands(BRACKEN_ROUTES);
  const maxc = Math.max(...bands.map(b => b.c));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }} className="thin-scroll">
        <div style={{ position: 'relative', height: 260, background: '#222' }}>
          <img src={BRACKEN_PHOTO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '30% 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, var(--surface) 1%, rgba(18,18,15,.15) 40%, rgba(18,18,15,.5))' }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 16px 0' }}>
            <button className="iconbtn" onClick={onBack}><Icon.back /></button>
            <div className="pill-offline" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><span className="dot"></span>Available offline</div>
          </div>
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 14, color: '#fff' }}>
            <div className="seclabel" style={{ color: 'rgba(255,255,255,.72)' }}>{c.area}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, lineHeight: 1.02, marginTop: 2 }}>{c.name}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '16px 20px 4px', flexWrap: 'wrap' }}>
          <span className="chip chip-on">{c.type}</span>
          <span className="chip">{c.routeCount} routes</span>
          <span className="chip">{c.gradeRange}</span>
          <span className="chip">{c.walkin} walk-in</span>
        </div>
        <div style={{ padding: '8px 20px 0', fontSize: 13.5, color: 'var(--ink-soft)' }}>{c.aspect}</div>

        <div style={{ display: 'flex', gap: 6, padding: '16px 20px 0', borderBottom: '1px solid var(--line)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ border: 0, background: 'none', cursor: 'pointer', padding: '6px 2px 12px', margin: '0 8px 0 0',
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: tab === t ? 'var(--ink)' : 'var(--ink-faint)',
              borderBottom: tab === t ? '2.5px solid var(--rust)' : '2.5px solid transparent' }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: '18px 20px 20px' }}>
          {tab === 'Overview' && (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.62, color: 'var(--ink-soft)', margin: '0 0 18px' }}>
                A classic gritstone edge strung high above the bracken-cloaked moor. Twenty routes climb the buttresses and arêtes from gentle VDiffs to bold modern testpieces, with bullet-hard rock and long evening sun.
              </p>
              <div className="seclabel" style={{ marginBottom: 10 }}>Grade spread</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 84 }}>
                {bands.map(b => (
                  <div key={b.k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: '100%', height: `${(b.c / maxc) * 64}px`, background: 'var(--warm-stone)', borderRadius: '5px 5px 0 0' }}></div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-faint)' }}>{b.k}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'Approach' && (
            <div style={{ fontSize: 15, lineHeight: 1.62, color: 'var(--ink-soft)' }}>
              <p style={{ marginTop: 0 }}><b style={{ color: 'var(--ink)' }}>Walk-in · 15 min.</b> From the lay-by, follow the well-worn path up through the bracken, bearing right below the first buttresses.</p>
              <div className="card" style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                <span style={{ color: 'var(--moss)' }}><Icon.pin /></span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>Parking</div><div style={{ fontSize: 12.5 }}>Roadside lay-by, space for ~8 cars. Don't block the gate.</div></div>
              </div>
            </div>
          )}
          {tab === 'Access' && (
            <div style={{ fontSize: 15, lineHeight: 1.62, color: 'var(--ink-soft)' }}>
              <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--rust)', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: 'var(--rust)', fontSize: 13.5, marginBottom: 3 }}>Seasonal note</div>
                <div style={{ fontSize: 13.5 }}>Ground-nesting birds Mar–Jun. Keep to paths and check local notices before climbing the Skyline buttress.</div>
              </div>
              <p style={{ marginTop: 0 }}>Open access land. No restrictions on the main edge. Please use established descents.</p>
            </div>
          )}
          {tab === 'Sectors' && (
            <div>
              {c.sectors.map((s, i) => (
                <button key={i} onClick={onOpenTopo} className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 14px', marginBottom: 10, textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--moss)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 15 }}>{s}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)' }}>Open topo</span>
                  </span>
                  <span style={{ color: 'var(--ink-faint)' }}><Icon.chev /></span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 'none', display: 'flex', gap: 9, padding: '12px 16px', borderTop: '1px solid var(--line)', background: 'var(--card)' }}>
        <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={onOpenTopo}>Open Topo</button>
        <button className="btn btn-ghost btn-sm"><Icon.dl /> Crag</button>
        <button className="btn btn-ghost btn-sm"><Icon.pin /></button>
      </div>
    </div>
  );
}
