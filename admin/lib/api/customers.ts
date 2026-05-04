import { fetchApi } from '../api-client';

export type CustomerGroupSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  taxClassId: string | null;
  discountPercent: number | null;
};

export type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isGuest: boolean;
  customerGroupId: string;
  customerGroup: CustomerGroupSummary | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminCustomers(params?: {
  search?: string;
  isGuest?: boolean;
  customerGroupId?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.search?.trim()) sp.set('search', params.search.trim());
  if (params?.isGuest === true) sp.set('isGuest', 'true');
  if (params?.isGuest === false) sp.set('isGuest', 'false');
  if (params?.customerGroupId) sp.set('customerGroupId', params.customerGroupId);
  const q = sp.toString();
  return fetchApi<Customer[]>(`/admin/customers${q ? `?${q}` : ''}`);
}

export async function fetchAdminCustomer(id: string) {
  return fetchApi<Customer>(`/admin/customers/${id}`);
}

export type CreateCustomerBody = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGuest?: boolean;
  customerGroupId?: string;
  metadata?: Record<string, unknown>;
};

export async function createAdminCustomer(body: CreateCustomerBody) {
  return fetchApi<Customer>('/admin/customers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateCustomerBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGuest?: boolean;
  customerGroupId?: string;
  metadata?: Record<string, unknown>;
};

export async function updateAdminCustomer(id: string, body: UpdateCustomerBody) {
  return fetchApi<Customer>(`/admin/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** Backend expects `{ groupId: string }` */
export async function assignCustomerGroup(customerId: string, groupId: string) {
  return fetchApi<Customer>(`/admin/customers/${customerId}/assign-group`, {
    method: 'PUT',
    body: JSON.stringify({ groupId }),
  });
}

export async function deleteAdminCustomer(id: string) {
  return fetchApi(`/admin/customers/${id}`, { method: 'DELETE' });
}
