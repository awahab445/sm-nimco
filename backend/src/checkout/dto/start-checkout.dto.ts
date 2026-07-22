import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEmail,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetaCapiClientDto } from '../../common/dto/meta-capi-client.dto';

export class StartCheckoutDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  customerId?: string;

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
  @IsEmail()
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
