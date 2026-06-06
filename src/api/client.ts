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

export interface ApiUser {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: number;
  subscription_tier: string;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  new_this_week: number;
  new_this_month: number;
  total_crags: number;
  total_routes: number;
  tier_counts: Record<string, number>;
}

const BASE = '/api';

let _token: string | null = localStorage.getItem('atopo_admin_token');

export function getToken() { return _token; }
export function setAdminToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem('atopo_admin_token', t);
  else localStorage.removeItem('atopo_admin_token');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...init?.headers as Record<string, string> };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  const res = await fetch(BASE + path, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail ?? `API ${init?.method ?? 'GET'} ${path} → ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request<ApiUser>('/auth/me'),
    adminUsers: () => request<ApiUser[]>('/auth/admin/users'),
    adminStats: () => request<AdminStats>('/auth/admin/stats'),
    setRole: (id: number, role: string) =>
      request<ApiUser>(`/auth/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    setStatus: (id: number, is_active: boolean) =>
      request<ApiUser>(`/auth/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    setTier: (id: number, subscription_tier: string) =>
      request<ApiUser>(`/auth/admin/users/${id}/tier`, { method: 'PATCH', body: JSON.stringify({ subscription_tier }) }),
    resetPassword: (id: number, new_password: string) =>
      request<void>(`/auth/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ new_password }) }),
    deleteUser: (id: number) =>
      request<void>(`/auth/admin/users/${id}`, { method: 'DELETE' }),
    changePassword: (current_password: string, new_password: string) =>
      request<void>('/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password, new_password }) }),
  },
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
