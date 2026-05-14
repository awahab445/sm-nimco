/**
 * Authentication Service
 * Handles API calls for authentication. Backend returns JWT in access_token.
 */

import { clearSession } from './auth-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGuest?: boolean;
  customerGroupId?: string;
  customerGroup?: {
    id: string;
    name: string;
    isDefault: boolean;
    taxClassId?: string;
    discountPercent?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/** Backend auth response: JWT + user */
export interface AuthResponse {
  access_token: string;
  user: User;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

async function fetchAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  withToken = false,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (withToken) {
    // Session cookie is HttpOnly; API auth uses credentials: include.
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401 && withToken) {
    void clearSession();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AuthError(
      (errorData as { message?: string })?.message || `Authentication Error: ${response.statusText}`,
      response.status,
      errorData,
    );
  }

  return response.json();
}

export const authService = {
  /**
   * Login with email and password.
   * Returns { access_token, user }. Caller should call setToken(access_token) and store user.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new user.
   * Returns { access_token, user }. Caller should call setToken(access_token) and store user.
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchAuth<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout: call backend with Bearer token, then clear token locally.
   */
  logout: async (): Promise<void> => {
    try {
      await fetchAuth<{ message?: string }>('/auth/logout', { method: 'POST' }, true);
    } finally {
      await clearSession();
    }
  },

  /**
   * Get current user. Uses stored Bearer token. On 401, token is cleared.
   */
  getMe: async (): Promise<User> => {
    return fetchAuth<User>('/auth/me', { method: 'GET' }, true);
  },

  /**
   * Request account creation for guest (same email as order).
   * Backend sends email with set-password link. Returns generic success message.
   */
  requestAccountCreation: async (email: string): Promise<{ message: string }> => {
    return fetchAuth<{ message: string }>('/auth/request-account-creation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Set password using token from email link. Returns same shape as login/register (JWT + user).
   */
  setPassword: async (token: string, password: string): Promise<AuthResponse> => {
    return fetchAuth<AuthResponse>('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};
