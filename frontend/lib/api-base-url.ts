/**
 * Backend origin for server-side fetches (direct to NestJS).
 * Browser client code uses the same-origin proxy to avoid custom-domain / CORS issues.
 */
export const SERVER_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

/** Base URL for fetch calls: proxied in the browser, direct on the server. */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }
  return SERVER_API_BASE_URL;
}
