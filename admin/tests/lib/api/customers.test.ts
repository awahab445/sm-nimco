import { beforeEach, describe, expect, it } from 'vitest';
import * as api from '@/lib/api/customers';
import { expectLastFetch, installFetchMock, resJson } from '../../helpers/http';

const customer = {
  id: 'c1',
  email: 'e@e.e',
  firstName: null,
  lastName: null,
  phone: null,
  isGuest: false,
  customerGroupId: 'g1',
  customerGroup: null,
  metadata: {},
  createdAt: '',
  updatedAt: '',
};

describe('customers API', () => {
  let fetchMock: ReturnType<typeof installFetchMock>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  it('fetchAdminCustomers GET with filters', async () => {
    fetchMock.mockResolvedValue(resJson([customer]));
    await api.fetchAdminCustomers({
      search: 'a',
      isGuest: false,
      customerGroupId: 'g1',
    });
    expectLastFetch(fetchMock, {
      path: '/admin/customers?search=a&isGuest=false&customerGroupId=g1',
    });
  });

  it('fetchAdminCustomer GET', async () => {
    fetchMock.mockResolvedValue(resJson(customer));
    await api.fetchAdminCustomer('c1');
    expectLastFetch(fetchMock, { path: '/admin/customers/c1' });
  });

  it('createAdminCustomer POST', async () => {
    const body = { email: 'n@n.n' };
    fetchMock.mockResolvedValue(resJson({ ...customer, ...body }));
    await api.createAdminCustomer(body);
    expectLastFetch(fetchMock, { path: '/admin/customers', method: 'POST', body });
  });

  it('updateAdminCustomer PUT', async () => {
    const body = { firstName: 'A' };
    fetchMock.mockResolvedValue(resJson({ ...customer, ...body }));
    await api.updateAdminCustomer('c1', body);
    expectLastFetch(fetchMock, {
      path: '/admin/customers/c1',
      method: 'PUT',
      body,
    });
  });

  it('assignCustomerGroup PUT with groupId', async () => {
    fetchMock.mockResolvedValue(resJson(customer));
    await api.assignCustomerGroup('c1', 'g2');
    expectLastFetch(fetchMock, {
      path: '/admin/customers/c1/assign-group',
      method: 'PUT',
      body: { groupId: 'g2' },
    });
  });

  it('deleteAdminCustomer DELETE', async () => {
    fetchMock.mockResolvedValue(resJson({}));
    await api.deleteAdminCustomer('c1');
    expectLastFetch(fetchMock, { path: '/admin/customers/c1', method: 'DELETE' });
  });
});
