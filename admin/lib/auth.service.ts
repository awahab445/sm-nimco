/**
 * Admin authentication against the platform API (same JWT as storefront until admin roles exist).
 */

import { fetchApi } from './api-client';
import { clearToken, setToken as persistToken } from './auth-token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGuest?: boolean;
  customerGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(credentials) },
      false,
    );
  },

  logout: async (): Promise<void> => {
    try {
      await fetchApi<{ message?: string }>('/auth/logout', { method: 'POST' }, true);
    } finally {
      clearToken();
    }
  },

  getMe: async (): Promise<User> => {
    return fetchApi<User>('/auth/me', { method: 'GET' }, true);
  },

  setToken: persistToken,
  clearToken,
};
