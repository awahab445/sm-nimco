import { IsEmail, IsOptional } from 'class-validator';

export class TestExistingMailboxDto {
  @IsEmail()
  @IsOptional()
  testRecipient?: string;
}
