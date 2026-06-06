import { useState } from 'react';
import { Icon } from '../../components/Icons';
import HomeScreen from './HomeScreen';
import CragScreen from './CragScreen';
import TopoScreen from './TopoScreen';
import LogbookScreen, { MapScreen } from './LogbookScreen';
import SearchScreen from './SearchScreen';
import ProfileScreen from './ProfileScreen';
import { BRACKEN_PHOTO, BRACKEN_ASPECT, BRACKEN_ROUTES, BRACKEN_CRAG } from '../../data/bracken';
import type { GradeSystem } from '../../types';

type MobileTab = 'home' | 'map' | 'search' | 'logbook' | 'profile';
type MobileView = 'home' | 'crag' | 'topo';

export default function MobileApp() {
  const [tab, setTab] = useState<MobileTab>('home');
  const [view, setView] = useState<MobileView>('home');
  const [gradeSystem, setGradeSystem] = useState<GradeSystem>('uk');

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
        <TopoScreen
          crag={BRACKEN_CRAG}
          routes={BRACKEN_ROUTES}
          photo={BRACKEN_PHOTO}
          aspect={BRACKEN_ASPECT}
          onBack={() => setView('crag')}
          gradeSystem={gradeSystem}
        />
      );
      if (view === 'crag') return <CragScreen onBack={() => setView('home')} onOpenTopo={() => setView('topo')} />;
      return <HomeScreen onOpenCrag={() => setView('crag')} onOpenTopo={() => setView('topo')} />;
    }
    if (tab === 'map')     return <MapScreen onOpenCrag={() => { setTab('home'); setView('crag'); }} />;
    if (tab === 'search')  return <SearchScreen gradeSystem={gradeSystem} onOpenTopo={() => { setTab('home'); setView('topo'); }} />;
    if (tab === 'logbook') return <LogbookScreen />;
    return <ProfileScreen gradeSystem={gradeSystem} onSetGradeSystem={setGradeSystem} />;
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
