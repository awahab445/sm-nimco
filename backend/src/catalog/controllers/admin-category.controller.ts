import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { SyncCategoryProductsDto } from '../dto/sync-category-products.dto';
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

  @Post('images/upload')
  @RequirePermissions('products.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        const allowedMime = /^image\/(jpeg|png|webp|gif)$/i.test(
          file.mimetype || '',
        );
        const allowedExt = /\.(jpe?g|png|webp|gif)$/i.test(
          file.originalname || '',
        );
        if (allowedMime && allowedExt) {
          cb(null, true);
          return;
        }
        cb(
          new BadRequestException(
            'Only PNG, JPEG, WEBP, and GIF image files are allowed',
          ) as any,
          false,
        );
      },
      storage: diskStorage({
        destination: 'uploads/categories',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ fileIsRequired: true }),
    )
    file: any,
  ) {
    const normalizedPath = file.path.replace(/\\/g, '/');
    const publicPath = normalizedPath.startsWith('uploads/')
      ? `/${normalizedPath}`
      : `/uploads/categories/${file.filename}`;
    return {
      url: publicPath,
      filename: file.filename,
    };
  }

  @Get(':id/products')
  @RequirePermissions('products.read')
  @HttpCode(HttpStatus.OK)
  async getProducts(@Param('id') id: string) {
    return this.categoryService.getProducts(id);
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
      imageUrl: dto.imageUrl,
      bannerUrl: dto.bannerUrl,
      parentId: dto.parentId,
      position: dto.position,
      isFeatured: dto.isFeatured,
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
      imageUrl: dto.imageUrl,
      bannerUrl: dto.bannerUrl,
      parentId: dto.parentId,
      position: dto.position,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
    });
  }

  @Put(':id/products')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async syncProducts(
    @Param('id') id: string,
    @Body() dto: SyncCategoryProductsDto,
  ) {
    return this.categoryService.syncProducts(id, dto.productIds);
  }

  @Delete(':id')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
