import { SERVER_API_BASE_URL } from '@/lib/api-base-url';
import { CACHE_TAGS } from '@/lib/cache-tags';
import {
  normalizeProvisionedThemeId,
  type ProvisionedThemeId,
} from '@/lib/theme/types';

const FALLBACK_THEME: ProvisionedThemeId = 'tailwind';

export async function fetchActiveTheme(): Promise<ProvisionedThemeId> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}/settings/theme`, {
      next: { revalidate: 60, tags: [CACHE_TAGS.theme, CACHE_TAGS.storefront] },
    });
    if (!res.ok) return FALLBACK_THEME;
    const json = (await res.json()) as { data?: { theme?: string } };
    return normalizeProvisionedThemeId(json.data?.theme);
  } catch {
    return FALLBACK_THEME;
  }
}
