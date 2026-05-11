import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { NewPermissionDto } from './new-permission.dto';

export class CreateAdminRoleDto {
  /** URL-safe lowercase identifier, e.g. "warehouse-ops". */
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'slug must be lowercase letters, digits, and dashes',
  })
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /** Existing permission keys (must be present in admin_permissions). */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissionKeys?: string[];

  /**
   * Brand-new permission keys to mint as part of this role creation.
   * Each entry is upserted into `admin_permissions` before being granted.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => NewPermissionDto)
  newPermissions?: NewPermissionDto[];
}
