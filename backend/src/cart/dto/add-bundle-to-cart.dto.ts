import { IsInt, IsUUID, Min } from 'class-validator';

export class AddBundleToCartDto {
  @IsUUID()
  bundleDealId: string;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}
