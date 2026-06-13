/** HttpOnly session cookie flags — COOKIE_SECURE=false required for HTTP deployments. */
export function sessionCookieSecure(): boolean {
  return process.env.COOKIE_SECURE === 'true';
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
};
