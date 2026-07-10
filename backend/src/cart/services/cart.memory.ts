import { Injectable, Logger } from '@nestjs/common';
import type { Cart } from './cart.redis';
import { APP_CURRENCY } from '../../common/currency';

/**
 * In-memory cart storage for development when Redis is not available.
 * Set REDIS_ENABLED=false in .env to use this instead of Redis.
 * Data is lost on process restart.
 */
@Injectable()
export class InMemoryCartService {
  private readonly logger = new Logger(InMemoryCartService.name);
  private readonly store = new Map<string, Cart>();

  constructor() {
    this.logger.log(
      'Using in-memory cart storage (REDIS_ENABLED=false). Data is lost on restart.',
    );
  }

  async getCart(cartId: string): Promise<Cart | null> {
    return this.store.get(cartId) ?? null;
  }

  async createCart(
    cartId: string,
    currency: string = APP_CURRENCY,
  ): Promise<Cart> {
    const cart: Cart = {
      id: cartId,
      items: [],
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(cartId, cart);
    return cart;
  }

  async updateCart(cart: Cart): Promise<void> {
    cart.updatedAt = new Date().toISOString();
    this.store.set(cart.id, cart);
  }

  async deleteCart(cartId: string): Promise<void> {
    this.store.delete(cartId);
  }

  async cartExists(cartId: string): Promise<boolean> {
    return this.store.has(cartId);
  }

  async extendCartTTL(_cartId: string): Promise<void> {
    // No-op for in-memory; data lives until process exits or deleteCart
  }
}
