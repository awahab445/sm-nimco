import { IsArray, IsUUID } from 'class-validator';

export class SyncCategoryProductsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];
}
