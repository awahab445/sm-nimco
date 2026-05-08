import { BillingCycle } from '../enums/billing-cycle.enum';

export interface SubscriptionPlanEntity {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  billingCycle: BillingCycle;
  features: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
