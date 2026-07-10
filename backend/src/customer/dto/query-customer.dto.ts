import { IsOptional, IsBoolean, IsString, IsUUID } from 'class-validator';

export class QueryCustomerDto {
  @IsBoolean()
  @IsOptional()
  isGuest?: boolean;

  @IsUUID()
  @IsOptional()
  customerGroupId?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search by email, firstName, lastName
}
