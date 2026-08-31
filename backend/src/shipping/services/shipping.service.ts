import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  ShippingZone,
  ShippingMethod,
  OrderShipping,
  ZoneCoverage,
  ShippingMethodConfig,
  ShippingStatus,
} from '../entities/shipping-zone.entity';
import { CreateZoneDto, UpdateZoneDto } from '../dto/create-zone.dto';
import { CreateMethodDto, UpdateMethodDto } from '../dto/create-method.dto';
import {
  CalculateShippingDto,
  ShippingOptionDto,
  CartItemDto,
} from '../dto/calculate-shipping.dto';
import { AssignShippingDto } from '../dto/assign-shipping.dto';
import { APP_CURRENCY } from '../../common/currency';
import {
  ShippingAssignedEvent,
  ShippingUpdatedEvent,
  OrderShippedEvent,
  OrderDeliveredEvent,
} from '../events/shipping.events';
import { ShippingEligibilityEvaluator } from './shipping-eligibility-evaluator.service';
import { ShippingRateService } from './shipping-rate.service';
import { StoreSettingsService } from '../../store-settings/services/store-settings.service';
import { ZoneConfigService } from './zone-config.service';
import { isKarachiCity, qualifiesForFreeDelivery, roundShippingFee, calculateWeightBasedShippingFee } from '../utils/shipping-fee';
import {
  buildKarachiShippingOption,
  buildNationwideShippingOptions,
} from '../utils/nationwide-shipping.util';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly supportedMethodCodes = new Set([
    'economy_shipping',
    'overland_shipping',
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly eligibilityEvaluator: ShippingEligibilityEvaluator,
    private readonly shippingRateService: ShippingRateService,
    private readonly storeSettingsService: StoreSettingsService,
    private readonly zoneConfigService: ZoneConfigService,
  ) {}

  // ============================================================================
  // ZONE MANAGEMENT
  // ============================================================================

  /**
   * Create a shipping zone
   */
  async createZone(dto: CreateZoneDto): Promise<ShippingZone> {
    const zone = await this.prisma.shippingZone.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        coverage: (dto.coverage || {}) as object,
        priority: dto.priority || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        metadata: dto.metadata || {},
      },
    });

    return this.mapToZoneEntity(zone);
  }

  /**
   * Get all shipping zones
   */
  async getAllZones(includeInactive = false): Promise<ShippingZone[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const zones = await this.prisma.shippingZone.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return zones.map((zone) => this.mapToZoneEntity(zone));
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId: string): Promise<ShippingZone> {
    const zone = await this.prisma.shippingZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new NotFoundException(`Shipping zone with ID ${zoneId} not found`);
    }

    return this.mapToZoneEntity(zone);
  }

  /**
   * Update shipping zone
   */
  async updateZone(zoneId: string, dto: UpdateZoneDto): Promise<ShippingZone> {
    const existingZone = await this.getZoneById(zoneId);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.coverage !== undefined) updateData.coverage = dto.coverage;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    const zone = await this.prisma.shippingZone.update({
      where: { id: zoneId },
      data: updateData,
    });

    return this.mapToZoneEntity(zone);
  }

  /**
   * Delete shipping zone
   */
  async deleteZone(zoneId: string): Promise<void> {
    const zone = await this.getZoneById(zoneId);

    // Check if zone has methods
    const methodsCount = await this.prisma.shippingMethod.count({
      where: { zoneId: zone.id },
    });

    if (methodsCount > 0) {
      throw new BadRequestException(
        `Cannot delete zone with ${methodsCount} shipping methods. Please remove methods first.`,
      );
    }

    await this.prisma.shippingZone.delete({
      where: { id: zoneId },
    });
  }

  // ============================================================================
  // METHOD MANAGEMENT
  // ============================================================================

  /**
   * Create a shipping method
   */
  async createMethod(dto: CreateMethodDto): Promise<ShippingMethod> {
    // Verify zone exists
    await this.getZoneById(dto.zoneId);

    const method = await this.prisma.shippingMethod.create({
      data: {
        zoneId: dto.zoneId,
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        config: (dto.config || {}) as object,
        minOrderAmount: dto.minOrderAmount ?? null,
        maxOrderAmount: dto.maxOrderAmount ?? null,
        minWeight: dto.minWeight ?? null,
        maxWeight: dto.maxWeight ?? null,
        priority: dto.priority || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        courierConfig: dto.courierConfig ?? undefined,
        metadata: dto.metadata || {},
      },
    });

    return this.mapToMethodEntity(method);
  }

  /**
   * Get all shipping methods for a zone
   */
  async getMethodsByZone(
    zoneId: string,
    includeInactive = false,
  ): Promise<ShippingMethod[]> {
    const where: any = {
      zoneId,
    };
    if (!includeInactive) {
      where.isActive = true;
    }

    const methods = await this.prisma.shippingMethod.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return methods.map((method) => this.mapToMethodEntity(method));
  }

  /**
   * Get shipping method by ID
   */
  async getMethodById(methodId: string): Promise<ShippingMethod> {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id: methodId },
      include: {
        zone: true,
        customerGroups: true,
      },
    });

    if (!method) {
      throw new NotFoundException(
        `Shipping method with ID ${methodId} not found`,
      );
    }

    return this.mapToMethodEntity(method);
  }

  /**
   * Update shipping method
   */
  async updateMethod(
    methodId: string,
    dto: UpdateMethodDto,
  ): Promise<ShippingMethod> {
    await this.getMethodById(methodId);

    const updateData: any = {};
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.config !== undefined) updateData.config = dto.config;
    if (dto.minOrderAmount !== undefined)
      updateData.minOrderAmount = dto.minOrderAmount;
    if (dto.maxOrderAmount !== undefined)
      updateData.maxOrderAmount = dto.maxOrderAmount;
    if (dto.minWeight !== undefined) updateData.minWeight = dto.minWeight;
    if (dto.maxWeight !== undefined) updateData.maxWeight = dto.maxWeight;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.courierConfig !== undefined)
      updateData.courierConfig = dto.courierConfig;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    const method = await this.prisma.shippingMethod.update({
      where: { id: methodId },
      data: updateData,
    });

    return this.mapToMethodEntity(method);
  }

  /**
   * Delete shipping method
   */
  async deleteMethod(methodId: string): Promise<void> {
    await this.getMethodById(methodId);

    // Check if method is used in any orders
    const ordersCount = await this.prisma.orderShipping.count({
      where: { shippingMethodId: methodId },
    });

    if (ordersCount > 0) {
      throw new BadRequestException(
        `Cannot delete method used in ${ordersCount} orders.`,
      );
    }

    await this.prisma.shippingMethod.delete({
      where: { id: methodId },
    });
  }

  // ============================================================================
  // CUSTOMER GROUP MANAGEMENT
  // ============================================================================

  /**
   * Assign customer group to shipping method with optional pricing
   */
  async assignCustomerGroup(
    methodId: string,
    customerGroupId: string,
    discountPercent?: number,
    fixedCost?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Verify method exists
    await this.getMethodById(methodId);

    // Verify customer group exists
    const customerGroup = await this.prisma.customerGroup.findUnique({
      where: { id: customerGroupId },
    });

    if (!customerGroup) {
      throw new NotFoundException(
        `Customer group with ID ${customerGroupId} not found`,
      );
    }

    // Check if already assigned
    const existing = await this.prisma.shippingMethodCustomerGroup.findUnique({
      where: {
        shippingMethodId_customerGroupId: {
          shippingMethodId: methodId,
          customerGroupId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Customer group ${customerGroupId} is already assigned to method ${methodId}`,
      );
    }

    await this.prisma.shippingMethodCustomerGroup.create({
      data: {
        shippingMethodId: methodId,
        customerGroupId,
        discountPercent: discountPercent !== undefined ? discountPercent : null,
        fixedCost: fixedCost !== undefined ? fixedCost : null,
        metadata: metadata || {},
      },
    });

    this.logger.log(
      `Assigned customer group ${customerGroupId} to shipping method ${methodId}`,
    );
  }

  /**
   * Remove customer group from shipping method
   */
  async removeCustomerGroup(
    methodId: string,
    customerGroupId: string,
  ): Promise<void> {
    await this.prisma.shippingMethodCustomerGroup.deleteMany({
      where: {
        shippingMethodId: methodId,
        customerGroupId,
      },
    });

    this.logger.log(
      `Removed customer group ${customerGroupId} from shipping method ${methodId}`,
    );
  }

  /**
   * Update customer group pricing for a shipping method
   */
  async updateCustomerGroupPricing(
    methodId: string,
    customerGroupId: string,
    discountPercent?: number,
    fixedCost?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const existing = await this.prisma.shippingMethodCustomerGroup.findUnique({
      where: {
        shippingMethodId_customerGroupId: {
          shippingMethodId: methodId,
          customerGroupId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Customer group ${customerGroupId} is not assigned to method ${methodId}`,
      );
    }

    const updateData: any = {};
    if (discountPercent !== undefined) {
      updateData.discountPercent = discountPercent;
    }
    if (fixedCost !== undefined) {
      updateData.fixedCost = fixedCost;
    }
    if (metadata !== undefined) {
      updateData.metadata = metadata;
    }

    await this.prisma.shippingMethodCustomerGroup.update({
      where: { id: existing.id },
      data: updateData,
    });

    this.logger.log(
      `Updated pricing for customer group ${customerGroupId} on shipping method ${methodId}`,
    );
  }

  /**
   * Get customer groups assigned to a shipping method
   */
  async getMethodCustomerGroups(methodId: string): Promise<any[]> {
    await this.getMethodById(methodId);

    const groups = await this.prisma.shippingMethodCustomerGroup.findMany({
      where: { shippingMethodId: methodId },
      include: {
        customerGroup: true,
      },
    });

    return groups.map((g) => ({
      id: g.id,
      customerGroupId: g.customerGroupId,
      customerGroup: {
        id: g.customerGroup.id,
        name: g.customerGroup.name,
        description: g.customerGroup.description,
      },
      discountPercent: g.discountPercent
        ? parseFloat(g.discountPercent.toString())
        : null,
      fixedCost: g.fixedCost ? parseFloat(g.fixedCost.toString()) : null,
      metadata: g.metadata,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));
  }

  // ============================================================================
  // SHIPPING CALCULATION
  // ============================================================================

  /**
   * Calculate shipping options for a cart.
   * Karachi → Standard Delivery (≤7kg 200 PKR, else 250). Other cities → Economy & Overland.
   * Free delivery when subtotal meets storeSettings.freeDeliveryThreshold (default 2000).
   */
  async calculateShipping(
    dto: CalculateShippingDto,
  ): Promise<ShippingOptionDto[]> {
    const {
      shippingAddress,
      items,
      subtotal = 0,
      currency = APP_CURRENCY,
    } = dto;

    const totalWeight = await this.shippingRateService.resolveTotalWeightKg(
      undefined,
      items,
    );

    const totalAmount =
      subtotal ||
      items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const cityName = await this.resolveShippingCityName(
      dto.cityId,
      shippingAddress.city,
    );

    if (isKarachiCity(cityName)) {
      const karachiOption = buildKarachiShippingOption(totalWeight, currency);
      return this.applyFreeDeliveryToOptions([karachiOption], totalAmount);
    }

    const zoneConfig = await this.zoneConfigService.getZoneConfig();
    const options = buildNationwideShippingOptions(
      totalWeight,
      zoneConfig,
      currency,
    );
    return this.applyFreeDeliveryToOptions(options, totalAmount);
  }

  private async resolveShippingCityName(
    cityId?: string,
    cityName?: string,
  ): Promise<string> {
    const id = cityId?.trim();
    if (id) {
      const activeCity = await this.prisma.courierCity.findFirst({
        where: { id, isActive: true },
        select: { name: true },
      });
      if (!activeCity) {
        throw new BadRequestException('Selected city is not available.');
      }
      return activeCity.name;
    }
    return cityName?.trim() ?? '';
  }

  /**
   * When cart subtotal meets the free-delivery threshold, keep originalCost
   * and set effectivePrice/isFreeShipping on each option (weight is ignored).
   * Pass thresholdOverride for city-specific rules (e.g. Karachi Rs. 3,000).
   */
  private async applyFreeDeliveryToOptions(
    options: ShippingOptionDto[],
    subtotal: number,
    thresholdOverride?: number,
  ): Promise<ShippingOptionDto[]> {
    let freeDeliveryThreshold = thresholdOverride ?? 0;
    if (thresholdOverride == null) {
      try {
        const settings =
          await this.storeSettingsService.getPublicOrderSettings();
        freeDeliveryThreshold = settings.freeDeliveryThreshold ?? 0;
      } catch (err) {
        this.logger.warn(
          `Could not load free delivery threshold: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const qualifies = qualifiesForFreeDelivery({
      subtotal,
      freeDeliveryThreshold,
    });

    return options.map((opt) => {
      const originalCost = roundShippingFee(opt.cost);
      if (!qualifies) {
        return {
          ...opt,
          cost: originalCost,
          originalCost,
          effectivePrice: originalCost,
          isFreeShipping: false,
        };
      }
      return {
        ...opt,
        originalCost,
        effectivePrice: 0,
        isFreeShipping: true,
        cost: 0,
      };
    });
  }

  /**
   * Find matching zones for an address
   */
  private async findMatchingZones(address: {
    country?: string;
    region?: string;
    city?: string;
  }): Promise<ShippingZone[]> {
    const zones = await this.prisma.shippingZone.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    const matchingZones: ShippingZone[] = [];

    for (const zone of zones) {
      const coverage = zone.coverage as ZoneCoverage;

      let matches = false;

      // Check country match
      if (address.country && coverage.countries) {
        if (coverage.countries.includes(address.country)) {
          matches = true;
        }
      }

      // Check region match
      if (address.region && coverage.regions) {
        if (coverage.regions.includes(address.region)) {
          matches = true;
        }
      }

      // Check city match
      if (address.city && coverage.cities) {
        if (coverage.cities.includes(address.city)) {
          matches = true;
        }
      }

      // If no specific coverage, zone applies to all (empty coverage = default zone)
      if (
        !coverage.countries?.length &&
        !coverage.regions?.length &&
        !coverage.cities?.length
      ) {
        matches = true;
      }

      if (matches) {
        matchingZones.push(this.mapToZoneEntity(zone));
      }
    }

    return matchingZones;
  }

  /**
   * Check if a method is eligible based on constraints
   * @deprecated Use ShippingEligibilityEvaluator instead
   * Kept for backward compatibility
   */
  private isMethodEligible(
    method: any,
    orderAmount: number,
    orderWeight: number,
  ): boolean {
    // Check order amount constraints
    if (method.minOrderAmount) {
      const minAmount = parseFloat(method.minOrderAmount.toString());
      if (orderAmount < minAmount) {
        return false;
      }
    }

    if (method.maxOrderAmount) {
      const maxAmount = parseFloat(method.maxOrderAmount.toString());
      if (orderAmount > maxAmount) {
        return false;
      }
    }

    // Check weight constraints
    if (method.minWeight) {
      const minWeight = parseFloat(method.minWeight.toString());
      if (orderWeight < minWeight) {
        return false;
      }
    }

    if (method.maxWeight) {
      const maxWeight = parseFloat(method.maxWeight.toString());
      if (orderWeight > maxWeight) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate shipping cost based on method type
   */
  private parseShippingAmount(value: unknown): number {
    const amount =
      typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(amount) ? amount : 0;
  }

  private calculateCost(
    method: any,
    orderAmount: number,
    orderWeight: number,
    items: CartItemDto[],
  ): number {
    const config = method.config as ShippingMethodConfig;

    switch (method.type) {
      case 'flat_rate':
        return this.parseShippingAmount(config.cost);

      case 'weight_based':
        return calculateWeightBasedShippingFee(
          orderWeight,
          config,
          method.code,
        );

      case 'amount_based':
        if (
          config.freeAbove != null &&
          orderAmount >= this.parseShippingAmount(config.freeAbove)
        ) {
          return 0;
        }
        return this.parseShippingAmount(config.costBelow);

      case 'courier_api':
        // For courier API, return a default cost or 0
        // Actual cost should be calculated via courier service
        return this.parseShippingAmount(config.cost);

      default:
        return 0;
    }
  }

  // ============================================================================
  // ORDER SHIPPING ASSIGNMENT
  // ============================================================================

  /**
   * Assign shipping method to order
   */
  async assignShippingToOrder(
    orderId: string,
    dto: AssignShippingDto,
  ): Promise<OrderShipping> {
    // Verify order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check if shipping already assigned
    const existingShipping = await this.prisma.orderShipping.findUnique({
      where: { orderId },
    });

    if (existingShipping) {
      throw new BadRequestException(
        `Shipping already assigned to order ${orderId}`,
      );
    }

    // Get shipping method
    const method = await this.getMethodById(dto.shippingMethodId);

    // Calculate shipping cost
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const cartItems: CartItemDto[] = items.map((item) => ({
      variantId: item.variantId || '',
      quantity: item.quantity,
      price: parseFloat(item.unitPrice.toString()),
      weight: 0, // Weight should be fetched from product/variant if needed
    }));

    const subtotal = parseFloat(order.subtotal.toString());
    const shippingCost = this.calculateCost(
      method,
      subtotal,
      0, // Total weight would need to be calculated from items
      cartItems,
    );

    // Create order shipping record
    const orderShipping = await this.prisma.orderShipping.create({
      data: {
        orderId,
        shippingMethodId: dto.shippingMethodId,
        cost: shippingCost,
        currency: order.currency,
        status: 'pending',
        shippingAddress: order.shippingAddress as any,
        courierCode: method.code,
        courierName: method.name,
        metadata: {},
      },
    });

    // Update order shipping total
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        shippingTotal: shippingCost,
        grandTotal:
          parseFloat(order.subtotal.toString()) +
          parseFloat(order.discountTotal.toString()) +
          shippingCost +
          parseFloat(order.taxTotal.toString()),
      },
    });

    // Emit event
    this.eventEmitter.emit(
      'shipping.assigned',
      new ShippingAssignedEvent(
        orderId,
        orderShipping.id,
        dto.shippingMethodId,
      ),
    );

    this.logger.log(
      `Shipping assigned to order ${orderId}: method ${dto.shippingMethodId}, cost ${shippingCost}`,
    );

    return this.mapToOrderShippingEntity(orderShipping);
  }

  /**
   * Get order shipping by order ID
   */
  async getOrderShipping(orderId: string): Promise<OrderShipping> {
    const orderShipping = await this.prisma.orderShipping.findUnique({
      where: { orderId },
      include: {
        shippingMethod: true,
        order: true,
      },
    });

    if (!orderShipping) {
      throw new NotFoundException(`Shipping not found for order ${orderId}`);
    }

    return this.mapToOrderShippingEntity(orderShipping);
  }

  async getOrderShippingAuthorized(
    orderId: string,
    actor?: { typ: 'admin' | 'customer'; customerId?: string },
  ): Promise<OrderShipping> {
    if (!actor) {
      throw new ForbiddenException('Authentication required');
    }
    if (actor.typ === 'customer') {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true },
      });
      if (!order || order.customerId !== actor.customerId) {
        throw new ForbiddenException(
          'You do not have access to this order shipping',
        );
      }
    }
    return this.getOrderShipping(orderId);
  }

  /**
   * Update shipping status
   */
  async updateShippingStatus(
    orderId: string,
    status: ShippingStatus,
    trackingNumber?: string,
    trackingUrl?: string,
  ): Promise<OrderShipping> {
    const orderShipping = await this.prisma.orderShipping.findUnique({
      where: { orderId },
    });

    if (!orderShipping) {
      throw new NotFoundException(`Shipping not found for order ${orderId}`);
    }

    const updateData: any = {
      status,
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (trackingUrl) {
      updateData.trackingUrl = trackingUrl;
    }

    // Set timestamps based on status
    const now = new Date();
    if (status === 'shipped' || status === 'in_transit') {
      if (!orderShipping.shippedAt) {
        updateData.shippedAt = now;
      }
    }

    if (status === 'delivered') {
      updateData.deliveredAt = now;
      if (!orderShipping.shippedAt) {
        updateData.shippedAt = now;
      }
    }

    if (status === 'cancelled') {
      updateData.cancelledAt = now;
    }

    const updated = await this.prisma.orderShipping.update({
      where: { orderId },
      data: updateData,
    });

    // Emit events
    this.eventEmitter.emit(
      'shipping.updated',
      new ShippingUpdatedEvent(orderId, updated.id, status),
    );

    if (status === 'shipped') {
      this.eventEmitter.emit(
        'order.shipped',
        new OrderShippedEvent(orderId, trackingNumber || undefined),
      );
    }

    if (status === 'delivered') {
      this.eventEmitter.emit(
        'order.delivered',
        new OrderDeliveredEvent(orderId, trackingNumber || undefined),
      );
    }

    this.logger.log(`Shipping status updated for order ${orderId}: ${status}`);

    return this.mapToOrderShippingEntity(updated);
  }

  // ============================================================================
  // MAPPER METHODS
  // ============================================================================

  private mapToZoneEntity(zone: any): ShippingZone {
    return {
      id: zone.id,
      name: zone.name,
      description: zone.description,
      coverage: zone.coverage as ZoneCoverage,
      priority: zone.priority,
      isActive: zone.isActive,
      metadata: zone.metadata,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt,
    };
  }

  private mapToMethodEntity(method: any): ShippingMethod {
    return {
      id: method.id,
      zoneId: method.zoneId,
      code: method.code,
      name: method.name,
      description: method.description,
      type: method.type,
      config: method.config as ShippingMethodConfig,
      minOrderAmount: method.minOrderAmount
        ? parseFloat(method.minOrderAmount.toString())
        : null,
      maxOrderAmount: method.maxOrderAmount
        ? parseFloat(method.maxOrderAmount.toString())
        : null,
      minWeight: method.minWeight
        ? parseFloat(method.minWeight.toString())
        : null,
      maxWeight: method.maxWeight
        ? parseFloat(method.maxWeight.toString())
        : null,
      priority: method.priority,
      isActive: method.isActive,
      courierConfig: method.courierConfig || null,
      metadata: method.metadata,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
      customerGroups: method.customerGroups
        ? method.customerGroups.map((cg: any) => ({
            id: cg.id,
            shippingMethodId: cg.shippingMethodId,
            customerGroupId: cg.customerGroupId,
            discountPercent: cg.discountPercent
              ? parseFloat(cg.discountPercent.toString())
              : null,
            fixedCost: cg.fixedCost
              ? parseFloat(cg.fixedCost.toString())
              : null,
            metadata: cg.metadata,
            createdAt: cg.createdAt,
            updatedAt: cg.updatedAt,
          }))
        : undefined,
    };
  }

  private mapToOrderShippingEntity(shipping: any): OrderShipping {
    return {
      id: shipping.id,
      orderId: shipping.orderId,
      shippingMethodId: shipping.shippingMethodId,
      cost: parseFloat(shipping.cost.toString()),
      currency: shipping.currency,
      status: shipping.status as ShippingStatus,
      trackingNumber: shipping.trackingNumber,
      trackingUrl: shipping.trackingUrl,
      courierCode: shipping.courierCode,
      courierName: shipping.courierName,
      shippedAt: shipping.shippedAt,
      deliveredAt: shipping.deliveredAt,
      cancelledAt: shipping.cancelledAt,
      shippingAddress: shipping.shippingAddress,
      metadata: shipping.metadata,
      createdAt: shipping.createdAt,
      updatedAt: shipping.updatedAt,
    };
  }
}
