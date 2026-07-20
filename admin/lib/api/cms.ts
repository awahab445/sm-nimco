import { fetchApi } from '../api-client';
import { getToken } from '../auth-token';

export type CmsPageStatus = 'draft' | 'published';

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  status: CmsPageStatus;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentHtml?: string | null;
  contentJson?: Record<string, unknown> | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CmsBlock = {
  id: string;
  name: string;
  identifier: string;
  description?: string | null;
  contentHtml?: string | null;
  contentJson?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CmsSlideTextAlign = 'left' | 'center' | 'right';
export type CmsSlideTextPosition = 'top' | 'middle' | 'bottom';
export type CmsSlideTextColor = 'light' | 'dark';

export type CmsSlide = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  /** Optional mobile art-direction / auto mobile WebP. */
  mobileImageUrl?: string | null;
  /** Auto tablet WebP variant. */
  imageUrlTablet?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  textAlign?: CmsSlideTextAlign | null;
  textPosition?: CmsSlideTextPosition | null;
  textColor?: CmsSlideTextColor | null;
  sortOrder: number;
  isActive: boolean;
};

export type CmsSlider = {
  id: string;
  name: string;
  identifier: string;
  isActive: boolean;
  autoplayMs?: number | null;
  /** Same width (px) for every slide in this slider; optional. */
  slideWidthPx?: number | null;
  /** Same height (px) for every slide; optional (with width sets banner aspect). */
  slideHeightPx?: number | null;
  slides: CmsSlide[];
  createdAt: string;
  updatedAt: string;
};

export type CmsSlideInput = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  imageUrlTablet?: string | null;
  ctaLabel?: string;
  ctaHref?: string;
  textAlign?: CmsSlideTextAlign;
  textPosition?: CmsSlideTextPosition;
  textColor?: CmsSlideTextColor;
  sortOrder?: number;
  isActive?: boolean;
};

export type CmsSliderInput = {
  name: string;
  identifier: string;
  isActive?: boolean;
  autoplayMs?: number;
  slideWidthPx?: number | null;
  slideHeightPx?: number | null;
  slides: CmsSlideInput[];
};

export const cmsApi = {
  listPages: () => fetchApi<CmsPage[]>('/admin/cms/pages'),
  getPage: (id: string) => fetchApi<CmsPage>(`/admin/cms/pages/${id}`),
  createPage: (body: Partial<CmsPage>) =>
    fetchApi<CmsPage>('/admin/cms/pages', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updatePage: (id: string, body: Partial<CmsPage>) =>
    fetchApi<CmsPage>(`/admin/cms/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deletePage: (id: string) =>
    fetchApi<void>(`/admin/cms/pages/${id}`, { method: 'DELETE' }),

  listBlocks: () => fetchApi<CmsBlock[]>('/admin/cms/blocks'),
  getBlock: (id: string) => fetchApi<CmsBlock>(`/admin/cms/blocks/${id}`),
  createBlock: (body: Partial<CmsBlock>) =>
    fetchApi<CmsBlock>('/admin/cms/blocks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateBlock: (id: string, body: Partial<CmsBlock>) =>
    fetchApi<CmsBlock>(`/admin/cms/blocks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteBlock: (id: string) =>
    fetchApi<void>(`/admin/cms/blocks/${id}`, { method: 'DELETE' }),

  listSliders: () => fetchApi<CmsSlider[]>('/admin/cms/sliders'),
  getSlider: (id: string) => fetchApi<CmsSlider>(`/admin/cms/sliders/${id}`),
  createSlider: (body: CmsSliderInput) =>
    fetchApi<CmsSlider>('/admin/cms/sliders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateSlider: (id: string, body: Partial<CmsSliderInput>) =>
    fetchApi<CmsSlider>(`/admin/cms/sliders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteSlider: (id: string) =>
    fetchApi<void>(`/admin/cms/sliders/${id}`, { method: 'DELETE' }),

  /** Upload a banner image; returns `url` + optional `variants` (mobile/tablet/desktop). */
  uploadSliderSlideImage: (file: File, purpose?: 'desktop' | 'mobile') =>
    uploadCmsSlideFile(file, purpose),
};

async function uploadCmsSlideFile(
  file: File,
  purpose: 'desktop' | 'mobile' = 'desktop',
): Promise<{
  url: string;
  filename: string;
  variants?: { mobile: string; tablet: string; desktop: string };
}> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const formData = new FormData();
  formData.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const query = purpose === 'mobile' ? '?purpose=mobile' : '';
  const response = await fetch(`${baseUrl}/admin/cms/slides/upload${query}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData?.message) message = errorData.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return response.json() as Promise<{
    url: string;
    filename: string;
    variants?: { mobile: string; tablet: string; desktop: string };
  }>;
}
