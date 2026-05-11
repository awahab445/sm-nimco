import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';
import { ImageService } from '../services/image.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';
import { CreateImageDto } from '../dto/create-image.dto';
import { UpdateImageDto } from '../dto/update-image.dto';
import { AssignCategoryDto } from '../dto/assign-category.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { UpsertProductOptionsDto } from '../dto/upsert-product-options.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { CheckPermission } from '../../admin/decorators/check-permission.decorator';
import { UseGuards } from '@nestjs/common';
import { ProductOptionsService } from '../services/product-options.service';

@Controller('admin/products')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly imageService: ImageService,
    private readonly productOptionsService: ProductOptionsService,
  ) {}

  @Get()
  @CheckPermission('products', 'read')
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: ProductQueryDto) {
    return this.productService.findAllAdmin(query);
  }

  @Post()
  @CheckPermission('products', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get(':id')
  @CheckPermission('products', 'read')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.productService.findOneById(id, true);
  }

  @Patch(':id')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @CheckPermission('products', 'delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Get(':id/options')
  @CheckPermission('products', 'read')
  @HttpCode(HttpStatus.OK)
  async getProductOptions(@Param('id') productId: string) {
    return this.productOptionsService.getProductOptions(productId);
  }

  @Patch(':id/options')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async upsertProductOptions(
    @Param('id') productId: string,
    @Body() dto: UpsertProductOptionsDto,
  ) {
    return this.productOptionsService.upsertProductOptions(productId, dto);
  }

  @Post(':id/variants')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.variantService.create(productId, createVariantDto);
  }

  @Post(':id/variants/create-combinations')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async createVariantCombinations(@Param('id') productId: string) {
    return this.variantService.createCombinationsFromProductOptions(productId);
  }

  @Patch('variants/:id')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async updateVariant(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantService.update(id, updateVariantDto);
  }

  @Delete('variants/:id')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async removeVariant(@Param('id') id: string) {
    return this.variantService.remove(id);
  }

  @Post(':id/images')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.CREATED)
  async createImage(
    @Param('id') productId: string,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imageService.create(productId, createImageDto);
  }

  @Post('images/upload')
  @CheckPermission('products', 'update')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        const allowedMime = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype || '');
        const allowedExt = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname || '');
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
        destination: 'uploads/products',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ fileIsRequired: true }),
    )
    file: any,
    @Req() req: Request,
  ) {
    const publicBaseUrl = process.env.PUBLIC_BASE_URL?.trim();
    const protoRaw = (req.headers['x-forwarded-proto'] as string | undefined) || req.protocol;
    const proto = protoRaw === 'https' ? 'https' : 'http';
    const host = req.get('host')?.trim() || 'localhost:3000';
    const normalizedPath = file.path.replace(/\\/g, '/');
    const publicPath = normalizedPath.startsWith('uploads/')
      ? `/${normalizedPath}`
      : `/uploads/products/${file.filename}`;
    const baseUrl = publicBaseUrl || `${proto}://${host}`;
    return {
      url: `${baseUrl}${publicPath}`,
      filename: file.filename,
    };
  }

  @Patch('images/:id')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async updateImage(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imageService.update(id, updateImageDto);
  }

  @Delete('images/:id')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.OK)
  async removeImage(@Param('id') id: string) {
    return this.imageService.remove(id);
  }

  @Post(':id/categories')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.CREATED)
  async assignCategory(
    @Param('id') productId: string,
    @Body() assignCategoryDto: AssignCategoryDto,
  ) {
    return this.productService.assignCategory(
      productId,
      assignCategoryDto.categoryId,
      assignCategoryDto.position,
    );
  }

  @Delete(':id/categories/:categoryId')
  @CheckPermission('products', 'update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCategory(
    @Param('id') productId: string,
    @Param('categoryId') categoryId: string,
  ) {
    await this.productService.removeCategoryFromProduct(productId, categoryId);
  }
}

