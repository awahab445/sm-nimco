import { PartialType } from '@nestjs/mapped-types';
import { CreateProductOptionValueDto } from './create-product-option-value.dto';

export class UpdateProductOptionValueDto extends PartialType(CreateProductOptionValueDto) {}

