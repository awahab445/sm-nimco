import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class SetGuestCustomerDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;
}
