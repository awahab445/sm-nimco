/**
 * Server-side Authentication Utilities
 * SSR-safe authentication checks for Next.js App Router.
 * Backend expects Authorization: Bearer <token>; we read auth-token from cookies.
 */

import { cookies } from 'next/headers';
import { User } from './auth.service';
import { SERVER_API_BASE_URL } from './api-base-url';
const AUTH_COOKIE_NAME = 'auth-token';

/**
 * Get the current authenticated user on the server
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${SERVER_API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Server auth check failed:', error);
    return null;
  }
}

/**
 * Check if user is authenticated on the server
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}

