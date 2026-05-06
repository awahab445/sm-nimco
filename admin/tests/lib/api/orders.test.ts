import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/orders';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

const order = {
  id: 'o1',
  orderNumber: '1',
  customerId: null,
  customerGroupId: null,
  status: 'pending' as const,
  paymentStatus: null,
  fulfillmentStatus: null,
  customerEmail: 'e@e.e',
  customerName: null,
  billingAddress: {},
  shippingAddress: {},
  currency: 'USD',
  subtotal: '0',
  discountTotal: '0',
  shippingTotal: '0',
  taxTotal: '0',
  grandTotal: '0',
  appliedPriceRules: null,
  ipAddress: null,
  userAgent: null,
  notes: null,
  metadata: {},
  createdAt: '',
  updatedAt: '',
  cancelledAt: null,
  completedAt: null,
  items: [],
};

describe('orders API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchAdminOrders builds query', async () => {
    fetchMock.mockResolvedValue(
      resJson({
        data: [order],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      }),
    );
    await api.fetchAdminOrders({
      customerId: 'c1',
      status: 'processing',
      paymentStatus: 'paid',
      page: 2,
      limit: 5,
      sortBy: 'grandTotal',
      sortOrder: 'desc',
    });
    expectLastFetch(fetchMock, {
      path: '/admin/orders?customerId=c1&status=processing&paymentStatus=paid&page=2&limit=5&sortBy=grandTotal&sortOrder=desc',
    });
  });

  it('fetchAdminOrder GET', async () => {
    fetchMock.mockResolvedValue(resJson(order));
    await api.fetchAdminOrder('o1');
    expectLastFetch(fetchMock, { path: '/admin/orders/o1' });
  });

  it('updateAdminOrderStatus PUT', async () => {
    const body = {
      status: 'completed' as const,
      paymentStatus: 'paid' as const,
      fulfillmentStatus: 'fulfilled' as const,
    };
    fetchMock.mockResolvedValue(resJson({ ...order, ...body }));
    await api.updateAdminOrderStatus('o1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/orders/o1/status',
      method: 'PUT',
      body,
    });
  });
});
