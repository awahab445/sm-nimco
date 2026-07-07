import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { isPolicyPageSlug } from '../constants/policy-page-slugs';
import { UpsertPolicyPageBySlugDto } from '../dto/upsert-policy-page-by-slug.dto';
import { CmsService } from '../services/cms.service';

@Controller('admin/pages')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminPagesController {
  constructor(private readonly cmsService: CmsService) {}

  @Get(':slug')
  @RequirePermissions('cms.manage')
  getPageBySlug(@Param('slug') slug: string) {
    this.assertPolicySlug(slug);
    return this.cmsService.getPageBySlug(slug);
  }

  @Put(':slug')
  @Post(':slug')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('cms.manage')
  upsertPageBySlug(@Param('slug') slug: string, @Body() dto: UpsertPolicyPageBySlugDto) {
    this.assertPolicySlug(slug);
    return this.cmsService.upsertPageBySlug(slug, dto);
  }

  private assertPolicySlug(slug: string) {
    if (!isPolicyPageSlug(slug)) {
      throw new BadRequestException(
        `Invalid policy page slug. Allowed: shipping-returns, privacy-policy, terms-conditions`,
      );
    }
  }
}
