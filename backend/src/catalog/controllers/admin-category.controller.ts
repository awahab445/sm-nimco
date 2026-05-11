import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('admin/categories')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @RequirePermissions('products.read')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.categoryService.findAll({ includeInactive: true });
  }

  @Get(':id')
  @RequirePermissions('products.read')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      parentId: dto.parentId,
      position: dto.position,
    });
  }

  @Patch(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      parentId: dto.parentId,
      position: dto.position,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
