/**
 * Normalize Leopards API credentials loaded from process.env.
 * Handles leftover quotes, escape sequences, and copy-paste artifacts.
 */
export function cleanLeopardsEnvValue(
  raw: string | undefined | null,
): string | undefined {
  if (raw == null) return undefined;

  let value = String(raw).trim();
  if (!value) return undefined;

  let prev = '';
  while (value !== prev && value.length >= 2) {
    prev = value;
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      value = value.slice(1, -1).trim();
    }
  }

  value = value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');

  value = value.normalize('NFC');

  return value || undefined;
}
