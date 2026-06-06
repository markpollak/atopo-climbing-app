import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { Icon } from '../../components/Icons';
import { colors } from '../../theme';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

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
  { id: 'stanage',    name: 'Stanage Edge',     area: 'Peak District', lat: 53.3598, lng: -1.6550, routes: 21, type: 'Trad',   downloaded: true,  featured: true },
  { id: 'froggatt',  name: 'Froggatt Edge',    area: 'Peak District', lat: 53.3022, lng: -1.6317, routes: 45, type: 'Trad',   downloaded: false },
  { id: 'curbar',    name: 'Curbar Edge',      area: 'Peak District', lat: 53.2942, lng: -1.6269, routes: 52, type: 'Trad',   downloaded: false },
  { id: 'burbage',   name: 'Burbage South',    area: 'Peak District', lat: 53.3380, lng: -1.6602, routes: 38, type: 'Trad',   downloaded: true  },
  { id: 'horseshoe', name: 'Horseshoe Quarry', area: 'Hope Valley',   lat: 53.3453, lng: -1.7358, routes: 88, type: 'Sport',  downloaded: true  },
  { id: 'limekiln',  name: 'Lime Kiln Quarry', area: 'Matlock',       lat: 53.1424, lng: -1.5578, routes: 36, type: 'Sport',  downloaded: false },
  { id: 'stoney',    name: 'Stoney Middleton', area: 'Peak District', lat: 53.2703, lng: -1.6455, routes: 62, type: 'Sport',  downloaded: false },
  { id: 'cratcliffe',name: 'Cratcliffe Tor',   area: 'Peak District', lat: 53.1808, lng: -1.6717, routes: 24, type: 'Trad',   downloaded: false },
];

const FILTERS = ['All', 'Downloaded', 'Trad', 'Sport', 'Boulder'] as const;

// CSS fallback map when no token provided
function FallbackMap({ crags, onMarkerClick }: { crags: CragMarker[]; onMarkerClick: (c: CragMarker) => void }) {
  const positions = [
    { left: '38%', top: '30%' }, { left: '50%', top: '50%' }, { left: '52%', top: '56%' },
    { left: '33%', top: '40%' }, { left: '28%', top: '54%' }, { left: '58%', top: '68%' },
    { left: '48%', top: '64%' }, { left: '42%', top: '37%' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg,#e8ede9,#d4ddd6)' }}>
      {/* Grid lines */}
      <div style={{ position: 'absolute', inset: 0, opacity: .35,
        backgroundImage: 'repeating-linear-gradient(0deg,rgba(63,95,75,.1) 0 1px,transparent 1px 40px),repeating-linear-gradient(90deg,rgba(63,95,75,.1) 0 1px,transparent 1px 40px)' }} />
      {/* Contour lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 65 Q20 58 35 62 T70 55 T100 58" fill="none" stroke="#a8b8aa" strokeWidth="0.5"/>
        <path d="M0 45 Q25 38 45 44 T80 38 T100 42" fill="none" stroke="#a8b8aa" strokeWidth="0.5"/>
        <path d="M0 78 Q30 72 50 76 T90 70 T100 74" fill="none" stroke="#a8b8aa" strokeWidth="0.5"/>
      </svg>

      {/* Markers */}
      {crags.map((c, i) => {
        const pos = positions[i] || { left: `${25 + i * 8}%`, top: `${35 + i * 7}%` };
        return (
          <button key={c.id} onClick={() => onMarkerClick(c)}
            style={{ position: 'absolute', ...pos, transform: 'translate(-50%,-100%)',
              border: 0, background: 'none', cursor: 'pointer', zIndex: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5,
              background: c.featured ? colors.rust : colors.slate,
              color: '#fff', padding: '5px 10px 5px 7px', borderRadius: 999,
              boxShadow: '0 3px 10px rgba(35,38,36,.3)', fontWeight: 700, fontSize: 11.5,
              whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 9, fontFamily: 'var(--font-mono)' }}>{c.routes}</span>
              {c.name}
              {c.downloaded && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7de8a8', flexShrink: 0 }} />}
            </div>
            <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `7px solid ${c.featured ? colors.rust : colors.slate}`,
              margin: '0 auto' }} />
          </button>
        );
      })}

      <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
        <div style={{ background: 'rgba(255,255,255,.82)', borderRadius: 9, padding: '6px 11px',
          fontSize: 11, color: colors.inkSoft, backdropFilter: 'blur(6px)',
          fontFamily: 'var(--font-ui)' }}>
          Add <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>VITE_MAPBOX_TOKEN</code> to .env for live map
        </div>
      </div>
    </div>
  );
}

interface Props {
  onOpenCrag: (id?: string) => void;
}

export default function MapScreen({ onOpenCrag }: Props) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [popup, setPopup] = useState<CragMarker | null>(null);
  const [viewState, setViewState] = useState({ longitude: -1.65, latitude: 53.28, zoom: 10.5 });

  const filteredCrags = CRAGS.filter(c => {
    if (activeFilter === 'Downloaded') return c.downloaded;
    if (activeFilter === 'Trad' || activeFilter === 'Sport' || activeFilter === 'Boulder') return c.type === activeFilter;
    return true;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Search + filters */}
      <div style={{ padding: '36px 14px 10px', background: 'var(--card)', borderBottom: '1px solid var(--line)', zIndex: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)',
          borderRadius: 'var(--r-lg)', padding: '10px 14px', border: '1px solid var(--line)' }}>
          <Icon.search />
          <span style={{ flex: 1, fontSize: 14, color: 'var(--ink-faint)' }}>Search areas, crags, routes…</span>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 10, overflowX: 'auto' }} className="no-scrollbar">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={'chip' + (activeFilter === f ? ' chip-on' : '')}
              style={{ cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {!MAPBOX_TOKEN ? (
          <FallbackMap crags={filteredCrags} onMarkerClick={setPopup} />
        ) : (
          <Map
            {...viewState}
            onMove={(e: { viewState: typeof viewState }) => setViewState(e.viewState)}
            mapStyle={
              MAPBOX_TOKEN
                ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12?access_token=${MAPBOX_TOKEN}`
                : 'https://demotiles.maplibre.org/style.json'
            }
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="bottom-right" showCompass={false} />

            {filteredCrags.map(crag => (
              <Marker key={crag.id} longitude={crag.lng} latitude={crag.lat} anchor="bottom"
                onClick={(e: { originalEvent: MouseEvent }) => { e.originalEvent.stopPropagation(); setPopup(crag); }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5,
                    background: crag.featured ? colors.rust : colors.slate,
                    color: '#fff', padding: '5px 10px 5px 7px', borderRadius: 999,
                    boxShadow: '0 3px 10px rgba(35,38,36,.3)',
                    fontWeight: 700, fontSize: 11.5, whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-ui)',
                    outline: popup?.id === crag.id ? '2px solid white' : 'none',
                  }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                      {crag.routes}
                    </span>
                    {crag.name}
                    {crag.downloaded && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7de8a8', flexShrink: 0 }} />}
                  </div>
                  <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `7px solid ${crag.featured ? colors.rust : colors.slate}` }} />
                </div>
              </Marker>
            ))}

            {popup && (
              <Popup longitude={popup.lng} latitude={popup.lat} anchor="top"
                onClose={() => setPopup(null)} closeButton={false} offset={12}>
                <div style={{ fontFamily: 'var(--font-ui)', padding: '4px 2px', minWidth: 170 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: colors.ink }}>{popup.name}</div>
                  <div style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>
                    {popup.area} · {popup.type} · {popup.routes} routes
                  </div>
                  {popup.downloaded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5,
                      fontSize: 11.5, fontWeight: 700, color: colors.moss }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%',
                        background: colors.moss, display: 'inline-block' }} />
                      Available offline
                    </div>
                  )}
                  <button onClick={() => { onOpenCrag(popup.id); setPopup(null); }}
                    style={{ marginTop: 10, width: '100%', background: colors.rust, color: '#fff',
                      border: 0, borderRadius: 8, padding: '8px 12px', fontWeight: 700,
                      fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                    Open Crag →
                  </button>
                </div>
              </Popup>
            )}
          </Map>
        )}
      </div>
    </div>
  );
}
