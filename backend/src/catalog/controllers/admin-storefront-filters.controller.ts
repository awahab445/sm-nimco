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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StorefrontFilterService } from '../services/storefront-filter.service';
import { CreateStorefrontFilterDto } from '../dto/create-storefront-filter.dto';
import { UpdateStorefrontFilterDto } from '../dto/update-storefront-filter.dto';
import { CreateStorefrontFilterOptionDto } from '../dto/create-storefront-filter-option.dto';
import { UpdateStorefrontFilterOptionDto } from '../dto/update-storefront-filter-option.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/store-filters')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminStorefrontFiltersController {
  constructor(private readonly storefrontFilterService: StorefrontFilterService) {}

  @Get()
  @RequirePermissions('products.read')
  @HttpCode(HttpStatus.OK)
  async list() {
    const data = await this.storefrontFilterService.listAllForAdmin();
    return { data };
  }

  @Post()
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createFilter(@Body() dto: CreateStorefrontFilterDto) {
    return this.storefrontFilterService.createFilter(dto);
  }

  @Patch('options/:optionId')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOption(@Param('optionId') optionId: string, @Body() dto: UpdateStorefrontFilterOptionDto) {
    return this.storefrontFilterService.updateOption(optionId, dto);
  }

  @Delete('options/:optionId')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async deleteOption(@Param('optionId') optionId: string) {
    return this.storefrontFilterService.deleteOption(optionId);
  }

  @Post(':filterId/options')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOption(@Param('filterId') filterId: string, @Body() dto: CreateStorefrontFilterOptionDto) {
    return this.storefrontFilterService.createOption(filterId, dto);
  }

  @Patch(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateFilter(@Param('id') id: string, @Body() dto: UpdateStorefrontFilterDto) {
    return this.storefrontFilterService.updateFilter(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async deleteFilter(@Param('id') id: string) {
    return this.storefrontFilterService.deleteFilter(id);
  }
}
