import { fetchApi } from '../api-client';

export type CourierZone = {
  id: string;
  code: string;
  name: string;
  rateLessThan10kg: number;
  rateGreaterOrEqual10kg: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCourierZoneBody = {
  name?: string;
  rateLessThan10kg?: number;
  rateGreaterOrEqual10kg?: number;
};

export async function fetchCourierZones() {
  return fetchApi<CourierZone[]>('/admin/shipping/courier-zones');
}

export async function updateCourierZone(
  id: string,
  body: UpdateCourierZoneBody,
) {
  return fetchApi<CourierZone>(`/admin/shipping/courier-zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
