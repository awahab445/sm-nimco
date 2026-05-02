/**
 * Staff admin authentication (JWT with typ: admin).
 */

import { fetchApi } from './api-client';
import { clearToken, setToken as persistToken } from './auth-token';

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
      clearToken();
    }
  },

  getMe: async (): Promise<AdminUser> => {
    return fetchApi<AdminUser>('/admin/auth/me', { method: 'GET' }, true);
  },

  setToken: persistToken,
  clearToken,
};
