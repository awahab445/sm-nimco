import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../catalog/services/prisma.service';
import { ShippingMethod } from '../entities/shipping-zone.entity';

export interface CourierProvider {
  code: string;
  name: string;
  calculateCost(params: CalculateCostParams): Promise<number>;
  createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult>;
  trackShipment(trackingNumber: string, config: any): Promise<TrackingResult>;
}

export interface CalculateCostParams {
  origin: Address;
  destination: Address;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  config: any;
}

export interface CreateShipmentParams {
  orderId: string;
  origin: Address;
  destination: Address;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  items: Array<{
    description: string;
    quantity: number;
    value: number;
  }>;
  config: any;
}

export interface CreateShipmentResult {
  trackingNumber: string;
  trackingUrl?: string;
  labelUrl?: string;
  cost: number;
  estimatedDelivery?: Date;
  metadata?: Record<string, any>;
}

export interface TrackingResult {
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  currentLocation?: string;
  estimatedDelivery?: Date;
  events: Array<{
    status: string;
    location?: string;
    timestamp: Date;
    description?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface Address {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

@Injectable()
export class CourierService {
  private readonly logger = new Logger(CourierService.name);
  private readonly providers: Map<string, CourierProvider> = new Map();

  constructor(private readonly prisma: PrismaService) {
    // Register built-in providers
    this.registerProvider(new TcsProvider());
    this.registerProvider(new LeopardsProvider());
  }

  /**
   * Register a courier provider
   */
  registerProvider(provider: CourierProvider): void {
    this.providers.set(provider.code.toLowerCase(), provider);
    this.logger.log(`Registered courier provider: ${provider.name} (${provider.code})`);
  }

  /**
   * Get provider by code
   */
  getProvider(code: string): CourierProvider | null {
    return this.providers.get(code.toLowerCase()) || null;
  }

  /**
   * Calculate shipping cost via courier API
   */
  async calculateCost(
    method: ShippingMethod,
    params: Omit<CalculateCostParams, 'config'>,
  ): Promise<number> {
    if (method.type !== 'courier_api') {
      throw new BadRequestException(
        `Method ${method.code} is not a courier API method`,
      );
    }

    const provider = this.getProvider(method.code);
    if (!provider) {
      this.logger.warn(
        `Courier provider ${method.code} not found, using default cost from config`,
      );
      return (method.config as any)?.cost || 0;
    }

    try {
      const cost = await provider.calculateCost({
        ...params,
        config: method.courierConfig || {},
      });
      return cost;
    } catch (error) {
      this.logger.error(
        `Failed to calculate cost via ${method.code}:`,
        error,
      );
      // Fallback to config cost
      return (method.config as any)?.cost || 0;
    }
  }

  /**
   * Create shipment via courier API
   */
  async createShipment(
    orderId: string,
    method: ShippingMethod,
    params: Omit<CreateShipmentParams, 'config' | 'orderId'>,
  ): Promise<CreateShipmentResult> {
    if (method.type !== 'courier_api') {
      throw new BadRequestException(
        `Method ${method.code} is not a courier API method`,
      );
    }

    const provider = this.getProvider(method.code);
    if (!provider) {
      throw new BadRequestException(
        `Courier provider ${method.code} not found`,
      );
    }

    try {
      const result = await provider.createShipment({
        ...params,
        orderId,
        config: method.courierConfig || {},
      });

      this.logger.log(
        `Shipment created for order ${orderId} via ${method.code}: ${result.trackingNumber}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create shipment via ${method.code} for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(
    trackingNumber: string,
    courierCode: string,
    config?: any,
  ): Promise<TrackingResult> {
    const provider = this.getProvider(courierCode);
    if (!provider) {
      throw new BadRequestException(
        `Courier provider ${courierCode} not found`,
      );
    }

    try {
      return await provider.trackShipment(trackingNumber, config || {});
    } catch (error) {
      this.logger.error(
        `Failed to track shipment ${trackingNumber} via ${courierCode}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): Array<{ code: string; name: string }> {
    return Array.from(this.providers.values()).map((p) => ({
      code: p.code,
      name: p.name,
    }));
  }
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

/**
 * TCS (Tranzum Courier Service) Provider
 * Placeholder implementation - should be replaced with actual API integration
 */
class TcsProvider implements CourierProvider {
  code = 'tcs';
  name = 'TCS (Tranzum Courier Service)';

  async calculateCost(params: CalculateCostParams): Promise<number> {
    // Placeholder: Implement actual TCS API call
    // This would make an HTTP request to TCS API
    const { weight, config } = params;
    const baseCost = config.baseCost || 200;
    const costPerKg = config.costPerKg || 50;
    return baseCost + weight * costPerKg;
  }

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    // Placeholder: Implement actual TCS API call
    // This would make an HTTP request to TCS API to create shipment
    const trackingNumber = `TCS${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      trackingNumber,
      trackingUrl: `https://tcs.com.pk/track/${trackingNumber}`,
      cost: await this.calculateCost({
        origin: params.origin,
        destination: params.destination,
        weight: params.weight,
        dimensions: params.dimensions,
        config: params.config,
      }),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    };
  }

  async trackShipment(trackingNumber: string, config: any): Promise<TrackingResult> {
    // Placeholder: Implement actual TCS API call
    // This would make an HTTP request to TCS API to get tracking info
    return {
      status: 'in_transit',
      currentLocation: 'Karachi Hub',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      events: [
        {
          status: 'picked_up',
          location: 'Lahore',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: 'Shipment picked up',
        },
        {
          status: 'in_transit',
          location: 'Karachi Hub',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: 'In transit',
        },
      ],
    };
  }
}

/**
 * Leopards Courier Provider
 * Placeholder implementation - should be replaced with actual API integration
 */
class LeopardsProvider implements CourierProvider {
  code = 'leopards';
  name = 'Leopards Courier';

  async calculateCost(params: CalculateCostParams): Promise<number> {
    // Placeholder: Implement actual Leopards API call
    const { weight, config } = params;
    const baseCost = config.baseCost || 150;
    const costPerKg = config.costPerKg || 40;
    return baseCost + weight * costPerKg;
  }

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    // Placeholder: Implement actual Leopards API call
    const trackingNumber = `LEO${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      trackingNumber,
      trackingUrl: `https://leopards.com.pk/track/${trackingNumber}`,
      cost: await this.calculateCost({
        origin: params.origin,
        destination: params.destination,
        weight: params.weight,
        dimensions: params.dimensions,
        config: params.config,
      }),
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
    };
  }

  async trackShipment(trackingNumber: string, config: any): Promise<TrackingResult> {
    // Placeholder: Implement actual Leopards API call
    return {
      status: 'in_transit',
      currentLocation: 'Lahore Hub',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      events: [
        {
          status: 'picked_up',
          location: 'Karachi',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: 'Shipment picked up',
        },
        {
          status: 'in_transit',
          location: 'Lahore Hub',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: 'In transit',
        },
      ],
    };
  }
}

