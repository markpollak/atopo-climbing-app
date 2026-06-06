import { useState, useEffect } from 'react';
import { Icon } from '../../components/Icons';
import { useDownloads } from '../../storage/downloads';
import HomeScreen from './HomeScreen';
import CragScreen from './CragScreen';
import TopoScreen from './TopoScreen';
import LogbookScreen from './LogbookScreen';
import MapScreen from './MapScreen';
import SearchScreen from './SearchScreen';
import ProfileScreen from './ProfileScreen';
import { STANAGE_PHOTO, STANAGE_ASPECT, STANAGE_ROUTES, STANAGE_CRAG } from '../../data/stanage';
import { api, type ApiRoute, type ApiCrag } from '../../api/client';
import type { Route, Crag, GradeSystem } from '../../types';

type MobileTab = 'home' | 'map' | 'search' | 'logbook' | 'profile';
type MobileView = 'home' | 'crag' | 'topo';

function toRoute(r: ApiRoute): Route {
  return {
    n: r.n, name: r.name, grade: r.grade,
    stars: r.stars as 0 | 1 | 2 | 3,
    style: r.style as Route['style'],
    len: r.len, desc: r.desc,
    warn: r.warn ?? undefined,
    color: r.color, line: r.line, stances: r.stances,
    status: r.status as Route['status'],
  };
}

function toCrag(c: ApiCrag): Crag {
  return {
    name: c.name, area: c.area, type: c.type,
    routeCount: 0,
    gradeRange: '',
    walkin: c.walkin, aspect: c.aspect, sectors: [],
  };
}

export default function MobileApp() {
  const [tab, setTab] = useState<MobileTab>('home');
  const [view, setView] = useState<MobileView>('home');
  const [gradeSystem, setGradeSystem] = useState<GradeSystem>('uk');
  const downloads = useDownloads();

  const [crag, setCrag] = useState<Crag>(STANAGE_CRAG);
  const [routes, setRoutes] = useState<Route[]>(STANAGE_ROUTES);
  const [photo, setPhoto] = useState<string>(STANAGE_PHOTO);
  const [aspect, setAspect] = useState<number>(STANAGE_ASPECT);

  useEffect(() => {
    Promise.all([api.crags.get(1), api.routes.list(1)])
      .then(([apiCrag, apiRoutes]) => {
        setCrag({ ...toCrag(apiCrag), routeCount: apiRoutes.length });
        setRoutes(apiRoutes.map(toRoute));
        if (apiCrag.photo_url) setPhoto(apiCrag.photo_url);
        if (apiCrag.photo_aspect) setAspect(apiCrag.photo_aspect);
      })
      .catch(() => { /* stay on hardcoded fallback */ });
  }, []);

  const tabs: { id: MobileTab; label: string; Icon: () => JSX.Element }[] = [
    { id: 'home',    label: 'Home',    Icon: Icon.home },
    { id: 'map',     label: 'Map',     Icon: Icon.map },
    { id: 'search',  label: 'Search',  Icon: Icon.search },
    { id: 'logbook', label: 'Logbook', Icon: Icon.book },
    { id: 'profile', label: 'Profile', Icon: Icon.user },
  ];

  function renderMain() {
    if (tab === 'home') {
      if (view === 'topo') return (
        <TopoScreen crag={crag} routes={routes} photo={photo} aspect={aspect}
          onBack={() => setView('crag')} gradeSystem={gradeSystem} />
      );
      if (view === 'crag') return <CragScreen onBack={() => setView('home')} onOpenTopo={() => setView('topo')} downloads={downloads} />;
      return <HomeScreen onOpenCrag={() => setView('crag')} onOpenTopo={() => setView('topo')} downloads={downloads} />;
    }
    if (tab === 'map')     return <MapScreen onOpenCrag={() => { setTab('home'); setView('crag'); }} />;
    if (tab === 'search')  return <SearchScreen gradeSystem={gradeSystem} onOpenTopo={() => { setTab('home'); setView('topo'); }} />;
    if (tab === 'logbook') return <LogbookScreen />;
    return <ProfileScreen gradeSystem={gradeSystem} onSetGradeSystem={setGradeSystem} downloads={downloads} />;
  }

  return (
    <div className="phone" style={{ margin: 'auto' }}>
      <div className="screen">
        <div className="notch" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {renderMain()}
        </div>
        <nav className="tabbar">
          {tabs.map(t => (
            <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')}
              onClick={() => { setTab(t.id); if (t.id === 'home') setView('home'); }}>
              <t.Icon />
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
