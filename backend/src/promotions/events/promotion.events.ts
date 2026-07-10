export class PromotionAppliedEvent {
  constructor(
    public readonly promotionId: string,
    public readonly promotionCode: string | null,
    public readonly discountAmount: number,
    public readonly subtotalBefore: number,
    public readonly subtotalAfter: number,
    public readonly cartId?: string,
    public readonly checkoutId?: string,
    public readonly orderId?: string,
    public readonly customerId?: string,
  ) {}
}

export class PromotionExpiredEvent {
  constructor(
    public readonly promotionId: string,
    public readonly promotionCode: string | null,
  ) {}
}

export class CouponUsedEvent {
  constructor(
    public readonly promotionId: string,
    public readonly couponCode: string,
    public readonly discountAmount: number,
    public readonly cartId?: string,
    public readonly checkoutId?: string,
    public readonly orderId?: string,
    public readonly customerId?: string,
  ) {}
}
