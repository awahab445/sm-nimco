import { fetchApi } from '@/lib/api-client';

export type SiteConfig = {
  id: string;
  logoUrl: string | null;
  logoWidth: number;
  logoHeight: number;
  announcementText: string;
  showAnnouncement: boolean;
  updatedAt: string;
  updatedByAdminUserId: string | null;
};

export type SiteConfigInput = {
  logoWidth?: number;
  logoHeight?: number;
  logoUrl?: string;
  logoFile?: File | null;
  removeLogo?: boolean;
  announcementText?: string;
  showAnnouncement?: boolean;
};

export async function fetchSiteConfig(): Promise<SiteConfig> {
  const res = await fetchApi<{ data: SiteConfig }>('/admin/settings/site-config');
  return res.data;
}

export async function updateSiteConfig(input: SiteConfigInput): Promise<SiteConfig> {
  const body = new FormData();
  if (input.logoWidth !== undefined) body.set('logoWidth', String(input.logoWidth));
  if (input.logoHeight !== undefined) body.set('logoHeight', String(input.logoHeight));
  if (input.logoUrl !== undefined) body.set('logoUrl', input.logoUrl);
  if (input.removeLogo !== undefined) body.set('removeLogo', String(input.removeLogo));
  if (input.announcementText !== undefined) body.set('announcementText', input.announcementText);
  if (input.showAnnouncement !== undefined) body.set('showAnnouncement', String(input.showAnnouncement));
  if (input.logoFile) body.set('logo', input.logoFile);

  const res = await fetchApi<{ data: SiteConfig }>('/admin/settings/site-config', {
    method: 'PATCH',
    body,
  });
  return res.data;
}
