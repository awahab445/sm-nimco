import { fetchApi } from '../api-client';

export type StaffRoleRef = {
  id: string;
  slug: string;
  name: string;
};

export type StaffUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  roles: StaffRoleRef[];
};

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  return fetchApi<StaffUser[]>('/admin/users');
}

export async function fetchStaffUser(id: string): Promise<StaffUser> {
  return fetchApi<StaffUser>(`/admin/users/${id}`);
}

export type CreateStaffUserBody = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
};

export async function createStaffUser(body: CreateStaffUserBody): Promise<StaffUser> {
  return fetchApi<StaffUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type UpdateStaffUserBody = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  password?: string;
  roleIds?: string[];
};

export async function updateStaffUser(
  id: string,
  body: UpdateStaffUserBody,
): Promise<StaffUser> {
  return fetchApi<StaffUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteStaffUser(id: string): Promise<{ id: string; deleted: boolean }> {
  return fetchApi<{ id: string; deleted: boolean }>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}
