export interface ApiRoute {
  id: number;
  crag_id: number;
  sector_id: number | null;
  n: number;
  name: string;
  grade: string;
  stars: 0 | 1 | 2 | 3;
  style: string;
  len: number;
  desc: string;
  warn: string | null;
  color: string;
  line: [number, number][];
  stances: { p: number; x: number; y: number; note: string }[];
  status: string;
  updated_at: string;
}

export interface ApiCrag {
  id: number;
  guide_id: number | null;
  name: string;
  area: string;
  type: string;
  walkin: string;
  aspect: string;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  photo_aspect: number | null;
  access_notes: string;
  approach: string;
  updated_at: string;
}

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${init?.method ?? 'GET'} ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  crags: {
    list: () => request<ApiCrag[]>('/crags'),
    get: (id: number) => request<ApiCrag>(`/crags/${id}`),
    update: (id: number, body: Partial<ApiCrag>) =>
      request<ApiCrag>(`/crags/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    uploadPhoto: async (id: number, file: File): Promise<ApiCrag> => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${BASE}/crags/${id}/photo`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Photo upload failed: ${res.status}`);
      return res.json();
    },
  },
  routes: {
    list: (cragId: number) => request<ApiRoute[]>(`/crags/${cragId}/routes`),
    create: (cragId: number, body: { name?: string; line: [number, number][] }) =>
      request<ApiRoute>(`/crags/${cragId}/routes`, { method: 'POST', body: JSON.stringify(body) }),
    update: (cragId: number, routeId: number, body: Partial<ApiRoute>) =>
      request<ApiRoute>(`/crags/${cragId}/routes/${routeId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },
};
