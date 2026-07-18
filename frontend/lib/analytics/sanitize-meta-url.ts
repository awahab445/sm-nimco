/** Query keys Meta may treat as unhashed PII on PageView (page URL). */
const PII_QUERY_KEYS = new Set([
  'email',
  'em',
  'e-mail',
  'mail',
  'phone',
  'ph',
  'tel',
  'mobile',
  'firstname',
  'first_name',
  'fn',
  'lastname',
  'last_name',
  'ln',
  'name',
  'password',
  'pass',
  'ssn',
  'dob',
  'birthdate',
  'address',
  'zip',
  'postal',
]);

/**
 * Remove known PII query params from the browser URL before Meta reads location.
 * Preserves UTM / tracking params. Safe no-op on the server.
 */
export function stripPiiFromBrowserUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of [...url.searchParams.keys()]) {
      if (PII_QUERY_KEYS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (!changed) return;
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', next);
  } catch {
    // ignore malformed URLs
  }
}

/** Strip PII query keys from an arbitrary URL string (e.g. event_source_url). */
export function stripPiiFromUrlString(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  try {
    const url = new URL(raw.trim());
    for (const key of [...url.searchParams.keys()]) {
      if (PII_QUERY_KEYS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return raw.trim();
  }
}
