export class StockReservedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly referenceType: string,
    public readonly referenceId: string,
  ) {}
}

export class StockReleasedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly referenceType: string,
    public readonly referenceId: string,
  ) {}
}

export class StockConsumedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly referenceType: string,
    public readonly referenceId: string,
  ) {}
}

export class StockAdjustedEvent {
  constructor(
    public readonly inventoryItemId: string,
    public readonly variantId: string,
    public readonly previousQuantity: number,
    public readonly newQuantity: number,
    public readonly reason?: string,
  ) {}
}

// External events that inventory listens to
export class CartExpiredEvent {
  constructor(public readonly cartId: string) {}
}

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly items: Array<{
      variantId: string;
      quantity: number;
      reservationId?: string;
    }>,
  ) {}
}
