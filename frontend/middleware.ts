/**
 * Next.js Middleware
 * Protects routes and handles authentication redirects
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/profile',
  '/addresses',
  '/orders',
];

// Public routes that should redirect to account if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass pathname to server (e.g. orders layout uses it to allow guest order detail)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Check if the route is protected (order detail /orders/[id] is public for guest track-order)
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (!pathname.startsWith(route)) return false;
    if (route === '/orders') {
      const rest = pathname.slice(7); // after '/orders'
      if (!rest || rest === '/') return true; // /orders or /orders/ -> list, protected
      // /orders/[id] -> order detail, public so guests can use track-order redirect
      return false;
    }
    return true;
  });

  // Check if the route is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // JWT is stored in auth-token cookie when user logs in (see lib/auth-token.ts)
  const authTokenCookie = request.cookies.get('auth-token');
  const isAuthenticated = !!authTokenCookie?.value;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to account
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

