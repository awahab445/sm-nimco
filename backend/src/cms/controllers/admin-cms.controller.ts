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
import { CmsService } from '../services/cms.service';
import { UpsertCmsPageDto } from '../dto/upsert-cms-page.dto';
import { UpsertCmsBlockDto } from '../dto/upsert-cms-block.dto';
import { UpsertCmsSliderDto } from '../dto/upsert-cms-slider.dto';

@Controller('admin/cms')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminCmsController {
  constructor(private readonly cmsService: CmsService) {}

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
  updateBlock(@Param('id') id: string, @Body() dto: Partial<UpsertCmsBlockDto>) {
    return this.cmsService.updateBlock(id, dto);
  }

  @Delete('blocks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('cms.manage')
  async deleteBlock(@Param('id') id: string) {
    await this.cmsService.deleteBlock(id);
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
  updateSlider(@Param('id') id: string, @Body() dto: Partial<UpsertCmsSliderDto>) {
    return this.cmsService.updateSlider(id, dto);
  }

  @Delete('sliders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('cms.manage')
  async deleteSlider(@Param('id') id: string) {
    await this.cmsService.deleteSlider(id);
  }
}
