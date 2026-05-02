export class ProductCreatedEvent {
  constructor(public readonly productId: string) {}
}

export class ProductUpdatedEvent {
  constructor(public readonly productId: string) {}
}

export class ProductDeletedEvent {
  constructor(public readonly productId: string) {}
}

export class ProductStatusChangedEvent {
  constructor(
    public readonly productId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {}
}

