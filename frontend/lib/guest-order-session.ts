const GUEST_ORDER_EMAIL_KEY = 'guest_order_lookup_email';
const GUEST_MATCH_PHONE_KEY = 'guest_meta_match_phone';

function readStorage(storage: Storage | undefined, key: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage | undefined, key: string, value: string): void {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // private mode / quota
  }
}

function removeStorage(storage: Storage | undefined, key: string): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

function browserStorages(): { session?: Storage; local?: Storage } {
  if (typeof window === 'undefined') return {};
  return { session: sessionStorage, local: localStorage };
}

function persistGuestValue(key: string, value: string): void {
  const { session, local } = browserStorages();
  writeStorage(session, key, value);
  writeStorage(local, key, value);
}

function readGuestValue(key: string): string | null {
  const { session, local } = browserStorages();
  return readStorage(session, key) || readStorage(local, key);
}

/** Store guest email for order lookup without putting it in the page URL (Meta PageView). */
export function setGuestOrderEmail(email: string): void {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  persistGuestValue(GUEST_ORDER_EMAIL_KEY, normalized);
}

export function getGuestOrderEmail(): string | null {
  return readGuestValue(GUEST_ORDER_EMAIL_KEY);
}

export function clearGuestOrderEmail(): void {
  const { session, local } = browserStorages();
  removeStorage(session, GUEST_ORDER_EMAIL_KEY);
  removeStorage(local, GUEST_ORDER_EMAIL_KEY);
}

/** Phone collected at checkout — used for Meta Advanced Matching on later PageViews. */
export function setGuestMatchPhone(phone: string): void {
  const digits = phone.replace(/[^\d]/g, '');
  if (!digits) return;
  persistGuestValue(GUEST_MATCH_PHONE_KEY, digits);
}

export function getGuestMatchPhone(): string | null {
  return readGuestValue(GUEST_MATCH_PHONE_KEY);
}
