import { fetchApi } from '../api-client';

/** Active methods for checkout (`GET /payments/methods`) — no gateway secrets. */
export type StorefrontPaymentMethod = {
  code: string;
  name: string;
  provider: string;
  flowType: string;
  type: string;
  metadata: Record<string, unknown>;
};

export type PaymentMethodNested = {
  id: string;
  code: string;
  name: string;
  provider: string;
  flowType: string;
  isActive: boolean;
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  paymentMethodId: string;
  status: string;
  flowType: string;
  amount: string;
  currency: string;
  gatewayTransactionId: string | null;
  clientSecret: string | null;
  redirectUrl: string | null;
  gatewayResponse: Record<string, unknown> | null;
  capturedAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethodNested;
};

export async function fetchStorefrontPaymentMethods() {
  return fetchApi<StorefrontPaymentMethod[]>('/payments/methods');
}

export async function fetchPaymentsByOrder(orderId: string) {
  return fetchApi<PaymentRecord[]>(`/payments/order/${orderId}`);
}

export async function fetchPayment(paymentId: string) {
  return fetchApi<PaymentRecord>(`/payments/${paymentId}`);
}

export async function fetchPendingCodPayments() {
  return fetchApi<PaymentRecord[]>('/payments/cod/pending');
}

export async function collectCodPayment(paymentId: string) {
  return fetchApi<{ success: boolean; message: string }>(
    `/payments/cod/${paymentId}/collect`,
    { method: 'POST' },
  );
}

export async function failCodPayment(paymentId: string, reason?: string) {
  return fetchApi<{ success: boolean; message: string }>(
    `/payments/cod/${paymentId}/fail`,
    {
      method: 'POST',
      body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  );
}
