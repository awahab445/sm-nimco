import { Injectable, Logger } from '@nestjs/common';
import type { CheckoutSession } from './checkout.redis';

/**
 * In-memory checkout session storage for development when Redis is not available.
 * Set REDIS_ENABLED=false in .env to use this instead of Redis.
 * Data is lost on process restart.
 */
@Injectable()
export class InMemoryCheckoutService {
  private readonly logger = new Logger(InMemoryCheckoutService.name);
  private readonly store = new Map<string, CheckoutSession>();

  constructor() {
    this.logger.log('Using in-memory checkout storage (REDIS_ENABLED=false). Data is lost on restart.');
  }

  async getCheckout(checkoutId: string): Promise<CheckoutSession | null> {
    return this.store.get(checkoutId) ?? null;
  }

  async createCheckout(
    checkoutId: string,
    session: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>,
  ): Promise<CheckoutSession> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const checkout: CheckoutSession = {
      ...session,
      id: checkoutId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    this.store.set(checkoutId, checkout);
    return checkout;
  }

  async updateCheckout(checkout: CheckoutSession): Promise<void> {
    checkout.updatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    checkout.expiresAt = expiresAt.toISOString();
    this.store.set(checkout.id, checkout);
  }

  async deleteCheckout(checkoutId: string): Promise<void> {
    this.store.delete(checkoutId);
  }

  async checkoutExists(checkoutId: string): Promise<boolean> {
    return this.store.has(checkoutId);
  }

  async extendCheckoutTTL(_checkoutId: string): Promise<void> {
    // No-op for in-memory
  }
}
