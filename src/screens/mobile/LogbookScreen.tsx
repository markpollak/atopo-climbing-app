import { StatusRow } from './HomeScreen';
import { AtopoMark } from '../../components/Icons';

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', margin: '22px 20px 11px' }}>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
    </div>
  );
}

export default function LogbookScreen() {
  const ticks = [
    { n: 'Gritstone Arête', g: 'HVS 5a', c: 'Bracken Edge', d: 'Sent today · Led clean', col: 'var(--moss)' },
    { n: 'The Nose', g: 'VDiff', c: 'Bracken Edge', d: 'Yesterday · Flashed', col: 'var(--moss)' },
    { n: 'Heather Groove', g: 'HS 4b', c: 'Bracken Edge', d: 'Sat · Flashed', col: 'var(--moss)' },
  ];
  const projects = [
    { n: 'Quiet Storm', g: 'E2 5c', c: 'Bracken Edge' },
    { n: 'The Sentinel', g: 'E1 5b', c: 'Bracken Edge' },
    { n: 'The Long Layback', g: 'E1 5b', c: 'Bracken Edge' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)' }} className="thin-scroll atopo-grain">
      <StatusRow />
      <div style={{ padding: '8px 20px 0' }}><h2 style={{ fontSize: 26 }}>Logbook</h2></div>
      <div style={{ display: 'flex', gap: 10, padding: '14px 20px 0' }}>
        {[['42', 'routes ticked'], ['7', 'this month'], ['E2', 'best lead']].map((s, i) => (
          <div key={i} className="card" style={{ flex: 1, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--rust)' }}>{s[0]}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{s[1]}</div>
          </div>
        ))}
      </div>
      <SectionHead title="Recent ticks" />
      <div style={{ padding: '0 20px' }}>
        {ticks.map((t, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 10 }}>
            <span style={{ width: 8, alignSelf: 'stretch', borderRadius: 99, background: t.col, flex: 'none' }}></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{t.n}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 1 }}>{t.c} · {t.d}</div>
            </div>
            <span className="grade">{t.g}</span>
          </div>
        ))}
      </div>
      <SectionHead title="Current projects" />
      <div style={{ padding: '0 20px 30px' }}>
        {projects.map((p, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 10 }}>
            <span className="chip chip-rust" style={{ flex: 'none' }}>Project</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.n}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 1 }}>{p.c}</div>
            </div>
            <span className="grade">{p.g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapScreen({ onOpenCrag }: { onOpenCrag: () => void }) {
  const markers = [
    { x: 34, y: 42, n: 'Dark Peak', c: 42, big: true },
    { x: 20, y: 60, n: 'North Wales', c: 12 },
    { x: 54, y: 30, n: 'Yorkshire', c: 18 },
    { x: 62, y: 66, n: 'Portland', c: 9 },
    { x: 78, y: 50, n: 'Costa Blanca', c: 24 },
    { x: 44, y: 78, n: 'Fontainebleau', c: 60 },
  ];
  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#dfe6e3,#cdd8d2)' }}>
      <StatusRow dark={false} />
      <div style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: 'repeating-linear-gradient(0deg, rgba(63,95,75,.08) 0 1px, transparent 1px 38px), repeating-linear-gradient(90deg, rgba(63,95,75,.08) 0 1px, transparent 1px 38px)' }}></div>
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: .5 }}>
          <path d="M-5 70 Q 25 55 45 64 T 105 58" fill="none" stroke="#9fb0a6" strokeWidth="0.6" />
          <path d="M-5 40 Q 30 30 55 40 T 105 35" fill="none" stroke="#9fb0a6" strokeWidth="0.6" />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 56, left: 16, right: 16, zIndex: 10 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
          <span style={{ color: 'var(--ink-faint)' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>
          <span style={{ flex: 1, color: 'var(--ink-faint)', fontSize: 14 }}>Search areas, crags, routes…</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto' }} className="no-scrollbar">
          {['Downloaded', 'Sport', 'Trad', 'Bouldering'].map((f, i) => (
            <span key={i} className={'chip' + (i === 0 ? ' chip-on' : '')}>{f}</span>
          ))}
        </div>
      </div>
      {markers.map((m, i) => (
        <button key={i} onClick={m.big ? onOpenCrag : undefined}
          style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%,-100%)', border: 0, background: 'none', cursor: 'pointer', zIndex: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: m.big ? 'var(--rust)' : 'var(--slate)', color: '#fff', padding: '5px 10px 5px 7px', borderRadius: 999, boxShadow: 'var(--sh-md)', fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: 'var(--font-mono)' }}>{m.c}</span>
            {m.n}
          </div>
          <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${m.big ? 'var(--rust)' : 'var(--slate)'}`, margin: '0 auto' }}></div>
        </button>
      ))}
      <button className="btn btn-dark btn-sm" style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 10, boxShadow: 'var(--sh-md)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg> Near me
      </button>
    </div>
  );
}

