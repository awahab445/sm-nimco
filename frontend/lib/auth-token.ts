/**
 * HttpOnly session cookie is set via POST /api/session after login.
 * API requests use credentials: include (backend may also set its own API-domain cookie).
 */

const SESSION_ENDPOINT = '/api/session';

export function getToken(): string | null {
  return null;
}

export async function establishSession(token: string): Promise<void> {
  await fetch(SESSION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export async function clearSession(): Promise<void> {
  await fetch(SESSION_ENDPOINT, { method: 'DELETE' });
}

/** @deprecated Tokens are no longer stored in browser storage. */
export function setToken(_token: string): void {}

/** @deprecated Use clearSession(). */
export function clearToken(): void {
  void clearSession();
}
