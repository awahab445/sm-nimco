/**
 * Staff admin authentication (JWT with typ: admin).
 */

import { fetchApi } from './api-client';
import { clearSession } from './auth-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminRoleRef {
  id: string;
  slug: string;
  name: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  typ: 'admin';
  roles: AdminRoleRef[];
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: AdminUser;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>(
      '/admin/auth/login',
      { method: 'POST', body: JSON.stringify(credentials) },
      false,
    );
  },

  logout: async (): Promise<void> => {
    try {
      await fetchApi<{ message?: string }>('/admin/auth/logout', { method: 'POST' }, true);
    } finally {
      await clearSession();
    }
  },

  getMe: async (): Promise<AdminUser> => {
    return fetchApi<AdminUser>('/admin/auth/me', { method: 'GET' }, true);
  },
};
