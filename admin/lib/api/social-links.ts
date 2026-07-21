import { fetchApi } from '@/lib/api-client';

export const SOCIAL_PLATFORMS = [
  'facebook',
  'x',
  'instagram',
  'youtube',
  'pinterest',
  'tiktok',
  'whatsapp',
  'linkedin',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  x: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
};

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SocialLinkInput = {
  platform: SocialPlatform;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const res = await fetchApi<{ data: SocialLink[] }>('/admin/settings/social-links');
  return res.data ?? [];
}

export async function saveSocialLinks(links: SocialLinkInput[]): Promise<SocialLink[]> {
  const res = await fetchApi<{ data: SocialLink[] }>('/admin/settings/social-links', {
    method: 'PUT',
    body: JSON.stringify({ links }),
  });
  return res.data ?? [];
}
