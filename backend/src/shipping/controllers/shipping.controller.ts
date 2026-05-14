import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ShippingService } from '../services/shipping.service';
import { CreateZoneDto, UpdateZoneDto } from '../dto/create-zone.dto';
import { CreateMethodDto, UpdateMethodDto } from '../dto/create-method.dto';
import { CalculateShippingDto } from '../dto/calculate-shipping.dto';
import { AssignShippingDto, UpdateShippingStatusDto } from '../dto/assign-shipping.dto';
import {
  AssignCustomerGroupDto,
  UpdateCustomerGroupPricingDto,
} from '../dto/customer-group.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * Calculate shipping options for a cart
   * POST /shipping/calculate
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculateShipping(@Body() dto: CalculateShippingDto) {
    return this.shippingService.calculateShipping(dto);
  }

  /**
   * Get shipping details for an order
   * GET /shipping/order/:orderId
   */
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getOrderShipping(@Param('orderId') orderId: string, @Req() request: any) {
    return this.shippingService.getOrderShippingAuthorized(orderId, request.user);
  }
}

/**
 * Admin controller for shipping management
 */
@Controller('admin/shipping')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // ============================================================================
  // ZONE MANAGEMENT
  // ============================================================================

  /**
   * Create shipping zone
   * POST /admin/shipping/zones
   */
  @Post('zones')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.CREATED)
  async createZone(@Body() dto: CreateZoneDto) {
    return this.shippingService.createZone(dto);
  }

  /**
   * Get all shipping zones
   * GET /admin/shipping/zones
   */
  @Get('zones')
  @RequirePermissions('shipping.manage')
  async getAllZones(@Query('includeInactive') includeInactive?: string) {
    return this.shippingService.getAllZones(includeInactive === 'true');
  }

  /**
   * Get shipping zone by ID
   * GET /admin/shipping/zones/:id
   */
  @Get('zones/:id')
  @RequirePermissions('shipping.manage')
  async getZoneById(@Param('id') id: string) {
    return this.shippingService.getZoneById(id);
  }

  /**
   * Update shipping zone
   * PUT /admin/shipping/zones/:id
   */
  @Put('zones/:id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
  ) {
    return this.shippingService.updateZone(id, dto);
  }

  /**
   * Delete shipping zone
   * DELETE /admin/shipping/zones/:id
   */
  @Delete('zones/:id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteZone(@Param('id') id: string) {
    await this.shippingService.deleteZone(id);
  }

  // ============================================================================
  // METHOD MANAGEMENT
  // ============================================================================

  /**
   * Create shipping method
   * POST /admin/shipping/methods
   */
  @Post('methods')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.CREATED)
  async createMethod(@Body() dto: CreateMethodDto) {
    return this.shippingService.createMethod(dto);
  }

  /**
   * Get shipping methods for a zone
   * GET /admin/shipping/zones/:zoneId/methods
   */
  @Get('zones/:zoneId/methods')
  @RequirePermissions('shipping.manage')
  async getMethodsByZone(
    @Param('zoneId') zoneId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.shippingService.getMethodsByZone(zoneId, includeInactive === 'true');
  }

  /**
   * Get shipping method by ID
   * GET /admin/shipping/methods/:id
   */
  @Get('methods/:id')
  @RequirePermissions('shipping.manage')
  async getMethodById(@Param('id') id: string) {
    return this.shippingService.getMethodById(id);
  }

  /**
   * Update shipping method
   * PUT /admin/shipping/methods/:id
   */
  @Put('methods/:id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async updateMethod(
    @Param('id') id: string,
    @Body() dto: UpdateMethodDto,
  ) {
    return this.shippingService.updateMethod(id, dto);
  }

  /**
   * Delete shipping method
   * DELETE /admin/shipping/methods/:id
   */
  @Delete('methods/:id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMethod(@Param('id') id: string) {
    await this.shippingService.deleteMethod(id);
  }

  // ============================================================================
  // ORDER SHIPPING MANAGEMENT
  // ============================================================================

  /**
   * Assign shipping method to order
   * POST /admin/shipping/orders/:orderId/assign
   */
  @Post('orders/:orderId/assign')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.CREATED)
  async assignShipping(
    @Param('orderId') orderId: string,
    @Body() dto: AssignShippingDto,
  ) {
    return this.shippingService.assignShippingToOrder(orderId, dto);
  }

  /**
   * Update shipping status
   * PUT /admin/shipping/orders/:orderId/status
   */
  @Put('orders/:orderId/status')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async updateShippingStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateShippingStatusDto,
  ) {
    return this.shippingService.updateShippingStatus(
      orderId,
      dto.status as any,
      dto.trackingNumber,
      dto.trackingUrl,
    );
  }

  // ============================================================================
  // CUSTOMER GROUP MANAGEMENT
  // ============================================================================

  /**
   * Assign customer group to shipping method
   * POST /admin/shipping/methods/:methodId/customer-groups
   */
  @Post('methods/:methodId/customer-groups')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.CREATED)
  async assignCustomerGroup(
    @Param('methodId') methodId: string,
    @Body() dto: AssignCustomerGroupDto,
  ) {
    await this.shippingService.assignCustomerGroup(
      methodId,
      dto.customerGroupId,
      dto.discountPercent,
      dto.fixedCost,
      dto.metadata,
    );
    return { message: 'Customer group assigned successfully' };
  }

  /**
   * Get customer groups for a shipping method
   * GET /admin/shipping/methods/:methodId/customer-groups
   */
  @Get('methods/:methodId/customer-groups')
  @RequirePermissions('shipping.manage')
  async getMethodCustomerGroups(@Param('methodId') methodId: string) {
    return this.shippingService.getMethodCustomerGroups(methodId);
  }

  /**
   * Update customer group pricing for a shipping method
   * PUT /admin/shipping/methods/:methodId/customer-groups/:customerGroupId
   */
  @Put('methods/:methodId/customer-groups/:customerGroupId')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async updateCustomerGroupPricing(
    @Param('methodId') methodId: string,
    @Param('customerGroupId') customerGroupId: string,
    @Body() dto: UpdateCustomerGroupPricingDto,
  ) {
    await this.shippingService.updateCustomerGroupPricing(
      methodId,
      customerGroupId,
      dto.discountPercent,
      dto.fixedCost,
      dto.metadata,
    );
    return { message: 'Customer group pricing updated successfully' };
  }

  /**
   * Remove customer group from shipping method
   * DELETE /admin/shipping/methods/:methodId/customer-groups/:customerGroupId
   */
  @Delete('methods/:methodId/customer-groups/:customerGroupId')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCustomerGroup(
    @Param('methodId') methodId: string,
    @Param('customerGroupId') customerGroupId: string,
  ) {
    await this.shippingService.removeCustomerGroup(methodId, customerGroupId);
  }
}

