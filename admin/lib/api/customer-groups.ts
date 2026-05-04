import { fetchApi } from '../api-client';

export type CustomerGroup = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  taxClassId: string | null;
  discountPercent: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  customerCount?: number;
};

export async function fetchCustomerGroups(params?: { search?: string; isDefault?: boolean }) {
  const sp = new URLSearchParams();
  if (params?.search?.trim()) sp.set('search', params.search.trim());
  if (params?.isDefault === true) sp.set('isDefault', 'true');
  if (params?.isDefault === false) sp.set('isDefault', 'false');
  const q = sp.toString();
  return fetchApi<CustomerGroup[]>(`/admin/customer-groups${q ? `?${q}` : ''}`);
}

export async function fetchDefaultCustomerGroup(): Promise<CustomerGroup | null> {
  try {
    return await fetchApi<CustomerGroup>('/admin/customer-groups/default');
  } catch {
    return null;
  }
}

export type CreateCustomerGroupBody = {
  name: string;
  description?: string;
  isDefault?: boolean;
  taxClassId?: string;
  discountPercent?: number;
  metadata?: Record<string, unknown>;
};

export async function createCustomerGroup(body: CreateCustomerGroupBody) {
  return fetchApi<CustomerGroup>('/admin/customer-groups', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateCustomerGroupBody = Partial<CreateCustomerGroupBody>;

export async function updateCustomerGroup(id: string, body: UpdateCustomerGroupBody) {
  return fetchApi<CustomerGroup>(`/admin/customer-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteCustomerGroup(id: string) {
  return fetchApi(`/admin/customer-groups/${id}`, { method: 'DELETE' });
}
