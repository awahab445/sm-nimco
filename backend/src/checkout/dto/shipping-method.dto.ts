import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  methodId: string;

  @IsString()
  @IsNotEmpty()
  methodName: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @Min(0)
  estimatedDays: number;
}

