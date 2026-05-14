/** Reject open redirects such as //evil.com while allowing same-app paths. */
export function safeRedirectPath(
  path: string | null | undefined,
  fallback = '/account',
): string {
  if (!path) {
    return fallback;
  }
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return fallback;
  }
  return path;
}
