import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/shipping';
import { expectLastFetch, installFetchMock, resJson, res204 } from '../../helpers/http';

const zone = {
  id: 'z1',
  name: 'Z',
  description: null,
  coverage: {},
  priority: 0,
  isActive: true,
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

const method = {
  id: 'm1',
  zoneId: 'z1',
  code: 'flat',
  name: 'Flat',
  description: null,
  type: 'flat_rate' as const,
  config: {},
  minOrderAmount: null,
  maxOrderAmount: null,
  minWeight: null,
  maxWeight: null,
  priority: 0,
  isActive: true,
  courierConfig: null,
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

const orderShip = {
  id: 'os1',
  orderId: 'o1',
  shippingMethodId: 'm1',
  cost: 5,
  currency: 'USD',
  status: 'pending',
  trackingNumber: null,
  trackingUrl: null,
  courierCode: null,
  courierName: null,
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
  shippingAddress: {},
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

describe('shipping API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchShippingZones', async () => {
    fetchMock.mockResolvedValue(resJson([zone]));
    await api.fetchShippingZones({ includeInactive: true });
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/zones?includeInactive=true',
    });
  });

  it('fetchShippingZone GET', async () => {
    fetchMock.mockResolvedValue(resJson(zone));
    await api.fetchShippingZone('z1');
    expectLastFetch(fetchMock, { path: '/admin/shipping/zones/z1' });
  });

  it('createShippingZone POST', async () => {
    const body = { name: 'NZ' };
    fetchMock.mockResolvedValue(resJson({ ...zone, ...body }));
    await api.createShippingZone(body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/zones',
      method: 'POST',
      body,
    });
  });

  it('updateShippingZone PUT', async () => {
    const body = { priority: 2 };
    fetchMock.mockResolvedValue(resJson({ ...zone, ...body }));
    await api.updateShippingZone('z1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/zones/z1',
      method: 'PUT',
      body,
    });
  });

  it('deleteShippingZone DELETE 204', async () => {
    fetchMock.mockResolvedValue(res204());
    await api.deleteShippingZone('z1');
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/zones/z1',
      method: 'DELETE',
    });
  });

  it('fetchMethodsByZone', async () => {
    fetchMock.mockResolvedValue(resJson([method]));
    await api.fetchMethodsByZone('z1', { includeInactive: true });
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/zones/z1/methods?includeInactive=true',
    });
  });

  it('fetchShippingMethod GET', async () => {
    fetchMock.mockResolvedValue(resJson(method));
    await api.fetchShippingMethod('m1');
    expectLastFetch(fetchMock, { path: '/admin/shipping/methods/m1' });
  });

  it('createShippingMethod POST', async () => {
    const body = {
      zoneId: 'z1',
      code: 'c',
      name: 'N',
      type: 'flat_rate' as const,
    };
    fetchMock.mockResolvedValue(resJson({ ...method, ...body }));
    await api.createShippingMethod(body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods',
      method: 'POST',
      body,
    });
  });

  it('updateShippingMethod PUT', async () => {
    const body = { name: 'N2' };
    fetchMock.mockResolvedValue(resJson({ ...method, ...body }));
    await api.updateShippingMethod('m1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods/m1',
      method: 'PUT',
      body,
    });
  });

  it('deleteShippingMethod DELETE', async () => {
    fetchMock.mockResolvedValue(res204());
    await api.deleteShippingMethod('m1');
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods/m1',
      method: 'DELETE',
    });
  });

  it('assignShippingToOrder POST', async () => {
    fetchMock.mockResolvedValue(resJson(orderShip));
    await api.assignShippingToOrder('o1', 'm1');
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/orders/o1/assign',
      method: 'POST',
      body: { shippingMethodId: 'm1' },
    });
  });

  it('updateOrderShippingStatus PUT', async () => {
    const body = {
      status: 'shipped' as const,
      trackingNumber: 'T1',
    };
    fetchMock.mockResolvedValue(resJson({ ...orderShip, ...body }));
    await api.updateOrderShippingStatus('o1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/orders/o1/status',
      method: 'PUT',
      body,
    });
  });

  it('fetchPublicOrderShipping GET /shipping/order', async () => {
    fetchMock.mockResolvedValue(resJson(orderShip));
    await api.fetchPublicOrderShipping('o1');
    expectLastFetch(fetchMock, { path: '/shipping/order/o1' });
  });

  it('fetchMethodCustomerGroups GET', async () => {
    fetchMock.mockResolvedValue(resJson([]));
    await api.fetchMethodCustomerGroups('m1');
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods/m1/customer-groups',
    });
  });

  it('assignMethodCustomerGroup POST', async () => {
    const body = { customerGroupId: 'g1', discountPercent: 10 };
    fetchMock.mockResolvedValue(resJson({ message: 'ok' }));
    await api.assignMethodCustomerGroup('m1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods/m1/customer-groups',
      method: 'POST',
      body,
    });
  });

  it('updateMethodCustomerGroupPricing PUT', async () => {
    const body = { fixedCost: 2 };
    fetchMock.mockResolvedValue(resJson({ message: 'ok' }));
    await api.updateMethodCustomerGroupPricing('m1', 'g1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods/m1/customer-groups/g1',
      method: 'PUT',
      body,
    });
  });

  it('removeMethodCustomerGroup DELETE', async () => {
    fetchMock.mockResolvedValue(res204());
    await api.removeMethodCustomerGroup('m1', 'g1');
    expectLastFetch(fetchMock, {
      path: '/admin/shipping/methods/m1/customer-groups/g1',
      method: 'DELETE',
    });
  });
});
