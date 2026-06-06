import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Icon } from '../../components/Icons';
import { colors } from '../../theme';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface CragMarker {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  routes: number;
  type: 'Trad' | 'Sport' | 'Boulder';
  downloaded: boolean;
  featured?: boolean;
}

const CRAGS: CragMarker[] = [
  { id: 'stanage',    name: 'Stanage Edge',      area: 'Peak District', lat: 53.3598, lng: -1.6550, routes: 21,  type: 'Trad',  downloaded: true,  featured: true },
  { id: 'froggatt',   name: 'Froggatt Edge',     area: 'Peak District', lat: 53.3022, lng: -1.6317, routes: 45,  type: 'Trad',  downloaded: false },
  { id: 'curbar',     name: 'Curbar Edge',       area: 'Peak District', lat: 53.2942, lng: -1.6269, routes: 52,  type: 'Trad',  downloaded: false },
  { id: 'burbage',    name: 'Burbage South',     area: 'Peak District', lat: 53.3380, lng: -1.6602, routes: 38,  type: 'Trad',  downloaded: true  },
  { id: 'horseshoe',  name: 'Horseshoe Quarry',  area: 'Hope Valley',   lat: 53.3453, lng: -1.7358, routes: 88,  type: 'Sport', downloaded: true  },
  { id: 'limekiln',   name: 'Lime Kiln Quarry',  area: 'Matlock',       lat: 53.1424, lng: -1.5578, routes: 36,  type: 'Sport', downloaded: false },
  { id: 'stoney',     name: 'Stoney Middleton',  area: 'Peak District', lat: 53.2703, lng: -1.6455, routes: 62,  type: 'Sport', downloaded: false },
  { id: 'cratcliffe', name: 'Cratcliffe Tor',    area: 'Peak District', lat: 53.1808, lng: -1.6717, routes: 24,  type: 'Trad',  downloaded: false },
];

const TYPE_COLORS: Record<string, string> = {
  Trad: colors.slate,
  Sport: colors.rust,
  Boulder: colors.moss,
};

// Fallback when no API key — styled CSS map
function FallbackMap({ crags, onOpenCrag }: { crags: CragMarker[]; onOpenCrag: (id: string) => void }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(160deg,#dfe6e3,#cdd8d2)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: .4,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(63,95,75,.08) 0 1px, transparent 1px 38px), repeating-linear-gradient(90deg, rgba(63,95,75,.08) 0 1px, transparent 1px 38px)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M-5 70 Q 25 55 45 64 T 105 58" fill="none" stroke="#9fb0a6" strokeWidth="0.6"/>
        <path d="M-5 40 Q 30 30 55 40 T 105 35" fill="none" stroke="#9fb0a6" strokeWidth="0.6"/>
      </svg>
      <div style={{ position: 'absolute', top: '12%', left: '8%', right: '8%', bottom: '8%' }}>
        {crags.map((c, i) => {
          const positions = [
            { left: '30%', top: '28%' }, { left: '42%', top: '48%' }, { left: '48%', top: '55%' },
            { left: '26%', top: '38%' }, { left: '22%', top: '52%' }, { left: '55%', top: '65%' },
            { left: '45%', top: '62%' }, { left: '38%', top: '35%' },
          ];
          const pos = positions[i] || { left: `${20 + i * 10}%`, top: `${30 + i * 8}%` };
          return (
            <button key={c.id} onClick={() => onOpenCrag(c.id)}
              style={{ position: 'absolute', ...pos, transform: 'translate(-50%, -100%)', border: 0, background: 'none', cursor: 'pointer', zIndex: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.featured ? colors.rust : colors.slate, color: '#fff',
                padding: '5px 10px 5px 7px', borderRadius: 999, boxShadow: '0 4px 12px rgba(35,38,36,.25)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: 'var(--font-mono)' }}>{c.routes}</span>
                {c.name}
                {c.downloaded && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7de8a8' }} />}
              </div>
              <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                borderTop: `7px solid ${c.featured ? colors.rust : colors.slate}`, margin: '0 auto' }} />
            </button>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <div style={{ background: 'rgba(255,255,255,.85)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: colors.inkSoft, backdropFilter: 'blur(6px)' }}>
          Add VITE_GOOGLE_MAPS_API_KEY to .env for live map
        </div>
      </div>
    </div>
  );
}

interface Props {
  onOpenCrag: (id?: string) => void;
}

const PEAK_DISTRICT_CENTER = { lat: 53.28, lng: -1.65 };
const FILTERS = ['All', 'Downloaded', 'Trad', 'Sport', 'Boulder'] as const;

export default function MapScreen({ onOpenCrag }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedCrag, setSelectedCrag] = useState<CragMarker | null>(null);

  const filteredCrags = CRAGS.filter(c => {
    if (activeFilter === 'Downloaded') return c.downloaded;
    if (activeFilter === 'Trad' || activeFilter === 'Sport' || activeFilter === 'Boulder') return c.type === activeFilter;
    return true;
  });

  const handleMarkerClick = (crag: CragMarker) => setSelectedCrag(crag);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Search + filters */}
      <div style={{ padding: '36px 14px 10px', background: 'var(--card)', borderBottom: '1px solid var(--line)', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', padding: '10px 14px', border: '1px solid var(--line)' }}>
          <Icon.search />
          <span style={{ flex: 1, fontSize: 14, color: 'var(--ink-faint)' }}>Search areas, crags, routes…</span>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 10, overflowX: 'auto' }} className="no-scrollbar">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={'chip' + (activeFilter === f ? ' chip-on' : '')} style={{ cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {!MAPS_API_KEY ? (
          <FallbackMap crags={filteredCrags} onOpenCrag={(id) => {
            const c = CRAGS.find(x => x.id === id);
            if (c?.featured) onOpenCrag(id);
          }} />
        ) : (
          <APIProvider apiKey={MAPS_API_KEY}>
            <Map
              defaultCenter={PEAK_DISTRICT_CENTER}
              defaultZoom={11}
              mapId="atopo-map"
              gestureHandling="greedy"
              disableDefaultUI
              style={{ width: '100%', height: '100%' }}
            >
              {filteredCrags.map(crag => (
                <AdvancedMarker key={crag.id} position={{ lat: crag.lat, lng: crag.lng }} onClick={() => handleMarkerClick(crag)}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: crag.featured ? colors.rust : colors.slate,
                      color: '#fff', padding: '5px 10px 5px 7px',
                      borderRadius: 999, fontWeight: 700, fontSize: 12,
                      whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(35,38,36,.3)',
                      border: selectedCrag?.id === crag.id ? '2px solid #fff' : '2px solid transparent',
                    }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: 'monospace' }}>{crag.routes}</span>
                      {crag.name}
                      {crag.downloaded && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7de8a8' }} />}
                    </div>
                    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${crag.featured ? colors.rust : colors.slate}` }} />
                  </div>
                </AdvancedMarker>
              ))}

              {selectedCrag && (
                <InfoWindow position={{ lat: selectedCrag.lat, lng: selectedCrag.lng }} onCloseClick={() => setSelectedCrag(null)}>
                  <div style={{ fontFamily: 'var(--font-ui)', padding: 4, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: colors.ink }}>{selectedCrag.name}</div>
                    <div style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{selectedCrag.area} · {selectedCrag.type} · {selectedCrag.routes} routes</div>
                    {selectedCrag.downloaded && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11.5, fontWeight: 700, color: colors.moss }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.moss, display: 'inline-block' }} />
                        Available offline
                      </div>
                    )}
                    <button onClick={() => { onOpenCrag(selectedCrag.id); setSelectedCrag(null); }}
                      style={{ marginTop: 10, width: '100%', background: colors.rust, color: '#fff', border: 0, borderRadius: 8, padding: '7px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Open Crag →
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        )}
      </div>
    </div>
  );
}
