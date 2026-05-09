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

export type CmsSlide = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CmsSlider = {
  id: string;
  name: string;
  identifier: string;
  isActive: boolean;
  autoplayMs?: number | null;
  slides: CmsSlide[];
  createdAt: string;
  updatedAt: string;
};

export type CmsSlideInput = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type CmsSliderInput = {
  name: string;
  identifier: string;
  isActive?: boolean;
  autoplayMs?: number;
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

  /** Upload a banner image; returns absolute `url` suitable for slide `imageUrl`. */
  uploadSliderSlideImage: (file: File) => uploadCmsSlideFile(file),
};

async function uploadCmsSlideFile(file: File): Promise<{ url: string; filename: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const formData = new FormData();
  formData.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${baseUrl}/admin/cms/slides/upload`, {
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
  return response.json() as Promise<{ url: string; filename: string }>;
}
