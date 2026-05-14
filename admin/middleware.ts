import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidAdminSessionCookie } from '@/lib/validate-session';

const COOKIE_NAME = 'admin-auth-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/login' || pathname.startsWith('/login/');
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = await isValidAdminSessionCookie(token);

  if (!isLogin && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
