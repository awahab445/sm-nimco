import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddWishlistItemDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;
}
