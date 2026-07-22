import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsUUID,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetaCapiClientDto } from '../../common/dto/meta-capi-client.dto';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  /** Meta Pixel ↔ CAPI dedupe / matching (optional). */
  @IsOptional()
  @ValidateNested()
  @Type(() => MetaCapiClientDto)
  meta?: MetaCapiClientDto;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  eventId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fbp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fbc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  eventSourceUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  externalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  fbLoginId?: string;
}
