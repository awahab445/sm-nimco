/**
 * Normalize a Pakistan / international phone into E.164 digits (no +).
 * Examples: 03001234567 → 923001234567, +92 300 1234567 → 923001234567
 */
export function normalizePakistanPhone(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;

  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Local PK mobile: 03XXXXXXXXX (11 digits)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = `92${digits.slice(1)}`;
  }

  // Mobile without leading 0: 3XXXXXXXXX (10 digits)
  if (digits.length === 10 && digits.startsWith('3')) {
    digits = `92${digits}`;
  }

  // Must look like a plausible PK mobile after normalize
  if (!/^92\d{10}$/.test(digits) && !/^\d{10,15}$/.test(digits)) {
    return null;
  }

  return digits;
}
