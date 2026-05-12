import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/promotions';
import { expectLastFetch, installFetchMock, res204, resJson } from '../../helpers/http';

const promotion = {
  id: 'pr1',
  code: null,
  name: 'P',
  description: null,
  type: 'percentage' as const,
  status: 'draft' as const,
  discountValue: 10,
  discountType: 'percentage' as const,
  scope: 'cart' as const,
  isStackable: false,
  isExclusive: false,
  appliesToAllGroups: true,
  conditions: {},
  usageLimit: null,
  usageLimitPerUser: null,
  currentUsage: 0,
  startDate: null,
  endDate: null,
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

describe('promotions API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchPromotions optional allStatuses', async () => {
    fetchMock.mockResolvedValue(resJson([promotion]));
    await api.fetchPromotions({ allStatuses: true });
    expectLastFetch(fetchMock, { path: '/promotions?allStatuses=true' });
  });

  it('fetchPromotions without query', async () => {
    fetchMock.mockResolvedValue(resJson([]));
    await api.fetchPromotions();
    expectLastFetch(fetchMock, { path: '/promotions' });
  });

  it('fetchPromotion GET', async () => {
    fetchMock.mockResolvedValue(resJson(promotion));
    await api.fetchPromotion('pr1');
    expectLastFetch(fetchMock, { path: '/promotions/pr1' });
  });

  it('createPromotion POST', async () => {
    const body = { name: 'N', type: 'fixed_amount' as const };
    fetchMock.mockResolvedValue(resJson({ ...promotion, ...body }));
    await api.createPromotion(body);
    expectLastFetch(fetchMock, { path: '/promotions', method: 'POST', body });
  });

  it('patchPromotion PATCH', async () => {
    const body = { status: 'active' as const };
    fetchMock.mockResolvedValue(resJson({ ...promotion, ...body }));
    await api.patchPromotion('pr1', body);
    expectLastFetch(fetchMock, {
      path: '/promotions/pr1',
      method: 'PATCH',
      body,
    });
  });

  it('validatePromotion POST', async () => {
    const body = {
      subtotal: 100,
      items: [{ productId: 'p1', variantId: 'v1', quantity: 1, price: 100 }],
    };
    fetchMock.mockResolvedValue(resJson({ eligible: true, discountAmount: 10 }));
    await api.validatePromotion('pr1', body);
    expectLastFetch(fetchMock, {
      path: '/promotions/pr1/validate',
      method: 'POST',
      body,
    });
  });

  it('fetchPromotionLogs with filters', async () => {
    fetchMock.mockResolvedValue(resJson([]));
    await api.fetchPromotionLogs('pr1', {
      cartId: 'cart',
      checkoutId: 'chk',
      orderId: 'ord',
    });
    expectLastFetch(fetchMock, {
      path: '/promotions/pr1/logs?cartId=cart&checkoutId=chk&orderId=ord',
    });
  });

  it('deletePromotion DELETE', async () => {
    fetchMock.mockResolvedValue(res204());
    await api.deletePromotion('pr1');
    expectLastFetch(fetchMock, {
      path: '/promotions/pr1',
      method: 'DELETE',
    });
  });
});
