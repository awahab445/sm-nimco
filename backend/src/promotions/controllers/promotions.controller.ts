import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PromotionsService } from '../services/promotions.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { PatchPromotionDto } from '../dto/patch-promotion.dto';
import { ValidatePromotionDto } from '../dto/validate-promotion.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { AdminRbacService } from '../../admin/services/admin-rbac.service';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';

@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly rbac: AdminRbacService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('promotions.manage')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto) {
    return await this.promotionsService.createPromotion(createPromotionDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getPromotions(
    @Query('allStatuses') allStatuses?: string,
    @Req() request?: { user?: JwtValidatePayload | null },
  ) {
    const all = allStatuses === 'true' || allStatuses === '1';
    if (all) {
      const user = request?.user;
      if (!user || user.typ !== 'admin') {
        throw new ForbiddenException('Admin access required for allStatuses list');
      }
      const allowed = await this.rbac.userHasAllPermissions(user.adminUserId, [
        'promotions.manage',
      ]);
      if (!allowed) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }
    return await this.promotionsService.listPromotions(all);
  }

  @Get(':id/logs')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('promotions.manage')
  async getPromotionLogs(
    @Param('id') id: string,
    @Query('cartId') cartId?: string,
    @Query('checkoutId') checkoutId?: string,
    @Query('orderId') orderId?: string,
  ) {
    return await this.promotionsService.getPromotionLogs(
      id,
      cartId,
      checkoutId,
      orderId,
    );
  }

  @Post(':id/validate')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async validatePromotion(
    @Param('id') id: string,
    @Body() validateDto: Omit<ValidatePromotionDto, 'promotionId'>,
  ) {
    return await this.promotionsService.validatePromotion({
      ...validateDto,
      promotionId: id,
    });
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('promotions.manage')
  async getPromotion(@Param('id') id: string) {
    return await this.promotionsService.getPromotion(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('promotions.manage')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchPromotion(
    @Param('id') id: string,
    @Body() dto: PatchPromotionDto,
  ) {
    return await this.promotionsService.patchPromotion(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('promotions.manage')
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.deletePromotion(id);
  }
}
