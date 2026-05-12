import { useAppStore } from './store';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = useAppStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>('/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: Record<string, string>) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  stats: () => request<any>('/stats'),
  centers: {
    list: () => request<any[]>('/centers'),
    get: (id: string) => request<any>(`/centers/${id}`),
  },
  appointments: {
    list: (donorId: string) => request<any[]>(`/appointments?donorId=${donorId}`),
    create: (data: Record<string, string>) =>
      request<any>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
        update: (data: { id: string; status: string }) =>
      request<any>('/appointments', { method: 'PUT', body: JSON.stringify(data) }),
  },
  donations: {
    list: (donorId?: string) =>
      request<any[]>(`/donations${donorId ? `?donorId=${donorId}` : ''}`),
    create: (data: Record<string, any>) =>
      request<any>('/donations', { method: 'POST', body: JSON.stringify(data) }),
  },
  donors: {
    list: () => request<any[]>('/donors'),
    get: (id: string) => request<any>(`/donors/${id}`),
    update: (id: string, data: Record<string, any>) =>
      request<any>(`/donors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  notifications: {
    list: (userId: string) => request<any[]>(`/notifications?userId=${userId}`),
    markRead: (id: string) =>
      request<any>(`/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead: true }) }),
  },
  rewards: {
    list: () => request<any[]>('/rewards'),
    leaderboard: () => request<any[]>('/rewards/leaderboard'),
  },
  inventory: {
    list: (centerId?: string) =>
      request<any[]>(`/inventory${centerId ? `?centerId=${centerId}` : ''}`),
    update: (data: { centerId: string; bloodType: string; units: number }) =>
      request<any>('/inventory', { method: 'PUT', body: JSON.stringify(data) }),
  },
  bloodDrives: {
    list: (params?: { district?: string; city?: string; upcoming?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.district) searchParams.set('district', params.district);
      if (params?.city) searchParams.set('city', params.city);
      if (params?.upcoming) searchParams.set('upcoming', 'true');
      const qs = searchParams.toString();
      return request<any[]>(`/blood-drives${qs ? `?${qs}` : ''}`);
    },
    create: (data: Record<string, any>) =>
      request<any>('/blood-drives', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, any>) =>
      request<any>(`/blood-drives/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/blood-drives/${id}`, { method: 'DELETE' }),
  },
};