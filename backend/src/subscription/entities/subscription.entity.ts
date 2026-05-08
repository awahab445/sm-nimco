import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface SubscriptionEntity {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  canceledAt: Date | null;
}
