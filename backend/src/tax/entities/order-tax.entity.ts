export interface OrderTax {
  id: string;
  orderId: string;
  taxId: string;
  taxClassId: string;
  taxClassCode: string;
  taxClassName: string;
  country: string;
  region: string | null;
  rate: number;
  isInclusive: boolean;
  taxableAmount: number;
  taxAmount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
