/**
 * Staff admin authentication (JWT with typ: admin).
 */

import { fetchApi } from './api-client';
import { clearToken, getToken, setToken as persistToken } from './auth-token';

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

  /**
   * Clears local session immediately and notifies the server best-effort (no await).
   * Avoids waiting on the network so the UI can redirect on the first click.
   */
  logout: (): void => {
    const token = getToken();
    if (token) {
      const url = `${API_BASE_URL}/admin/auth/logout`;
      void fetch(url, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
        credentials: 'include',
      }).catch(() => {});
    }
    clearToken();
  },

  getMe: async (): Promise<AdminUser> => {
    return fetchApi<AdminUser>('/admin/auth/me', { method: 'GET' }, true);
  },

  setToken: persistToken,
  clearToken,
};
