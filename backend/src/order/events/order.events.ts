export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string | null,
    public readonly items: Array<{
      variantId: string;
      quantity: number;
      reservationId?: string;
    }>,
  ) {}
}

export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly paymentId?: string,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly reason?: string,
  ) {}
}

// External events that order module listens to
export class PaymentCapturedEvent {
  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amount: number,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly reason?: string,
  ) {}
}
