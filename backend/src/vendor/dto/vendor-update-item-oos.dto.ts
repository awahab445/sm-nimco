import { IsBoolean } from 'class-validator';

export class VendorUpdateItemOutOfStockDto {
  @IsBoolean()
  outOfStock!: boolean;
}
