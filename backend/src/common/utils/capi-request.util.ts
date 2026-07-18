import type { Request } from 'express';
import type { CapiUserData } from '../services/capi.service';
import type { MetaCapiClientDto } from '../dto/meta-capi-client.dto';

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

function stripPiiFromUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
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

export function clientIpFromRequest(req?: Request): string | undefined {
  if (!req) return undefined;
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) {
    return xf.split(',')[0]?.trim();
  }
  if (Array.isArray(xf) && xf[0]) {
    return String(xf[0]).split(',')[0]?.trim();
  }
  return req.ip || req.socket?.remoteAddress || undefined;
}

export function userAgentFromRequest(req?: Request): string | undefined {
  if (!req) return undefined;
  const ua = req.headers['user-agent'];
  return typeof ua === 'string' ? ua : undefined;
}

/** Merge browser Meta cookies/event fields with request IP/UA. */
export function buildCapiUserData(
  meta: MetaCapiClientDto | undefined,
  req: Request | undefined,
  extras?: { email?: string | null; phone?: string | null },
): CapiUserData {
  return {
    fbp: meta?.fbp?.trim() || null,
    fbc: meta?.fbc?.trim() || null,
    event_source_url: stripPiiFromUrl(meta?.eventSourceUrl),
    client_ip_address: clientIpFromRequest(req) || null,
    client_user_agent: userAgentFromRequest(req) || null,
    email: extras?.email?.trim() || null,
    phone: extras?.phone?.trim() || null,
  };
}
