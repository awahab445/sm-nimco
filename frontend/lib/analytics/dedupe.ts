const PREFIX = 'ga4_dedupe_';

export function hasDedupeKey(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(PREFIX + key) === '1';
  } catch {
    return false;
  }
}

export function setDedupeKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PREFIX + key, '1');
  } catch {
    // ignore quota / private mode
  }
}

export function markOnce(key: string): boolean {
  if (hasDedupeKey(key)) return false;
  setDedupeKey(key);
  return true;
}
