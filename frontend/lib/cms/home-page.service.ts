import { fetchApi } from '@/lib/api-client';
import type { HomePageLayoutResponse, HomeSection } from './home-page-types';
import { HOME_PAGE_DEFAULT_SECTIONS } from './home-page-defaults';

function normalizeSections(raw: unknown): HomeSection[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const sections = (raw as HomePageLayoutResponse).sections;
  if (!Array.isArray(sections) || sections.length === 0) return null;
  return sections as HomeSection[];
}

/**
 * Load homepage block layout.
 *
 * Priority:
 * 1. `NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH` — relative to `NEXT_PUBLIC_API_URL`, e.g. `/storefront/home-layout`
 * 2. Fallback: static defaults (editable in `home-page-defaults.ts`)
 *
 * When the backend exposes a real endpoint, return JSON: `{ "sections": [ ... ] }` using the types in `home-page-types.ts`.
 */
export async function getHomePageSections(): Promise<HomeSection[]> {
  const path = process.env.NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_PATH?.trim();
  if (!path) {
    return HOME_PAGE_DEFAULT_SECTIONS;
  }

  try {
    const data = await fetchApi<HomePageLayoutResponse | { data?: HomePageLayoutResponse }>(path);
    const payload = 'data' in data && data.data ? data.data : (data as HomePageLayoutResponse);
    const sections = normalizeSections(payload);
    if (sections) return sections;
  } catch {
    // Network or 404 — use defaults in dev / when CMS not deployed
  }

  return HOME_PAGE_DEFAULT_SECTIONS;
}
