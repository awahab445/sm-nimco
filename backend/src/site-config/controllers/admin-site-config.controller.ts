import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { UpdateSiteConfigDto } from '../dto/update-site-config.dto';
import { SiteConfigService } from '../services/site-config.service';

type AdminRequest = Request & { user?: { sub?: string; id?: string } };

@Controller('admin/settings/site-config')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminSiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get()
  @RequirePermissions('settings.manage')
  async getAdminConfig() {
    const data = await this.siteConfigService.getAdminConfig();
    return { data };
  }

  @Patch()
  @RequirePermissions('settings.manage')
  @UseInterceptors(
    FileInterceptor('logo', {
      fileFilter: (_req, file, cb) => {
        const allowedMime = /^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/i.test(
          file.mimetype || '',
        );
        const allowedExt = /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(
          file.originalname || '',
        );
        if (allowedMime && allowedExt) {
          cb(null, true);
          return;
        }
        cb(
          new BadRequestException(
            'Only PNG, JPEG, WEBP, GIF, AVIF, and SVG image files are allowed',
          ) as any,
          false,
        );
      },
      storage: diskStorage({
        destination: 'uploads/site-config',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.OK)
  async updateSiteConfig(
    @Body() dto: UpdateSiteConfigDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 4 * 1024 * 1024 })
        .build({ fileIsRequired: false }),
    )
    file: any,
    @Req() req: AdminRequest,
  ) {
    const adminUserId = req.user?.sub ?? req.user?.id;
    const patchDto: UpdateSiteConfigDto = { ...dto };
    if (dto.removeLogo) {
      patchDto.logoUrl = null;
    }

    if (file) {
      const normalizedPath = file.path.replace(/\\/g, '/');
      const publicPath = normalizedPath.startsWith('uploads/')
        ? `/${normalizedPath}`
        : `/uploads/site-config/${file.filename}`;
      // Persist clean relative path; frontend resolves /uploads/* via API host.
      patchDto.logoUrl = publicPath;
    }

    const data = await this.siteConfigService.updateConfig(patchDto, adminUserId);
    return { data };
  }
}
