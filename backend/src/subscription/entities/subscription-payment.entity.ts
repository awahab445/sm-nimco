import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';

export interface SubscriptionPaymentEntity {
  id: string;
  subscriptionId: string;
  amount: string | number;
  status: SubscriptionPaymentStatus;
  paymentMethod: string;
  transactionRef: string | null;
  action: string;
  createdAt: Date;
}
