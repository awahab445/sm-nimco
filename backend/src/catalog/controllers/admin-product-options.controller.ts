import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { ProductOptionsService } from '../services/product-options.service';
import { CreateProductOptionDto } from '../dto/create-product-option.dto';
import { UpdateProductOptionDto } from '../dto/update-product-option.dto';
import { CreateProductOptionValueDto } from '../dto/create-product-option-value.dto';
import { UpdateProductOptionValueDto } from '../dto/update-product-option-value.dto';

@Controller('admin/product-options')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminProductOptionsController {
  constructor(private readonly optionsService: ProductOptionsService) {}

  @Get()
  @RequirePermissions('catalog.read')
  @HttpCode(HttpStatus.OK)
  async list() {
    return this.optionsService.listOptionsAdmin();
  }

  @Post()
  @RequirePermissions('catalog.manage')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductOptionDto) {
    return this.optionsService.createOption(dto);
  }

  @Patch(':id')
  @RequirePermissions('catalog.manage')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProductOptionDto) {
    return this.optionsService.updateOption(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('catalog.manage')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.optionsService.deleteOption(id);
  }

  @Post(':id/values')
  @RequirePermissions('catalog.manage')
  @HttpCode(HttpStatus.CREATED)
  async createValue(
    @Param('id') optionId: string,
    @Body() dto: CreateProductOptionValueDto,
  ) {
    return this.optionsService.createOptionValue(optionId, dto);
  }
}

@Controller('admin/product-option-values')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminProductOptionValuesController {
  constructor(private readonly optionsService: ProductOptionsService) {}

  @Patch(':id')
  @RequirePermissions('catalog.manage')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProductOptionValueDto) {
    return this.optionsService.updateOptionValue(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('catalog.manage')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.optionsService.deleteOptionValue(id);
  }
}

