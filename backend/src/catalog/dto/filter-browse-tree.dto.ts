import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateFilterBrowseTreeNodeDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}

export class ReorderFilterBrowseTreeItemDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class ReorderFilterBrowseTreeDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderFilterBrowseTreeItemDto)
  items!: ReorderFilterBrowseTreeItemDto[];
}
