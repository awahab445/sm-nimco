import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/customer-groups';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

describe('customer-groups API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchCustomerGroups GET without query', async () => {
    fetchMock.mockResolvedValue(resJson([]));
    await api.fetchCustomerGroups();
    expectLastFetch(fetchMock, { path: '/admin/customer-groups' });
  });

  it('fetchCustomerGroups builds query string', async () => {
    fetchMock.mockResolvedValue(resJson([]));
    await api.fetchCustomerGroups({ search: 'vip', isDefault: true });
    expectLastFetch(fetchMock, {
      path: '/admin/customer-groups?search=vip&isDefault=true',
    });
  });

  it('fetchDefaultCustomerGroup GET', async () => {
    fetchMock.mockResolvedValue(
      resJson({
        id: '1',
        name: 'Default',
        description: null,
        isDefault: true,
        taxClassId: null,
        discountPercent: null,
        metadata: {},
        createdAt: '',
        updatedAt: '',
      }),
    );
    const out = await api.fetchDefaultCustomerGroup();
    expect(out).not.toBeNull();
    expectLastFetch(fetchMock, { path: '/admin/customer-groups/default' });
  });

  it('fetchDefaultCustomerGroup returns null on error', async () => {
    fetchMock.mockRejectedValue(new Error('404'));
    const out = await api.fetchDefaultCustomerGroup();
    expect(out).toBeNull();
  });

  it('createCustomerGroup POST', async () => {
    const body = { name: 'G' };
    fetchMock.mockResolvedValue(
      resJson({
        id: '1',
        ...body,
        description: null,
        isDefault: false,
        taxClassId: null,
        discountPercent: null,
        metadata: {},
        createdAt: '',
        updatedAt: '',
      }),
    );
    await api.createCustomerGroup(body);
    expectLastFetch(fetchMock, { path: '/admin/customer-groups', method: 'POST', body });
  });

  it('updateCustomerGroup PUT', async () => {
    const body = { name: 'G2' };
    fetchMock.mockResolvedValue(
      resJson({
        id: '1',
        ...body,
        description: null,
        isDefault: false,
        taxClassId: null,
        discountPercent: null,
        metadata: {},
        createdAt: '',
        updatedAt: '',
      }),
    );
    await api.updateCustomerGroup('1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/customer-groups/1',
      method: 'PUT',
      body,
    });
  });

  it('deleteCustomerGroup DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.deleteCustomerGroup('1');
    expectLastFetch(fetchMock, { path: '/admin/customer-groups/1', method: 'DELETE' });
  });
});
