import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface CheckoutAddress {
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutShippingMethod {
  methodId: string;
  methodName: string;
  cost: number;
  currency: string;
  estimatedDays: number;
}

export interface CheckoutItem {
  variantId: string;
  productId: string;
  quantity: number;
  price: number;
  currency: string;
  attributes: Record<string, any>;
  reservationId: string;
}

export interface CheckoutSession {
  id: string;
  cartId: string;
  items: CheckoutItem[];
  currency: string;
  billingAddress?: CheckoutAddress;
  shippingAddress?: CheckoutAddress;
  shippingMethod?: CheckoutShippingMethod;
  customerEmail?: string;
  customerName?: string;
  customerId?: string;
  customerGroupId?: string;
  couponCode?: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

@Injectable()
export class CheckoutRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CheckoutRedisService.name);
  private readonly client: Redis;
  private readonly CHECKOUT_TTL_SECONDS = 30 * 60; // 30 minutes

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD;

    this.client = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.logger.log('Redis connection verified');
    } catch (error) {
      this.logger.error('Failed to verify Redis connection:', error);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Get checkout session by ID
   */
  async getCheckout(checkoutId: string): Promise<CheckoutSession | null> {
    try {
      const key = `checkout:${checkoutId}`;
      const data = await this.client.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as CheckoutSession;
    } catch (error) {
      this.logger.error(`Failed to get checkout ${checkoutId}:`, error);
      throw new Error(`Failed to retrieve checkout: ${error.message}`);
    }
  }

  /**
   * Create a new checkout session
   */
  async createCheckout(checkoutId: string, session: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>): Promise<CheckoutSession> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CHECKOUT_TTL_SECONDS * 1000);

      const checkout: CheckoutSession = {
        ...session,
        id: checkoutId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const key = `checkout:${checkoutId}`;
      await this.client.setex(key, this.CHECKOUT_TTL_SECONDS, JSON.stringify(checkout));

      return checkout;
    } catch (error) {
      this.logger.error(`Failed to create checkout ${checkoutId}:`, error);
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  /**
   * Update checkout session (extends TTL)
   */
  async updateCheckout(checkout: CheckoutSession): Promise<void> {
    try {
      const key = `checkout:${checkout.id}`;
      checkout.updatedAt = new Date().toISOString();
      
      // Extend TTL on update
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CHECKOUT_TTL_SECONDS * 1000);
      checkout.expiresAt = expiresAt.toISOString();

      await this.client.setex(key, this.CHECKOUT_TTL_SECONDS, JSON.stringify(checkout));
    } catch (error) {
      this.logger.error(`Failed to update checkout ${checkout.id}:`, error);
      throw new Error(`Failed to update checkout: ${error.message}`);
    }
  }

  /**
   * Delete checkout session
   */
  async deleteCheckout(checkoutId: string): Promise<void> {
    try {
      const key = `checkout:${checkoutId}`;
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete checkout ${checkoutId}:`, error);
      throw new Error(`Failed to delete checkout: ${error.message}`);
    }
  }

  /**
   * Check if checkout exists
   */
  async checkoutExists(checkoutId: string): Promise<boolean> {
    try {
      const key = `checkout:${checkoutId}`;
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check checkout existence ${checkoutId}:`, error);
      return false;
    }
  }

  /**
   * Extend checkout TTL
   */
  async extendCheckoutTTL(checkoutId: string): Promise<void> {
    try {
      const key = `checkout:${checkoutId}`;
      await this.client.expire(key, this.CHECKOUT_TTL_SECONDS);
    } catch (error) {
      this.logger.error(`Failed to extend TTL for checkout ${checkoutId}:`, error);
      // Don't throw - TTL extension failure shouldn't break the operation
    }
  }
}

