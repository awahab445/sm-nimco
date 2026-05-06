import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PromotionsService } from '../services/promotions.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { PatchPromotionDto } from '../dto/patch-promotion.dto';
import { ValidatePromotionDto } from '../dto/validate-promotion.dto';

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
   * GET /promotions/:id
   * Get promotion by ID
   */
  @Get(':id')
  async getPromotion(@Param('id') id: string) {
    return await this.promotionsService.getPromotion(id);
  }

  /**
   * PATCH /promotions/:id
   * Update promotion (e.g. lifecycle status for admin)
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
   * POST /promotions/:id/validate
   * Validate promotion eligibility
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
   * GET /promotions/:id/logs
   * Get promotion logs
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
}

