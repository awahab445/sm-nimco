import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { MailMailboxPurpose } from '../types/mail-purpose.types';

export class UpdateMailMailboxDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  code?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsEnum(MailMailboxPurpose)
  @IsOptional()
  purpose?: MailMailboxPurpose;

  @IsString()
  @IsOptional()
  smtpHost?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  smtpPort?: number;

  @IsBoolean()
  @IsOptional()
  smtpSecure?: boolean;

  @IsString()
  @IsOptional()
  smtpUser?: string;

  /** Omit to keep the existing encrypted password. */
  @IsString()
  @IsOptional()
  smtpPass?: string;

  @IsString()
  @IsOptional()
  fromName?: string;

  @IsEmail()
  @IsOptional()
  fromAddress?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
