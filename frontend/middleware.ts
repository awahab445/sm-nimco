/**
 * Next.js Middleware
 * Protects account/auth routes only — public pages skip Edge middleware for faster TTFB.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidCustomerSessionCookie, readCustomerAuthCookie } from '@/lib/validate-session';

const protectedRoutes = [
  '/account',
  '/profile',
  '/addresses',
  '/orders',
];

const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (!pathname.startsWith(route)) return false;
    if (route === '/orders') {
      const rest = pathname.slice(7);
      if (!rest || rest === '/') return true;
      return false;
    }
    return true;
  });

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const authToken = readCustomerAuthCookie(request);
  const isAuthenticated = await isValidCustomerSessionCookie(authToken);

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/account/:path*',
    '/profile/:path*',
    '/addresses/:path*',
    '/orders',
    '/orders/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
