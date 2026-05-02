export interface Tax {
  id: string;
  taxClassId: string;
  country: string; // ISO 3166-1 alpha-2
  region: string | null;
  rate: number; // Decimal percentage (e.g., 20.0000 for 20%)
  isInclusive: boolean; // true = tax included in price, false = tax added
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

