import type { Route, Crag, Stance } from '../types';
import brackenPng from '../assets/bracken-edge.png';

export const BRACKEN_PHOTO = brackenPng;
export const BRACKEN_ASPECT = 2388 / 1170;

const RL_PALETTE = [
  'var(--rl-red)', 'var(--rl-amber)', 'var(--rl-blue)', 'var(--rl-green)',
  'var(--rl-violet)', 'var(--rl-teal)', 'var(--rl-pink)', 'var(--rl-yellow)',
];

function buildLine(x: number, b: number, t: number, w: [number,number,number,number]): [number,number][] {
  const lerp = (a: number, bb: number, tt: number) => a + (bb - a) * tt;
  const ys = [0, 0.36, 0.68, 1] as const;
  return ys.map((f, i) => [+(x + w[i]).toFixed(4), +lerp(b, t, f).toFixed(4)]) as [number,number][];
}

const _BR = [
  { name:'The Nose',         grade:'VDiff',     stars:1 as const, len:12, x:0.052, b:0.95, t:0.66, w:[ .000, .012,-.006, .004] as [number,number,number,number], status:'sent'    as const },
  { name:'Bracken Crack',    grade:'Severe 4a', stars:2 as const, len:14, x:0.084, b:0.91, t:0.57, w:[ .004,-.008, .010,-.002] as [number,number,number,number], status:'none'    as const },
  { name:'Heather Groove',   grade:'HS 4b',     stars:1 as const, len:13, x:0.116, b:0.88, t:0.49, w:[-.004, .010,-.008, .002] as [number,number,number,number], status:'flash'   as const },
  { name:"Tinker's Chimney", grade:'VDiff',     stars:0 as const, len:11, x:0.150, b:0.87, t:0.44, w:[ .002,-.006, .008,-.004] as [number,number,number,number], status:'none'    as const },
  { name:'Curving Crack',    grade:'VS 4c',     stars:2 as const, len:16, x:0.186, b:0.86, t:0.42, w:[ .006, .016,-.004, .000] as [number,number,number,number], status:'project' as const },
  { name:'Gritstone Arête',  grade:'HVS 5a',   stars:3 as const, len:15, x:0.216, b:0.85, t:0.41, w:[-.002, .008,-.010, .003] as [number,number,number,number], status:'sent'    as const },
  { name:'Peat Hag Slab',    grade:'Severe 4a', stars:1 as const, len:14, x:0.252, b:0.84, t:0.40, w:[ .004,-.010, .006,-.002] as [number,number,number,number], status:'none'    as const },
  { name:'Millstone Wall',   grade:'VS 4c',     stars:2 as const, len:17, x:0.286, b:0.83, t:0.39, w:[-.004, .010,-.006, .002] as [number,number,number,number], status:'project' as const },
  { name:'The Sentinel',     grade:'E1 5b',     stars:3 as const, len:18, x:0.320, b:0.82, t:0.35, w:[ .003,-.008, .010,-.003] as [number,number,number,number], status:'project' as const },
  { name:'Fern Layback',     grade:'HVS 5a',   stars:2 as const, len:16, x:0.356, b:0.815,t:0.32, w:[ .005, .013,-.005, .001] as [number,number,number,number], status:'none'    as const },
  { name:'Quiet Storm',      grade:'E2 5c',     stars:3 as const, len:19, x:0.392, b:0.805,t:0.30, w:[-.003, .009,-.009, .002] as [number,number,number,number], status:'project' as const },
  { name:'Whetstone Crack',  grade:'VS 5a',     stars:1 as const, len:15, x:0.422, b:0.80, t:0.28, w:[ .004,-.007, .008,-.003] as [number,number,number,number], status:'none'    as const },
  { name:'Red Jacket',       grade:'E1 5b',     stars:3 as const, len:20, x:0.452, b:0.79, t:0.24, w:[ .006, .000,-.008, .004] as [number,number,number,number], status:'sent'    as const },
  { name:'Crowfoot Direct',  grade:'HVS 5b',   stars:2 as const, len:18, x:0.482, b:0.77, t:0.235,w:[-.004, .008,-.006, .002] as [number,number,number,number], status:'none'    as const },
  { name:'The Long Layback', grade:'E1 5b',     stars:2 as const, len:19, x:0.520, b:0.73, t:0.225,w:[ .004,-.009, .007,-.002] as [number,number,number,number], status:'project' as const },
  { name:'Skyline Arête',    grade:'E3 5c',     stars:3 as const, len:22, x:0.560, b:0.69, t:0.21, w:[ .005, .012,-.004, .001] as [number,number,number,number], status:'none'    as const },
  { name:'Dark Sky',         grade:'E2 5b',     stars:2 as const, len:21, x:0.602, b:0.65, t:0.20, w:[-.003, .009,-.008, .002] as [number,number,number,number], status:'project' as const },
  { name:'Buttress Edge',    grade:'HS 4b',     stars:1 as const, len:16, x:0.646, b:0.61, t:0.175,w:[ .004,-.006, .008,-.003] as [number,number,number,number], status:'none'    as const },
  { name:'Last Light',       grade:'E4 6a',     stars:2 as const, len:23, x:0.696, b:0.56, t:0.135,w:[ .003, .010,-.005, .001] as [number,number,number,number], status:'none'    as const },
  { name:'Gathering Clouds', grade:'E1 5a',     stars:1 as const, len:20, x:0.750, b:0.52, t:0.125,w:[-.003, .008,-.007, .002] as [number,number,number,number], status:'none'    as const },
];

const _BR_DESC = [
  'A classic nine-pitch expedition up the full height of the edge — the route of the crag. Take a full rack, allow a full day, and be prepared for serious exposure on the upper pitches.\n\nPitch 1 (15m, VDiff): Start at the base of the obvious crack-and-slab to the left of the lowest buttress. Climb the slab on generous holds to a comfortable ledge.\n\nPitch 2 (18m, Severe 4a): Move left onto the rib and climb the juggy edge, trending right to a wide crack.\n\nPitch 3 (20m, HS 4b): The best pitch on the lower half. Layback the flake until it closes, bridge into the corner above.',
  'Follow the obvious crack with bridging and the odd jam. Well protected; a classic of the grade.',
  'Bridge the groove past a perched block, then pull onto the slab above. A little vegetated in the back.',
  'Awkward and atmospheric. Chimney past the chockstone — more of an experience than a climb.',
  'The line of the wall. Layback the curving crack on superb gritstone, fingers crossed for the rest.',
  'Stunning. Climb the clean arête on its right side, balancing up to a committing rock-over at the top.',
  'Pad up the open slab on small edges and faith. Spaced gear rewards a cool head.',
  'Sustained wall climbing on positive breaks. The crux comes at the final reach to the top.',
  'Bold and beautiful. Hand-traverse the break before launching up the headwall on hidden holds.',
  'Powerful laybacking up the flake, then a delicate exit. Strenuous to protect.',
  'A masterpiece. Crimp through the steep grey wall where the rock turns bullet-hard.',
  'Thin moves off the ground gain the crack. Easier once established, but a tricky start.',
  'Where you saw the climber in red. Steep, juggy and exposed — pure gritstone joy to the chains.',
  'Direct line up the nose of the buttress on improving holds. The finish is the crux.',
  'Long laybacking demands stamina. Keep moving and trust the feet.',
  'The edge of the edge. A magnificent arête, exposed and serious, with the whole moor below.',
  'Climb into the shadowed corner as the light fades. Reachy and committing near the top.',
  'Short but sweet edge work to gain the upper terrace. A good first lead at the grade.',
  'The hardest line here. A blank-looking headwall guards the final moves — for the bold.',
  'Trend up and right beneath the summit blocks on perfect rock. A fine way to finish the day.',
];

const NOSE_STANCES: Stance[] = [
  { p:1, x:0.053, y:0.918, note:'Comfortable ledge with thread and cam' },
  { p:2, x:0.058, y:0.886, note:'Ledge at large flake — good rock' },
  { p:3, x:0.060, y:0.854, note:'Good ledge, fine view down the moor' },
  { p:4, x:0.055, y:0.822, note:'Broad terrace — scramble pitch' },
  { p:5, x:0.049, y:0.790, note:'Niche belay in situ' },
  { p:6, x:0.051, y:0.758, note:'Terrace above the arête' },
  { p:7, x:0.049, y:0.726, note:'Good stance in gully' },
  { p:8, x:0.053, y:0.694, note:'Small ledge below the thin crack' },
  { p:9, x:0.056, y:0.660, note:'Summit cairn — descent via north ridge' },
];

export const BRACKEN_ROUTES: Route[] = _BR.map((r, i) => ({
  n: i + 1,
  name: r.name,
  grade: r.grade,
  stars: r.stars,
  style: 'Trad' as const,
  type: 'Trad',
  len: r.len,
  desc: _BR_DESC[i],
  color: RL_PALETTE[i % RL_PALETTE.length],
  line: buildLine(r.x, r.b, r.t, r.w),
  status: r.status,
  stances: i === 0 ? NOSE_STANCES : undefined,
}));

export const BRACKEN_CRAG: Crag = {
  name: 'Bracken Edge',
  area: 'Dark Peak',
  type: 'Trad',
  routeCount: BRACKEN_ROUTES.length,
  gradeRange: 'VDiff to E4',
  walkin: '15 min',
  aspect: 'West-facing · afternoon sun',
  sectors: ['The Nose Buttress', 'Central Walls', 'Skyline Buttress'],
};

export const TOPO_PHOTO = 'https://images.unsplash.com/photo-1758172797466-7fe6fef9aa51?q=70&w=1500&auto=format&fit=crop';
