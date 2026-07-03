import { SERVER_API_BASE_URL } from '@/lib/api-base-url';
import {
  normalizeProvisionedThemeId,
  type ProvisionedThemeId,
} from '@/lib/theme/types';

const FALLBACK_THEME: ProvisionedThemeId = 'tailwind';

export async function fetchActiveTheme(): Promise<ProvisionedThemeId> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}/settings/theme`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return FALLBACK_THEME;
    const json = (await res.json()) as { data?: { theme?: string } };
    return normalizeProvisionedThemeId(json.data?.theme);
  } catch {
    return FALLBACK_THEME;
  }
}
