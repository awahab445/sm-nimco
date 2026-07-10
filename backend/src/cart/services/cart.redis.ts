import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import { APP_CURRENCY } from '../../common/currency';

export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  price: number;
  currency: string;
  attributes: Record<string, any>;
  reservationId: string;
  addedAt: string;
  bundleGroupId?: string;
  bundleDealId?: string;
  listPrice?: number;
  isBundleComponent?: boolean;
}

export interface CartBundleGroup {
  bundleDealId: string;
  title: string;
  slug: string;
  quantity: number;
  dealUnitPrice: number;
  compareAtTotal: number;
  savingsAmount: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  currency: string;
  createdAt: string;
  updatedAt: string;
  bundleGroups?: Record<string, CartBundleGroup>;
}

@Injectable()
export class CartRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CartRedisService.name);
  private readonly client: Redis;
  private readonly CART_TTL_SECONDS = 30 * 60; // 30 minutes

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
    // Connection is already established in constructor
    // But we can verify it here
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
   * Get cart by ID
   */
  async getCart(cartId: string): Promise<Cart | null> {
    try {
      const key = `cart:${cartId}`;
      const data = await this.client.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as Cart;
    } catch (error) {
      this.logger.error(`Failed to get cart ${cartId}:`, error);
      throw new Error(`Failed to retrieve cart: ${error.message}`);
    }
  }

  /**
   * Create a new cart
   */
  async createCart(
    cartId: string,
    currency: string = APP_CURRENCY,
  ): Promise<Cart> {
    try {
      const cart: Cart = {
        id: cartId,
        items: [],
        currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const key = `cart:${cartId}`;
      await this.client.setex(key, this.CART_TTL_SECONDS, JSON.stringify(cart));

      return cart;
    } catch (error) {
      this.logger.error(`Failed to create cart ${cartId}:`, error);
      throw new Error(`Failed to create cart: ${error.message}`);
    }
  }

  /**
   * Update cart (extends TTL)
   */
  async updateCart(cart: Cart): Promise<void> {
    try {
      const key = `cart:${cart.id}`;
      cart.updatedAt = new Date().toISOString();
      await this.client.setex(key, this.CART_TTL_SECONDS, JSON.stringify(cart));
    } catch (error) {
      this.logger.error(`Failed to update cart ${cart.id}:`, error);
      throw new Error(`Failed to update cart: ${error.message}`);
    }
  }

  /**
   * Delete cart
   */
  async deleteCart(cartId: string): Promise<void> {
    try {
      const key = `cart:${cartId}`;
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cart ${cartId}:`, error);
      throw new Error(`Failed to delete cart: ${error.message}`);
    }
  }

  /**
   * Check if cart exists
   */
  async cartExists(cartId: string): Promise<boolean> {
    try {
      const key = `cart:${cartId}`;
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check cart existence ${cartId}:`, error);
      return false;
    }
  }

  /**
   * Extend cart TTL
   */
  async extendCartTTL(cartId: string): Promise<void> {
    try {
      const key = `cart:${cartId}`;
      await this.client.expire(key, this.CART_TTL_SECONDS);
    } catch (error) {
      this.logger.error(`Failed to extend TTL for cart ${cartId}:`, error);
      // Don't throw - TTL extension failure shouldn't break the operation
    }
  }
}
