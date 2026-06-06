export interface Stance {
  p: number;
  x: number;
  y: number;
  note: string;
}

export interface Route {
  n: number;
  name: string;
  grade: string;
  fr?: string;
  stars: 0 | 1 | 2 | 3;
  style: 'Trad' | 'Sport' | 'Boulder' | 'Top-rope';
  type?: string;
  len: number;
  bolts?: number;
  desc: string;
  warn?: string;
  src?: string;
  color: string;
  line: [number, number][];
  stances?: Stance[];
  sector?: string;
  status?: RouteStatus;
}

export type RouteStatus = 'none' | 'project' | 'flash' | 'sent';

export interface Crag {
  name: string;
  area: string;
  type: string;
  routeCount: number;
  gradeRange: string;
  walkin: string;
  aspect: string;
  sectors: string[];
}

export type GradeSystem = 'fr' | 'uk' | 'yds';
