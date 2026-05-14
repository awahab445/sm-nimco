import type { Response } from 'express';

export const CUSTOMER_AUTH_COOKIE = 'auth-token';
export const ADMIN_AUTH_COOKIE = 'admin-auth-token';

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function parseMaxAgeMs(): number {
  const raw = process.env.JWT_EXPIRES_IN?.trim() ?? '7d';
  const match = /^(\d+)d$/i.exec(raw);
  if (match) {
    return Number(match[1]) * 24 * 60 * 60 * 1000;
  }
  return DEFAULT_MAX_AGE_MS;
}

function baseCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

export function setCustomerAuthCookie(res: Response, token: string): void {
  res.cookie(CUSTOMER_AUTH_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: parseMaxAgeMs(),
  });
}

export function clearCustomerAuthCookie(res: Response): void {
  res.clearCookie(CUSTOMER_AUTH_COOKIE, baseCookieOptions());
}

export function setAdminAuthCookie(res: Response, token: string): void {
  res.cookie(ADMIN_AUTH_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: parseMaxAgeMs(),
  });
}

export function clearAdminAuthCookie(res: Response): void {
  res.clearCookie(ADMIN_AUTH_COOKIE, baseCookieOptions());
}
