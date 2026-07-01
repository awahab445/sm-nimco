/**
 * Customer session: HttpOnly cookie for middleware + in-memory JWT for API Bearer auth.
 */

const SESSION_ENDPOINT = '/api/session';

let cachedToken: string | null = null;

export function getToken(): string | null {
  return cachedToken;
}

export async function establishSession(token: string): Promise<void> {
  cachedToken = token;
  await fetch(SESSION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token }),
  });
}

/** Restore Bearer token from HttpOnly cookie after refresh/navigation. */
export async function bootstrapSessionFromCookie(): Promise<boolean> {
  if (cachedToken) {
    return true;
  }
  const response = await fetch(SESSION_ENDPOINT, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { authenticated?: boolean; token?: string };
  if (data.authenticated === false) {
    return false;
  }
  cachedToken = data.token?.trim() || null;
  return Boolean(cachedToken);
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  await fetch(SESSION_ENDPOINT, { method: 'DELETE', credentials: 'include' });
}

/** @deprecated Use establishSession(). */
export function setToken(token: string): void {
  cachedToken = token;
}

/** @deprecated Use clearSession(). */
export function clearToken(): void {
  void clearSession();
}
