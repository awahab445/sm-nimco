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

export class CreateMailMailboxDto {
  @IsString()
  @MinLength(2)
  code: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(MailMailboxPurpose)
  purpose: MailMailboxPurpose;

  @IsString()
  smtpHost: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort: number;

  @IsBoolean()
  @IsOptional()
  smtpSecure?: boolean;

  @IsString()
  smtpUser: string;

  @IsString()
  @MinLength(1)
  smtpPass: string;

  @IsString()
  fromName: string;

  @IsEmail()
  fromAddress: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
