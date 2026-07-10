export class CartCreatedEvent {
  constructor(public readonly cartId: string) {}
}

export class CartItemAddedEvent {
  constructor(
    public readonly cartId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly reservationId: string,
  ) {}
}

export class CartItemRemovedEvent {
  constructor(
    public readonly cartId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly reservationId: string,
  ) {}
}

// Note: CartExpiredEvent is also defined in inventory.events.ts
// We keep it here for cart module's internal use, but the inventory module
// will handle the actual event when it's emitted
export class CartExpiredEvent {
  constructor(public readonly cartId: string) {}
}
