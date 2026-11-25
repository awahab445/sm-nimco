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

function cookieFromRequest(
  req: Request | undefined,
  name: string,
): string | null {
  if (!req) return null;
  const cookies = (
    req as Request & { cookies?: Record<string, string | undefined> }
  ).cookies;
  const fromParser = cookies?.[name]?.trim();
  if (fromParser) {
    try {
      return decodeURIComponent(fromParser);
    } catch {
      return fromParser;
    }
  }
  const header = req.headers.cookie;
  if (typeof header !== 'string' || !header) return null;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  const raw = match.slice(name.length + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
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
  extras?: {
    email?: string | null;
    phone?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    external_id?: string | null;
    fb_login_id?: string | null;
  },
): CapiUserData {
  // Prefer explicit body fields; fall back to first-party `_fbc`/`_fbp` cookies
  // (same-origin Next proxy forwards Cookie) so CAPI still gets click IDs.
  const fbc = meta?.fbc?.trim() || cookieFromRequest(req, '_fbc') || null;
  const fbp = meta?.fbp?.trim() || cookieFromRequest(req, '_fbp') || null;

  return {
    fbp,
    fbc,
    event_source_url: stripPiiFromUrl(meta?.eventSourceUrl),
    client_ip_address: clientIpFromRequest(req) || null,
    client_user_agent: userAgentFromRequest(req) || null,
    email: extras?.email?.trim() || meta?.email?.trim() || null,
    phone: extras?.phone?.trim() || meta?.phone?.trim() || null,
    first_name: extras?.first_name?.trim() || meta?.firstName?.trim() || null,
    last_name: extras?.last_name?.trim() || meta?.lastName?.trim() || null,
    external_id:
      extras?.external_id?.trim() || meta?.externalId?.trim() || null,
    fb_login_id: extras?.fb_login_id?.trim() || meta?.fbLoginId?.trim() || null,
    ttp: meta?.ttp?.trim() || cookieFromRequest(req, '_ttp') || null,
    ttclid: meta?.ttclid?.trim() || cookieFromRequest(req, 'ttclid') || null,
  };
}
