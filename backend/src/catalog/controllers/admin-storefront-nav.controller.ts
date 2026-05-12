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
import { StorefrontNavService } from '../services/storefront-nav.service';
import { CreateStorefrontNavLinkDto } from '../dto/create-storefront-nav-link.dto';
import { UpdateStorefrontNavLinkDto } from '../dto/update-storefront-nav-link.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/storefront-navigation')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminStorefrontNavController {
  constructor(private readonly storefrontNavService: StorefrontNavService) {}

  @Get()
  @RequirePermissions('products.read')
  @HttpCode(HttpStatus.OK)
  async list() {
    const data = await this.storefrontNavService.listAllForAdmin();
    return { data };
  }

  @Post()
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateStorefrontNavLinkDto) {
    return this.storefrontNavService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateStorefrontNavLinkDto) {
    return this.storefrontNavService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.storefrontNavService.delete(id);
  }
}
