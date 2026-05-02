export class ShippingAssignedEvent {
  constructor(
    public readonly orderId: string,
    public readonly shippingId: string,
    public readonly shippingMethodId: string,
  ) {}
}

export class ShippingUpdatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly shippingId: string,
    public readonly status: string,
  ) {}
}

export class OrderShippedEvent {
  constructor(
    public readonly orderId: string,
    public readonly trackingNumber?: string,
  ) {}
}

export class OrderDeliveredEvent {
  constructor(
    public readonly orderId: string,
    public readonly trackingNumber?: string,
  ) {}
}

