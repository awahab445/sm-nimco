import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Sent in `newPermissions[]` on role create / update to mint a brand-new
 * permission key alongside the role. The service upserts these into
 * `admin_permissions` before resolving the role's permission set, so callers
 * can grant a key that does not yet exist in the seed catalog.
 *
 * Key convention is `entity.action` (e.g. `warehouse.scan`). Lowercase letters,
 * digits, dots, and dashes are allowed.
 */
export class NewPermissionDto {
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/, {
    message:
      'permission key must be lowercase letters, digits, dots and dashes (e.g. "warehouse.scan")',
  })
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
