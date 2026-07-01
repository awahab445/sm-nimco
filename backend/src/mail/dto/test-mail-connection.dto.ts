import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

/** Test SMTP settings before saving (password in request body only, never persisted by this endpoint). */
export class TestMailConnectionDto {
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
  @IsOptional()
  fromName?: string;

  @IsEmail()
  @IsOptional()
  fromAddress?: string;

  /** Optional inbox to receive a test message. If omitted, only SMTP verify() runs. */
  @IsEmail()
  @IsOptional()
  testRecipient?: string;
}
