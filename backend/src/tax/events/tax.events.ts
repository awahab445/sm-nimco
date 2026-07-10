import { TaxCalculationResult } from '../dto/calculate-tax.dto';

export class TaxCalculatedEvent {
  constructor(
    public readonly context: {
      cartId?: string;
      checkoutId?: string;
      orderId?: string;
      country: string;
      region?: string;
    },
    public readonly calculation: TaxCalculationResult,
  ) {}
}

export class TaxUpdatedEvent {
  constructor(
    public readonly taxId: string,
    public readonly taxClassId: string,
    public readonly changes: {
      rate?: number;
      isActive?: boolean;
      startDate?: Date | null;
      endDate?: Date | null;
    },
  ) {}
}
