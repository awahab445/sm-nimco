import { fetchApi, ApiError } from '../api-client';
import { getToken } from '../auth-token';

export type ShippingRate = {
  id: string;
  province: string;
  city: string | null;
  minWeightKg: number;
  maxWeightKg: number;
  rateAmount: number;
  isCodAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShippingRateListResponse = {
  items: ShippingRate[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdateShippingRateBody = {
  province?: string;
  city?: string | null;
  minWeightKg?: number;
  maxWeightKg?: number;
  rateAmount?: number;
  isCodAvailable?: boolean;
};

export type CreateShippingRateBody = {
  province: string;
  city?: string | null;
  minWeightKg: number;
  maxWeightKg: number;
  rateAmount: number;
  isCodAvailable?: boolean;
};

export type UploadShippingRatesResponse = {
  success: boolean;
  data: {
    importedRows: number;
    created: number;
    updated: number;
  };
};

export async function fetchShippingRates(params?: {
  page?: number;
  pageSize?: number;
  province?: string;
  city?: string;
  search?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params?.province?.trim()) sp.set('province', params.province.trim());
  if (params?.city?.trim()) sp.set('city', params.city.trim());
  if (params?.search?.trim()) sp.set('search', params.search.trim());
  const q = sp.toString();
  return fetchApi<ShippingRateListResponse>(
    `/admin/shipping-rates${q ? `?${q}` : ''}`,
  );
}

export async function createShippingRate(body: CreateShippingRateBody) {
  return fetchApi<ShippingRate>('/admin/shipping-rates', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateShippingRate(
  id: string,
  body: UpdateShippingRateBody,
) {
  return fetchApi<ShippingRate>(`/admin/shipping-rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteShippingRate(id: string) {
  return fetchApi<void>(`/admin/shipping-rates/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadShippingRatesCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/admin/shipping-rates/upload-csv`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { message?: string })?.message ||
        `Request failed: ${response.statusText}`,
      response.status,
      errorData,
    );
  }

  return response.json() as Promise<UploadShippingRatesResponse>;
}

export const SHIPPING_RATES_TEMPLATE_CSV = `Province,City,MinWeight,MaxWeight,RateAmount
Punjab,Lahore,0,1,250
Punjab,Lahore,1.01,3,350
Punjab,,0,1,300
Sindh,Karachi,0,1,280
Islamabad Capital Territory,Islamabad,0,5,200
`;

export function downloadShippingRatesTemplate() {
  const blob = new Blob([SHIPPING_RATES_TEMPLATE_CSV], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'shipping-rates-template.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Client-side CSV preview (first sheet-like text rows). */
export function parseShippingRatesCsvPreview(text: string): {
  headers: string[];
  rows: string[][];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const split = (line: string) =>
    line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

  const headers = split(lines[0]);
  const rows = lines.slice(1, 21).map(split);
  return { headers, rows };
}
