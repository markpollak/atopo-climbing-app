import { useState } from 'react';
import MobileApp from './screens/mobile/MobileApp';
import StudioApp from './screens/studio/StudioApp';
import AdminApp from './screens/admin/AdminApp';
import { AtopoWordmark, AtopoMark } from './components/Icons';

type AppView = 'landing' | 'mobile' | 'studio' | 'admin';

export default function App() {
  const [view, setView] = useState<AppView>('landing');

  if (view === 'mobile') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0 60px', background: 'var(--surface-2)' }} className="atopo-grain">
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <AtopoWordmark size={22} />
          <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 600 }}>Mobile</span>
          <button onClick={() => setView('landing')} style={{ fontSize: 12.5, color: 'var(--rust)', fontWeight: 700, background: 'none', border: 0, cursor: 'pointer' }}>← Back</button>
        </div>
        <MobileApp />
      </div>
    );
  }

  if (view === 'studio') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
          <button onClick={() => setView('landing')} style={{ fontSize: 12.5, color: 'var(--rust)', fontWeight: 700, background: 'rgba(255,255,255,.9)', border: '1px solid var(--line)', cursor: 'pointer', padding: '5px 12px', borderRadius: '0 0 8px 0', backdropFilter: 'blur(4px)' }}>← Landing</button>
        </div>
        <StudioApp />
      </div>
    );
  }

  if (view === 'admin') {
    return <AdminApp />;
  }

  // Landing
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--surface-2)' }} className="atopo-grain">
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <AtopoMark size={72} bg="var(--slate)" radius={18} />
        </div>
        <h1 style={{ fontSize: 48, letterSpacing: '-0.03em', marginBottom: 8 }}>Atopo</h1>
        <p style={{ fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 40px' }}>
          Offline-first climbing guide app. Download topo photos with live route lines, filter by grade, keep your logbook — all without a signal.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '14px 28px' }} onClick={() => setView('mobile')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/></svg>
            Mobile App
          </button>
          <button className="btn btn-dark" style={{ fontSize: 16, padding: '14px 28px' }} onClick={() => setView('studio')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Atopo Studio
          </button>
          <button className="btn" style={{ fontSize: 16, padding: '14px 28px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-soft)' }} onClick={() => setView('admin')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Admin
          </button>
        </div>

        <div style={{ marginTop: 48, display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { title: 'Offline-first', desc: 'Download guides and use them at the crag with no signal' },
            { title: 'Live route lines', desc: 'SVG overlays on topo photos, zoomable and pannable' },
            { title: 'Logbook', desc: 'Track projects, sends and ticks across all your climbing' },
            { title: 'Studio editor', desc: 'Drag-and-drop route line editor for guide authors' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'left', maxWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
