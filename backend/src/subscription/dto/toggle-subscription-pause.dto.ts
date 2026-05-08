import { IsOptional, IsString } from 'class-validator';

export class ToggleSubscriptionPauseDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
