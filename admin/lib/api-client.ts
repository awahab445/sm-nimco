import { getToken, clearSession } from './auth-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path.startsWith('/login')) return;
  window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
}

/**
 * JSON fetch to the backend. When withAuth is true, sends Bearer token and
 * on 401 clears storage and redirects to /login.
 */
export async function fetchApi<T>(
  path: string,
  init: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (withAuth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
    signal: init.signal ?? controller.signal,
  }).catch((err: unknown) => {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    throw err;
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  if (response.status === 401 && withAuth) {
    void clearSession();
    redirectToLogin();
    throw new ApiError('Unauthorized', 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { message?: string })?.message ||
        `Request failed: ${response.statusText}`,
      response.status,
      errorData,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
