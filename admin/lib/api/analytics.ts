import { fetchApi } from '@/lib/api-client';

export type Ga4Settings = {
  id: string;
  measurementId: string | null;
  gtmId: string | null;
  isEnabled: boolean;
  debugMode: boolean;
  trackPageViews: boolean;
  trackCartEvents: boolean;
  trackCheckoutSteps: boolean;
  trackPurchases: boolean;
  trackRefunds: boolean;
  trackCustomEvents: boolean;
  anonymizeIp: boolean;
  currency: string;
  updatedAt: string;
  updatedByAdminUserId: string | null;
};

export type Ga4SettingsInput = Partial<
  Pick<
    Ga4Settings,
    | 'measurementId'
    | 'gtmId'
    | 'isEnabled'
    | 'debugMode'
    | 'trackPageViews'
    | 'trackCartEvents'
    | 'trackCheckoutSteps'
    | 'trackPurchases'
    | 'trackRefunds'
    | 'trackCustomEvents'
    | 'anonymizeIp'
    | 'currency'
  >
>;

export async function fetchGa4Settings(): Promise<Ga4Settings> {
  const res = await fetchApi<{ data: Ga4Settings }>('/admin/analytics/ga4');
  return res.data;
}

export async function updateGa4Settings(body: Ga4SettingsInput): Promise<Ga4Settings> {
  const res = await fetchApi<{ data: Ga4Settings }>('/admin/analytics/ga4', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function toggleGa4Enabled(isEnabled: boolean): Promise<Ga4Settings> {
  const res = await fetchApi<{ data: Ga4Settings }>('/admin/analytics/ga4/toggle', {
    method: 'POST',
    body: JSON.stringify({ isEnabled }),
  });
  return res.data;
}
