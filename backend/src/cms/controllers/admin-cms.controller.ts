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
  Query,
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
import { CmsService } from '../services/cms.service';
import { CmsSlideImageService } from '../services/cms-slide-image.service';
import { UpsertCmsPageDto } from '../dto/upsert-cms-page.dto';
import { UpsertCmsBlockDto } from '../dto/upsert-cms-block.dto';
import { UpsertCmsSliderDto } from '../dto/upsert-cms-slider.dto';

@Controller('admin/cms')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminCmsController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly cmsSlideImageService: CmsSlideImageService,
  ) {}

  @Get('pages')
  @RequirePermissions('cms.manage')
  listPages() {
    return this.cmsService.listPages();
  }

  @Get('pages/:id')
  @RequirePermissions('cms.manage')
  getPage(@Param('id') id: string) {
    return this.cmsService.getPageById(id);
  }

  @Post('pages')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('cms.manage')
  createPage(@Body() dto: UpsertCmsPageDto) {
    return this.cmsService.createPage(dto);
  }

  @Patch('pages/:id')
  @RequirePermissions('cms.manage')
  updatePage(@Param('id') id: string, @Body() dto: Partial<UpsertCmsPageDto>) {
    return this.cmsService.updatePage(id, dto);
  }

  @Delete('pages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('cms.manage')
  async deletePage(@Param('id') id: string) {
    await this.cmsService.deletePage(id);
  }

  @Get('blocks')
  @RequirePermissions('cms.manage')
  listBlocks() {
    return this.cmsService.listBlocks();
  }

  @Get('blocks/:id')
  @RequirePermissions('cms.manage')
  getBlock(@Param('id') id: string) {
    return this.cmsService.getBlockById(id);
  }

  @Post('blocks')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('cms.manage')
  createBlock(@Body() dto: UpsertCmsBlockDto) {
    return this.cmsService.createBlock(dto);
  }

  @Patch('blocks/:id')
  @RequirePermissions('cms.manage')
  updateBlock(
    @Param('id') id: string,
    @Body() dto: Partial<UpsertCmsBlockDto>,
  ) {
    return this.cmsService.updateBlock(id, dto);
  }

  @Delete('blocks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('cms.manage')
  async deleteBlock(@Param('id') id: string) {
    await this.cmsService.deleteBlock(id);
  }

  @Post('slides/upload')
  @RequirePermissions('cms.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        const allowedMime = /^image\/(jpeg|png|webp|gif|avif)$/i.test(
          file.mimetype || '',
        );
        const allowedExt = /\.(jpe?g|png|webp|gif|avif)$/i.test(
          file.originalname || '',
        );
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
        destination: 'uploads/cms-slides',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadSlideImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 8 * 1024 * 1024 })
        .build({ fileIsRequired: true }),
    )
    file: { path: string; filename: string },
    @Req() req: Request,
    /** `mobile` = art-direction upload (single optimized asset). Default = full variant set. */
    @Query('purpose') purpose?: string,
  ) {
    const publicBaseUrl = process.env.PUBLIC_BASE_URL?.trim();
    const protoRaw =
      (req.headers['x-forwarded-proto'] as string | undefined) || req.protocol;
    const proto = protoRaw === 'https' ? 'https' : 'http';
    const host = req.get('host')?.trim() || 'localhost:3000';
    const baseUrl = publicBaseUrl || `${proto}://${host}`;

    if (purpose === 'mobile') {
      return this.cmsSlideImageService.processMobileOnly(file, baseUrl);
    }

    return this.cmsSlideImageService.processUploadedSlide(file, baseUrl);
  }

  @Get('sliders')
  @RequirePermissions('cms.manage')
  listSliders() {
    return this.cmsService.listSliders();
  }

  @Get('sliders/:id')
  @RequirePermissions('cms.manage')
  getSlider(@Param('id') id: string) {
    return this.cmsService.getSliderById(id);
  }

  @Post('sliders')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('cms.manage')
  createSlider(@Body() dto: UpsertCmsSliderDto) {
    return this.cmsService.createSlider(dto);
  }

  @Patch('sliders/:id')
  @RequirePermissions('cms.manage')
  updateSlider(
    @Param('id') id: string,
    @Body() dto: Partial<UpsertCmsSliderDto>,
  ) {
    return this.cmsService.updateSlider(id, dto);
  }

  @Delete('sliders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('cms.manage')
  async deleteSlider(@Param('id') id: string) {
    await this.cmsService.deleteSlider(id);
  }
}
