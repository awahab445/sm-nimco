import { fetchApi } from '../api-client';

export type AppSessionRow = {
  userId: string;
  email: string;
  name: string;
  role: string | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  lastActiveAt: string;
  isBlocked: boolean;
  status: 'active' | 'blocked';
};

export async function fetchAppSessions(): Promise<AppSessionRow[]> {
  return fetchApi<AppSessionRow[]>('/admin/sessions');
}

export async function setAppSessionBlocked(
  userId: string,
  isBlocked: boolean,
): Promise<AppSessionRow> {
  return fetchApi<AppSessionRow>(`/admin/sessions/${userId}/block`, {
    method: 'PATCH',
    body: JSON.stringify({ isBlocked }),
  });
}
