import { AtopoWordmark, Icon } from '../../components/Icons';
import { STANAGE_PHOTO, STANAGE_CRAG, STANAGE_ROUTES } from '../../data/stanage';
import type { useDownloads } from '../../storage/downloads';

function StatusRow({ dark = false }) {
  const c = dark ? '#fff' : 'var(--ink)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 24px 2px', color: c, fontWeight: 700, fontSize: 14, position: 'relative', zIndex: 55 }}>
      <span className="mono" style={{ fontWeight: 600 }}>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="3.5" width="3" height="7.5" rx="1"/><rect x="9" y="1.5" width="3" height="9.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1" opacity=".4"/></svg>
        <svg width="22" height="11" viewBox="0 0 24 12" fill="none" stroke={c} strokeWidth="1.2"><rect x="1" y="1" width="19" height="10" rx="3"/><rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill={c} stroke="none"/><rect x="21" y="4" width="2" height="4" rx="1" fill={c} stroke="none"/></svg>
      </span>
    </div>
  );
}
export { StatusRow };

function SectionHead({ title, action }: { title: string; action?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 20px 11px' }}>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      {action && <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--rust)', whiteSpace: 'nowrap' }}>{action}</span>}
    </div>
  );
}

interface Props {
  onOpenCrag: () => void;
  onOpenTopo: () => void;
  downloads: ReturnType<typeof useDownloads>;
}

export default function HomeScreen({ onOpenCrag, onOpenTopo, downloads }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)' }} className="thin-scroll atopo-grain">
      <StatusRow />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 4px' }}>
        <AtopoWordmark size={24} />
        <div className="pill-offline"><span className="dot"></span>All changes synced</div>
      </div>

      {/* Featured / continue card */}
      <div style={{ margin: '14px 20px 0', borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative', boxShadow: 'var(--sh-md)', cursor: 'pointer' }} onClick={onOpenTopo}>
        <div style={{ height: 188, position: 'relative', background: '#222' }}>
          <img src={STANAGE_PHOTO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '30% 50%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(18,18,15,.86), rgba(18,18,15,.05) 60%)' }}></div>
          <div style={{ position: 'absolute', top: 12, left: 12 }} className="pill-offline"><span className="dot"></span>Available offline</div>
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: '#fff' }}>
            <div className="seclabel" style={{ color: 'rgba(255,255,255,.7)' }}>Continue where you left off</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginTop: 3 }}>{STANAGE_CRAG.name}</div>
            <div style={{ fontSize: 12.5, opacity: .85, marginTop: 2 }}>{STANAGE_CRAG.area} · {STANAGE_CRAG.type} · {STANAGE_ROUTES.length} routes · {STANAGE_CRAG.gradeRange}</div>
          </div>
        </div>
      </div>

      <SectionHead title="Downloaded guides" action={downloads.downloads.length > 0 ? `${downloads.totalMb} MB used` : undefined} />
      {downloads.downloads.length === 0 ? (
        <div style={{ margin: '0 20px', padding: '18px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
          <div style={{ marginBottom: 6, fontSize: 22 }}>📥</div>
          No guides downloaded yet. Open a crag and tap <b>Download</b> to save it for offline use.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px' }} className="no-scrollbar">
          {downloads.downloads.map(d => (
            <div key={d.id} className="card" style={{ minWidth: 184, overflow: 'hidden', flex: 'none' }} onClick={onOpenCrag}>
              <div style={{ height: 96, background: '#222', position: 'relative' }}>
                <img src={d.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.crag.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 2 }}>{d.crag.area} · {d.routeCount} routes</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: 'var(--moss)', fontSize: 11.5, fontWeight: 700 }}>
                  <span className="dot" style={{ width: 6, height: 6 }}></span>Offline · {d.sizeMb} MB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHead title="Recently viewed" />
      <div style={{ padding: '0 20px' }}>
        {[
          { n: 'Stanage Edge', m: 'Peak District · Trad · 21 routes', crag: true },
          { n: 'Lime Kiln Quarry', m: 'Matlock · Sport · 36 routes' },
          { n: 'Horseshoe Quarry', m: 'Hope Valley · Sport · 88 routes' },
        ].map((c, i) => (
          <button key={i} onClick={c.crag ? onOpenCrag : undefined} className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', marginBottom: 10, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--moss)', flex: 'none' }}>
              <Icon.pin />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 15 }}>{c.n}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)', marginTop: 1 }}>{c.m}</span>
            </span>
            <span style={{ color: 'var(--ink-faint)' }}><Icon.chev /></span>
          </button>
        ))}
      </div>

      <SectionHead title="My projects" action="Logbook" />
      <div style={{ display: 'flex', gap: 10, padding: '0 20px' }}>
        {[['8', 'saved routes'], ['3', 'up to 6b'], ['2', 'this weekend']].map((s, i) => (
          <div key={i} className="card" style={{ flex: 1, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--rust)' }}>{s[0]}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.2 }}>{s[1]}</div>
          </div>
        ))}
      </div>

      <SectionHead title="My topos" action="+ Create" />
      <div style={{ padding: '0 20px 24px' }}>
        {['Home Board Problems', 'Club Training Wall', 'Font Trip 2026'].map((t, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', marginBottom: 9 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(63,95,75,.14)', color: 'var(--moss)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{t}</span>
            <span className="chip">Private</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 20px 24px', fontSize: 11, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
        Climbing is dangerous. Guide information may change. Always use your own judgement and check local access information.
      </div>
    </div>
  );
}
