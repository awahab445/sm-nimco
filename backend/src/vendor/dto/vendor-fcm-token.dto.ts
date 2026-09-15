import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VendorFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(512)
  fcmToken!: string;
}
