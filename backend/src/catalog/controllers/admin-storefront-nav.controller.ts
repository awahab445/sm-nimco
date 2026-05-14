import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { StorefrontNavService } from '../services/storefront-nav.service';
import { CreateStorefrontNavLinkDto, ReorderStorefrontNavDto } from '../dto/create-storefront-nav-link.dto';
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

  @Patch('reorder')
  @RequirePermissions('products.manage')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async reorder(@Body() dto: ReorderStorefrontNavDto) {
    return this.storefrontNavService.reorder(dto);
  }

  @Post('banner/upload')
  @RequirePermissions('products.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        const allowedMime = /^image\/(jpeg|png|webp|gif|avif)$/i.test(file.mimetype || '');
        const allowedExt = /\.(jpe?g|png|webp|gif|avif)$/i.test(file.originalname || '');
        if (allowedMime && allowedExt) {
          cb(null, true);
          return;
        }
        cb(
          new BadRequestException(
            'Only PNG, JPEG, WEBP, GIF, and AVIF image files are allowed',
          ) as any,
          false,
        );
      },
      storage: diskStorage({
        destination: 'uploads/storefront-nav',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  uploadBannerImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 8 * 1024 * 1024 })
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
      : `/uploads/storefront-nav/${file.filename}`;
    const baseUrl = publicBaseUrl || `${proto}://${host}`;
    return {
      url: `${baseUrl}${publicPath}`,
      filename: file.filename,
    };
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
