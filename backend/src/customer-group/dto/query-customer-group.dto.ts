import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class QueryCustomerGroupDto {
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  search?: string; // Search by name or description
}
