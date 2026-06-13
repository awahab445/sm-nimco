import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAdminSessionCookie } from '@/lib/validate-session';
import { sessionCookieOptions, sessionCookieSecure } from '@/lib/session-cookie-options';

const COOKIE_NAME = 'admin-auth-token';
const MAX_AGE = 7 * 24 * 60 * 60;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !(await isValidAdminSessionCookie(token))) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, token });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();
  if (!token) {
    return NextResponse.json({ message: 'token is required' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    ...sessionCookieOptions,
    secure: sessionCookieSecure(),
    maxAge: MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', {
    ...sessionCookieOptions,
    secure: sessionCookieSecure(),
    maxAge: 0,
  });
  return response;
}
