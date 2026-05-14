import { jwtVerify } from 'jose';

const CUSTOMER_COOKIE = 'auth-token';

function getSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function isValidCustomerSessionCookie(token: string | undefined): Promise<boolean> {
  if (!token?.trim()) {
    return false;
  }
  const secret = getSecret();
  if (!secret) {
    return Boolean(token);
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    const typ = (payload as { typ?: string }).typ ?? 'customer';
    return typ === 'customer';
  } catch {
    return false;
  }
}

export function readCustomerAuthCookie(request: { cookies: { get: (name: string) => { value: string } | undefined } }): string | undefined {
  return request.cookies.get(CUSTOMER_COOKIE)?.value;
}
