export interface TaxCalculationItem {
  productId: string;
  variantId?: string;
  taxClassId: string | null;
  price: number;
  quantity: number;
}

export interface TaxCalculationContext {
  country: string;
  region?: string;
  currency?: string;
}

export interface CalculatedTax {
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
}

export interface TaxCalculationResult {
  items: Array<{
    productId: string;
    variantId?: string;
    taxClassId: string | null;
    price: number;
    quantity: number;
    taxableAmount: number;
    taxAmount: number;
    appliedTaxes: CalculatedTax[];
  }>;
  taxes: CalculatedTax[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
}
