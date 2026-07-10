export class CheckoutStartedEvent {
  constructor(
    public readonly checkoutId: string,
    public readonly cartId: string,
  ) {}
}

export class CheckoutUpdatedEvent {
  constructor(public readonly checkoutId: string) {}
}

export class CheckoutCompletedEvent {
  constructor(
    public readonly checkoutId: string,
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly paymentIntentId: string,
  ) {}
}

export class CheckoutExpiredEvent {
  constructor(public readonly checkoutId: string) {}
}

export class CheckoutCancelledEvent {
  constructor(
    public readonly checkoutId: string,
    public readonly reason?: string,
  ) {}
}

// Payment events that checkout listens to
export class PaymentIntentCreatedEvent {
  constructor(
    public readonly paymentIntentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {}
}
