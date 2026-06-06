import type { GradeSystem } from '../types';

export const GRADE_ORDER = ['3','4','4+','5','5+','6a','6a+','6b','6b+','6c','6c+','7a','7a+','7b','7b+','7c','7c+','8a','8b'];

export const GRADE_TABLE: Record<string, { uk: string; yds: string }> = {
  '3':   { uk: '3c',  yds: '5.5'   },
  '4':   { uk: '4a',  yds: '5.6'   },
  '4+':  { uk: '4b',  yds: '5.7'   },
  '5':   { uk: '4c',  yds: '5.8'   },
  '5+':  { uk: '5a',  yds: '5.9'   },
  '6a':  { uk: '5b',  yds: '5.10a' },
  '6a+': { uk: '5c',  yds: '5.10b' },
  '6b':  { uk: '5c',  yds: '5.10c' },
  '6b+': { uk: '6a',  yds: '5.10d' },
  '6c':  { uk: '6a',  yds: '5.11b' },
  '6c+': { uk: '6a',  yds: '5.11c' },
  '7a':  { uk: '6b',  yds: '5.11d' },
  '7a+': { uk: '6b',  yds: '5.12a' },
  '7b':  { uk: '6b',  yds: '5.12b' },
  '8b':  { uk: '7a',  yds: '5.13d' },
};

export const TRAD_TO: Record<string, { fr: string; yds: string }> = {
  'VDiff':     { fr:'3',   yds:'5.4'   },
  'Severe 4a': { fr:'4a',  yds:'5.5'   },
  'HS 4b':     { fr:'4b',  yds:'5.6'   },
  'VS 4c':     { fr:'4c',  yds:'5.7'   },
  'VS 5a':     { fr:'5a',  yds:'5.8'   },
  'HVS 5a':    { fr:'5a',  yds:'5.9'   },
  'HVS 5b':    { fr:'5b',  yds:'5.9'   },
  'E1 5a':     { fr:'6a',  yds:'5.10a' },
  'E1 5b':     { fr:'6a+', yds:'5.10b' },
  'E2 5b':     { fr:'6b',  yds:'5.10d' },
  'E2 5c':     { fr:'6b+', yds:'5.11a' },
  'E3 5c':     { fr:'6c',  yds:'5.11b' },
  'E4 6a':     { fr:'7a',  yds:'5.11d' },
};

export function convertGrade(grade: string, system: GradeSystem): string {
  if (!system || system === 'uk') return grade;
  const m = TRAD_TO[grade];
  if (m) return m[system] || grade;
  const f = GRADE_TABLE[grade];
  if (f) return f[system === 'yds' ? 'yds' : 'uk'] || grade;
  return grade;
}

export const GRADE_SYSTEMS = [
  { id: 'fr'  as GradeSystem, label: 'French',  short: 'FR'  },
  { id: 'uk'  as GradeSystem, label: 'British', short: 'UK'  },
  { id: 'yds' as GradeSystem, label: 'YDS',     short: 'YDS' },
];

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  none:    { label: 'Not tried', cls: '' },
  project: { label: 'Project',   cls: 'chip-rust' },
  flash:   { label: 'Flashed',   cls: 'chip-moss' },
  sent:    { label: 'Sent',      cls: 'chip-moss' },
};
