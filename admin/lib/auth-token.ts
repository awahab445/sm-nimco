/**
 * Admin JWT storage: localStorage (API client) + cookie (middleware).
 * Cookie name must match middleware: admin-auth-token
 */

const TOKEN_KEY = 'admin-auth-token';
const COOKIE_NAME = 'admin-auth-token';
const COOKIE_MAX_AGE_DAYS = 7;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getToken(): string | null {
  if (!isClient()) return null;
  const fromStorage = localStorage.getItem(TOKEN_KEY);
  if (fromStorage) return fromStorage;
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setToken(token: string): void {
  if (!isClient()) return;
  localStorage.setItem(TOKEN_KEY, token);
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  if (!isClient()) return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
