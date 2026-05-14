/**
 * Admin HttpOnly session via POST /api/session after login.
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

export function setToken(_token: string): void {}

export function clearToken(): void {
  void clearSession();
}
