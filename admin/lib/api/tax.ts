import { fetchApi } from '../api-client';

export type TaxClass = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type TaxRate = {
  id: string;
  taxClassId: string;
  country: string;
  region: string | null;
  rate: number;
  isInclusive: boolean;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export async function fetchTaxClasses() {
  return fetchApi<TaxClass[]>('/tax/classes');
}

export async function fetchTaxClass(id: string) {
  return fetchApi<TaxClass>(`/tax/classes/${id}`);
}

export type CreateTaxClassBody = {
  code: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export async function createTaxClass(body: CreateTaxClassBody) {
  return fetchApi<TaxClass>('/tax/classes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateTaxClassBody = Partial<Omit<CreateTaxClassBody, 'description'>> & {
  description?: string | null;
};

export async function updateTaxClass(id: string, body: UpdateTaxClassBody) {
  return fetchApi<TaxClass>(`/tax/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteTaxClass(id: string) {
  return fetchApi<void>(`/tax/classes/${id}`, { method: 'DELETE' });
}

export async function fetchTaxRates() {
  return fetchApi<TaxRate[]>('/tax/taxes');
}

export async function fetchTaxRate(id: string) {
  return fetchApi<TaxRate>(`/tax/taxes/${id}`);
}

export type CreateTaxRateBody = {
  taxClassId: string;
  country: string;
  region?: string;
  rate: number;
  isInclusive?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, unknown>;
};

export async function createTaxRate(body: CreateTaxRateBody) {
  return fetchApi<TaxRate>('/tax/taxes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateTaxRateBody = Partial<
  Omit<CreateTaxRateBody, 'region' | 'startDate' | 'endDate'>
> & {
  region?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export async function updateTaxRate(id: string, body: UpdateTaxRateBody) {
  return fetchApi<TaxRate>(`/tax/taxes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteTaxRate(id: string) {
  return fetchApi<void>(`/tax/taxes/${id}`, { method: 'DELETE' });
}
