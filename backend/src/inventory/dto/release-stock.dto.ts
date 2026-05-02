import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReleaseStockDto {
  @IsString()
  @IsOptional()
  reservationId?: string;

  @IsString()
  @IsOptional()
  referenceType?: 'cart' | 'order';

  @IsString()
  @IsOptional()
  referenceId?: string;
}

