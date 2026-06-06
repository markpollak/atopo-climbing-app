import { useState, useMemo } from 'react';
import { Icon, AtopoMark } from '../../components/Icons';
import { BRACKEN_ROUTES, BRACKEN_CRAG } from '../../data/bracken';
import { convertGrade, STATUS_META } from '../../data/grades';
import type { GradeSystem } from '../../types';

const STYLES = ['Sport', 'Trad', 'Boulder', 'Top-rope'] as const;
const STARS_FILTER = [1, 2, 3] as const;

interface Props {
  gradeSystem: GradeSystem;
  onOpenTopo: () => void;
}

export default function SearchScreen({ gradeSystem, onOpenTopo }: Props) {
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [starsFilter, setStarsFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    return BRACKEN_ROUTES.filter(r => {
      if (query && !r.name.toLowerCase().includes(query.toLowerCase()) && !r.grade.toLowerCase().includes(query.toLowerCase())) return false;
      if (styleFilter && r.style !== styleFilter) return false;
      if (starsFilter && r.stars < starsFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [query, styleFilter, starsFilter, statusFilter]);

  const hasFilters = styleFilter || starsFilter || statusFilter;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflow: 'hidden' }}>
      {/* Search bar */}
      <div style={{ padding: '36px 14px 10px', background: 'var(--card)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', padding: '10px 14px', border: '1px solid var(--line)' }}>
          <Icon.search />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search routes, crags, areas…"
            style={{ flex: 1, border: 0, background: 'transparent', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-ui)' }}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', padding: 0 }}>
              <Icon.close />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 7, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
          {STYLES.map(s => (
            <button key={s} onClick={() => setStyleFilter(styleFilter === s ? null : s)}
              className={'chip' + (styleFilter === s ? ' chip-on' : '')} style={{ cursor: 'pointer' }}>{s}</button>
          ))}
          <div style={{ width: 1, height: 22, background: 'var(--line)', margin: '4px 2px', flexShrink: 0 }} />
          {STARS_FILTER.map(n => (
            <button key={n} onClick={() => setStarsFilter(starsFilter === n ? null : n)}
              className={'chip' + (starsFilter === n ? ' chip-on' : '')} style={{ cursor: 'pointer' }}>
              {'★'.repeat(n)}
            </button>
          ))}
          <div style={{ width: 1, height: 22, background: 'var(--line)', margin: '4px 2px', flexShrink: 0 }} />
          {['project','sent','flash'].map(st => (
            <button key={st} onClick={() => setStatusFilter(statusFilter === st ? null : st)}
              className={'chip' + (statusFilter === st ? ' chip-rust' : '')} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>{st}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="thin-scroll">
        {!query && !hasFilters ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-faint)' }}>
            <div style={{ marginBottom: 12 }}><AtopoMark size={40} stone="var(--warm-stone)" route="var(--rust)" /></div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>Search Bracken Edge</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>Search by route name, grade, or use the filters above</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-faint)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>No routes found</div>
            <div style={{ fontSize: 13 }}>Try a different search or clear the filters</div>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                {results.length} route{results.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{BRACKEN_CRAG.name}</span>
            </div>
            {results.map(r => {
              const sm = STATUS_META[r.status || 'none'];
              return (
                <button key={r.n} className="rrow" onClick={onOpenTopo}
                  style={{ ['--rl-color' as string]: r.color }}>
                  <span className="rnum" style={{ background: r.color, width: 22, height: 22, fontSize: 11 }}>{r.n}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="rname">{r.name}</span>
                    <span className="rmeta">
                      <span className="stars" style={{ fontSize: 10 }}>{'★'.repeat(r.stars)}</span>
                      {' '}{r.style} · {r.len}m · {BRACKEN_CRAG.name}
                    </span>
                  </span>
                  {sm.label !== 'Not tried' && (
                    <span className={'chip ' + sm.cls} style={{ padding: '2px 7px', fontSize: 10 }}>{sm.label}</span>
                  )}
                  <span className="grade" style={{ fontSize: 12, padding: '2px 7px' }}>{convertGrade(r.grade, gradeSystem)}</span>
                </button>
              );
            })}
            <div style={{ height: 20 }} />
          </>
        )}
      </div>
    </div>
  );
}
