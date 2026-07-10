import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PromotionAppliedEvent,
  PromotionExpiredEvent,
  CouponUsedEvent,
} from './promotion.events';

@Injectable()
export class PromotionEventHandlers {
  private readonly logger = new Logger(PromotionEventHandlers.name);

  @OnEvent('promotion.applied')
  handlePromotionApplied(event: PromotionAppliedEvent) {
    this.logger.log(
      `Promotion applied: ${event.promotionId} (${event.promotionCode || 'N/A'}) - Discount: ${event.discountAmount}`,
    );
  }

  @OnEvent('promotion.expired')
  handlePromotionExpired(event: PromotionExpiredEvent) {
    this.logger.log(
      `Promotion expired: ${event.promotionId} (${event.promotionCode || 'N/A'})`,
    );
  }

  @OnEvent('coupon.used')
  handleCouponUsed(event: CouponUsedEvent) {
    this.logger.log(
      `Coupon used: ${event.couponCode} (Promotion: ${event.promotionId}) - Discount: ${event.discountAmount}`,
    );
  }
}
