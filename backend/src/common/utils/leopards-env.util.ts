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

/**
 * Karachi warehouse shipper Sys Id on the SM Nimco Leopards merchant account.
 * Without an explicit shipper_id, Leopards defaults to the first shipper profile.
 */
export const DEFAULT_LEOPARDS_SHIPPER_ID = '2792661';

/** Leopards Merchant API city id for Karachi (bookPacket `origin_city`). */
export const DEFAULT_LEOPARDS_ORIGIN_CITY_ID = '592';

/** SM Nimco shipper identity printed on Leopards AWB / shipping slip. */
export const DEFAULT_LEOPARDS_SHIPPER_NAME = 'SM Nimco & Sweets';
export const DEFAULT_LEOPARDS_SHIPPER_EMAIL = 'info@smnimco.com';
export const DEFAULT_LEOPARDS_SHIPPER_PHONE = '03442394143';
export const DEFAULT_LEOPARDS_SHIPPER_ADDRESS =
  'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI';

/**
 * Resolve Leopards shipper Sys Id from env (LEOPARDS_SHIPPER_ID).
 */
export function resolveLeopardsShipperId(raw?: string | number | null): string {
  const fromArg =
    raw != null && String(raw).trim() !== '' ? String(raw).trim() : undefined;
  const fromEnv = cleanLeopardsEnvValue(process.env.LEOPARDS_SHIPPER_ID);
  return fromArg || fromEnv || DEFAULT_LEOPARDS_SHIPPER_ID;
}

/**
 * Resolve bookPacket `origin_city` as a numeric string Leopards city id.
 */
export function resolveLeopardsOriginCityId(
  raw?: string | number | null,
): string {
  const candidates = [
    raw != null && String(raw).trim() !== '' ? String(raw).trim() : undefined,
    cleanLeopardsEnvValue(process.env.LEOPARDS_ORIGIN_CITY_ID),
    cleanLeopardsEnvValue(process.env.LEOPARDS_ORIGIN_CITY),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (/^\d+$/.test(candidate)) {
      const normalized = candidate.replace(/^0+(?=\d)/, '');
      return normalized || DEFAULT_LEOPARDS_ORIGIN_CITY_ID;
    }
  }

  return DEFAULT_LEOPARDS_ORIGIN_CITY_ID;
}

export type LeopardsShipperDetails = {
  origin_city: string;
  /** Official Leopards bookPacket shipper fields. */
  shipment_name_eng: string;
  shipment_email: string;
  shipment_phone: string;
  shipment_address: string;
  /** Explicit aliases also sent so slip/return address never fall back to merchant defaults. */
  shipper_name: string;
  shipper_email: string;
  shipper_phone: string;
  shipper_address: string;
  return_address: string;
  shipper_id: string;
};

/**
 * Resolve shipper identity for bookPacket.
 * Never falls back to "self" or placeholder phones like 03001234567.
 */
export function resolveLeopardsShipperDetails(
  shipperIdRaw?: string | number | null,
  originCityRaw?: string | number | null,
): LeopardsShipperDetails {
  const name =
    cleanLeopardsEnvValue(process.env.LEOPARDS_SHIPPER_NAME) ||
    DEFAULT_LEOPARDS_SHIPPER_NAME;
  const email =
    cleanLeopardsEnvValue(process.env.LEOPARDS_SHIPPER_EMAIL) ||
    DEFAULT_LEOPARDS_SHIPPER_EMAIL;
  const phone =
    cleanLeopardsEnvValue(process.env.LEOPARDS_SHIPPER_PHONE) ||
    DEFAULT_LEOPARDS_SHIPPER_PHONE;
  const address =
    cleanLeopardsEnvValue(process.env.LEOPARDS_SHIPPER_ADDRESS) ||
    DEFAULT_LEOPARDS_SHIPPER_ADDRESS;

  return {
    origin_city: resolveLeopardsOriginCityId(originCityRaw),
    shipment_name_eng: name,
    shipment_email: email,
    shipment_phone: phone,
    shipment_address: address,
    shipper_name: name,
    shipper_email: email,
    shipper_phone: phone,
    shipper_address: address,
    return_address: address,
    shipper_id: resolveLeopardsShipperId(shipperIdRaw),
  };
}
