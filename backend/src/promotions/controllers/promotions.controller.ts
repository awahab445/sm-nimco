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
} from '@nestjs/common';
import { PromotionsService } from '../services/promotions.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { PatchPromotionDto } from '../dto/patch-promotion.dto';
import { ValidatePromotionDto } from '../dto/validate-promotion.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * POST /promotions
   * Create a new promotion
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto) {
    return await this.promotionsService.createPromotion(createPromotionDto);
  }

  /**
   * GET /promotions
   * Active, in-window promotions (default). Pass allStatuses=true for admin list (all records).
   */
  @Get()
  async getPromotions(@Query('allStatuses') allStatuses?: string) {
    const all = allStatuses === 'true' || allStatuses === '1';
    return await this.promotionsService.listPromotions(all);
  }

  /**
   * GET /promotions/:id/logs
   * Register before `:id` so `logs` is not captured as an id.
   */
  @Get(':id/logs')
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

  /**
   * POST /promotions/:id/validate
   */
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

  /**
   * GET /promotions/:id
   */
  @Get(':id')
  async getPromotion(@Param('id') id: string) {
    return await this.promotionsService.getPromotion(id);
  }

  /**
   * PATCH /promotions/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchPromotion(
    @Param('id') id: string,
    @Body() dto: PatchPromotionDto,
  ) {
    return await this.promotionsService.patchPromotion(id, dto);
  }

  /**
   * DELETE /promotions/:id — staff only; permanent delete.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('promotions.manage')
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.deletePromotion(id);
  }
}

