const GUEST_ORDER_EMAIL_KEY = 'guest_order_lookup_email';

/** Store guest email for order lookup without putting it in the page URL (Meta PageView). */
export function setGuestOrderEmail(email: string): void {
  if (typeof window === 'undefined') return;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  try {
    sessionStorage.setItem(GUEST_ORDER_EMAIL_KEY, normalized);
  } catch {
    // private mode / quota
  }
}

export function getGuestOrderEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(GUEST_ORDER_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function clearGuestOrderEmail(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(GUEST_ORDER_EMAIL_KEY);
  } catch {
    // ignore
  }
}
