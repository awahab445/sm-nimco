import { IsEmail } from 'class-validator';

export class RequestAccountCreationDto {
  @IsEmail()
  email: string;
}
