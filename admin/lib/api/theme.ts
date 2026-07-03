import { fetchApi } from '@/lib/api-client';

export type ThemeSettings = {
  theme: string;
};

export async function fetchThemeSettings(): Promise<ThemeSettings> {
  const res = await fetchApi<{ data: ThemeSettings }>('/settings/theme', {}, false);
  return res.data;
}

export async function updateThemeSettings(theme: string): Promise<ThemeSettings> {
  const res = await fetchApi<{ data: ThemeSettings }>('/settings/theme', {
    method: 'PATCH',
    body: JSON.stringify({ theme }),
  });
  return res.data;
}
