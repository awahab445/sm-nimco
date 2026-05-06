import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/payments';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

const paymentMethodNested = {
  id: 'pm1',
  code: 'cod',
  name: 'COD',
  provider: 'internal',
  flowType: 'offline',
  isActive: true,
  config: {},
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

const paymentRecord = {
  id: 'pay1',
  orderId: 'o1',
  paymentMethodId: 'pm1',
  status: 'pending',
  flowType: 'offline',
  amount: '10',
  currency: 'USD',
  gatewayTransactionId: null,
  clientSecret: null,
  redirectUrl: null,
  gatewayResponse: null,
  capturedAt: null,
  failedAt: null,
  refundedAt: null,
  createdAt: '',
  updatedAt: '',
  paymentMethod: paymentMethodNested,
};

describe('payments API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchStorefrontPaymentMethods GET', async () => {
    fetchMock.mockResolvedValue(
      resJson([
        {
          code: 'cod',
          name: 'COD',
          provider: 'internal',
          flowType: 'offline',
          type: 'offline',
          metadata: {},
        },
      ]),
    );
    await api.fetchStorefrontPaymentMethods();
    expectLastFetch(fetchMock, { path: '/payments/methods' });
  });

  it('fetchPaymentsByOrder GET', async () => {
    fetchMock.mockResolvedValue(resJson([paymentRecord]));
    await api.fetchPaymentsByOrder('o1');
    expectLastFetch(fetchMock, { path: '/payments/order/o1' });
  });

  it('fetchPayment GET', async () => {
    fetchMock.mockResolvedValue(resJson(paymentRecord));
    await api.fetchPayment('pay1');
    expectLastFetch(fetchMock, { path: '/payments/pay1' });
  });

  it('fetchPendingCodPayments GET', async () => {
    fetchMock.mockResolvedValue(resJson([]));
    await api.fetchPendingCodPayments();
    expectLastFetch(fetchMock, { path: '/payments/cod/pending' });
  });

  it('collectCodPayment POST without body', async () => {
    fetchMock.mockResolvedValue(resJson({ success: true, message: 'ok' }));
    await api.collectCodPayment('pay1');
    expectLastFetch(fetchMock, {
      path: '/payments/cod/pay1/collect',
      method: 'POST',
    });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeUndefined();
  });

  it('failCodPayment POST with reason', async () => {
    fetchMock.mockResolvedValue(resJson({ success: true, message: 'ok' }));
    await api.failCodPayment('pay1', '  bad  ');
    expectLastFetch(fetchMock, {
      path: '/payments/cod/pay1/fail',
      method: 'POST',
      body: { reason: 'bad' },
    });
  });

  it('failCodPayment POST empty body when no reason', async () => {
    fetchMock.mockResolvedValue(resJson({ success: true, message: 'ok' }));
    await api.failCodPayment('pay1', '   ');
    expectLastFetch(fetchMock, {
      path: '/payments/cod/pay1/fail',
      method: 'POST',
      body: {},
    });
  });

  it('failCodPayment POST empty body when reason omitted', async () => {
    fetchMock.mockResolvedValue(resJson({ success: true, message: 'ok' }));
    await api.failCodPayment('pay1');
    expectLastFetch(fetchMock, {
      path: '/payments/cod/pay1/fail',
      method: 'POST',
      body: {},
    });
  });
});
