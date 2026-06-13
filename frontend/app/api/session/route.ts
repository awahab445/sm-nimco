import { NextResponse } from 'next/server';
import { sessionCookieOptions, sessionCookieSecure } from '@/lib/session-cookie-options';

const COOKIE_NAME = 'auth-token';
const MAX_AGE = 7 * 24 * 60 * 60;

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
