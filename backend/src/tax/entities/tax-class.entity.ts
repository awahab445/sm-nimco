export interface TaxClass {
  id: string;
  code: string; // standard | reduced | exempt
  name: string;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tax {
  id: string;
  taxClassId: string;
  country: string;
  region: string | null;
  rate: number;
  isInclusive: boolean;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

