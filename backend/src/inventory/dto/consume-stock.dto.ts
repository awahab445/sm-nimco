import { IsString, IsNotEmpty } from 'class-validator';

export class ConsumeStockDto {
  @IsString()
  @IsNotEmpty()
  reservationId: string;
}

