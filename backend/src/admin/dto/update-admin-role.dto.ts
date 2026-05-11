import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { NewPermissionDto } from './new-permission.dto';

export class UpdateAdminRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /**
   * Full replacement set of permission keys. Omit to leave permissions
   * unchanged. May include keys minted in `newPermissions` below.
   */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissionKeys?: string[];

  /**
   * Brand-new permission keys to mint before applying `permissionKeys`.
   * Each entry is upserted into `admin_permissions`.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => NewPermissionDto)
  newPermissions?: NewPermissionDto[];
}
