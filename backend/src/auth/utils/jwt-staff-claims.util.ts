import {
  SUPER_ADMIN_ROLE_SLUG,
  STORE_OPERATOR_ROLE_SLUG,
} from '../../admin/constants/permissions';

/** Flutter / mobile JWT `role` claim values (SCREAMING_SNAKE). */
export const JwtStaffRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STORE_OPERATOR: 'STORE_OPERATOR',
  MANAGER: 'MANAGER',
  SUPPORT: 'SUPPORT',
} as const;

export type JwtStaffRoleClaim =
  (typeof JwtStaffRole)[keyof typeof JwtStaffRole];

const SLUG_TO_JWT_ROLE: Record<string, JwtStaffRoleClaim> = {
  [SUPER_ADMIN_ROLE_SLUG]: JwtStaffRole.SUPER_ADMIN,
  [STORE_OPERATOR_ROLE_SLUG]: JwtStaffRole.STORE_OPERATOR,
  manager: JwtStaffRole.MANAGER,
  support: JwtStaffRole.SUPPORT,
};

/**
 * Pick the primary JWT `role` claim from assigned admin role slugs.
 * Prefer SUPER_ADMIN, then STORE_OPERATOR, then first mapped role.
 */
export function resolveJwtStaffRole(
  roleSlugs: string[],
): JwtStaffRoleClaim | undefined {
  if (roleSlugs.includes(SUPER_ADMIN_ROLE_SLUG)) {
    return JwtStaffRole.SUPER_ADMIN;
  }
  if (roleSlugs.includes(STORE_OPERATOR_ROLE_SLUG)) {
    return JwtStaffRole.STORE_OPERATOR;
  }
  for (const slug of roleSlugs) {
    const mapped = SLUG_TO_JWT_ROLE[slug];
    if (mapped) return mapped;
  }
  const first = roleSlugs[0];
  if (!first) return undefined;
  return first.replace(/-/g, '_').toUpperCase() as JwtStaffRoleClaim;
}

/** Optional store id for multi-store / Flutter clients (`STORE_ID` env). */
export function resolveJwtStoreId(
  fallbackStoreSettingsId?: string | null,
): string | undefined {
  const fromEnv =
    process.env.STORE_ID?.trim() || process.env.DEFAULT_STORE_ID?.trim();
  if (fromEnv) return fromEnv;
  const fromSettings = fallbackStoreSettingsId?.trim();
  return fromSettings || undefined;
}
