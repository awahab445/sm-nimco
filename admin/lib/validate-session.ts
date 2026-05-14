import { jwtVerify } from 'jose';

const ADMIN_COOKIE = 'admin-auth-token';

function getSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function isValidAdminSessionCookie(token: string | undefined): Promise<boolean> {
  if (!token?.trim()) {
    return false;
  }
  const secret = getSecret();
  if (!secret) {
    return Boolean(token);
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as { typ?: string }).typ === 'admin';
  } catch {
    return false;
  }
}
