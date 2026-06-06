import { GRADE_SYSTEMS } from '../../data/grades';
import { AtopoMark, AtopoWordmark } from '../../components/Icons';
import type { GradeSystem } from '../../types';

interface Props {
  gradeSystem: GradeSystem;
  onSetGradeSystem: (g: GradeSystem) => void;
}

function Row({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'none', border: 0, borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left', cursor: onClick ? 'pointer' : 'default', fontFamily: 'var(--font-ui)' }}>
      <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{label}</span>
      {value && <span style={{ fontSize: 13.5, color: 'var(--ink-faint)', fontWeight: 600 }}>{value}</span>}
    </button>
  );
}

export default function ProfileScreen({ gradeSystem, onSetGradeSystem }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)' }} className="thin-scroll atopo-grain">
      {/* Header */}
      <div style={{ padding: '36px 20px 20px', textAlign: 'center', borderBottom: '1px solid var(--line)', background: 'var(--card)' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <AtopoMark size={44} bg="" stone="rgba(255,255,255,.35)" route="var(--rust)" />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ink)' }}>Mark</div>
        <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 3 }}>mark@example.com</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
          {[['42', 'Ticked'], ['8', 'Projects'], ['E2', 'Best']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--rust)' }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade system */}
      <div style={{ marginTop: 24, marginBottom: 6, padding: '0 20px' }}>
        <div className="seclabel">Grade system</div>
      </div>
      <div style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        {GRADE_SYSTEMS.map(gs => (
          <button key={gs.id} onClick={() => onSetGradeSystem(gs.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '1px solid var(--line)', background: 'none', border: 0, borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{gs.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 1 }}>
                {gs.id === 'uk' ? 'VDiff, Severe, HS, VS, HVS, E1…' : gs.id === 'fr' ? '4, 5, 6a, 6b, 7a, 8a…' : '5.8, 5.10a, 5.11d…'}
              </div>
            </div>
            {gradeSystem === gs.id && (
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rust)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Preferences */}
      <div style={{ marginTop: 24, marginBottom: 6, padding: '0 20px' }}>
        <div className="seclabel">Preferences</div>
      </div>
      <div style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <Row label="Offline storage" value="2.1 GB used" />
        <Row label="Auto-download updates" value="On" />
        <Row label="Show star ratings" value="On" />
        <Row label="Default map style" value="Terrain" />
      </div>

      {/* About */}
      <div style={{ marginTop: 24, marginBottom: 6, padding: '0 20px' }}>
        <div className="seclabel">About</div>
      </div>
      <div style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <Row label="Version" value="1.0.0" />
        <Row label="Atopo Studio" value="Open →" />
        <Row label="Privacy policy" />
        <Row label="Terms of use" />
      </div>

      <div style={{ padding: '20px 20px 32px', textAlign: 'center' }}>
        <AtopoWordmark size={18} color="var(--ink-faint)" route="var(--warm-stone)" />
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 6 }}>Climbing guides that work at the crag.</div>
      </div>
    </div>
  );
}
