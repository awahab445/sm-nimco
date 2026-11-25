import type { MetaCapiClientDto } from '../dto/meta-capi-client.dto';

/** Normalize flat or nested Meta client fields from cart/checkout DTOs. */
export function resolveMetaCapiClient(dto: {
  meta?: MetaCapiClientDto;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  externalId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbLoginId?: string;
  ttp?: string;
  ttclid?: string;
}): MetaCapiClientDto {
  return {
    eventId: dto.meta?.eventId ?? dto.eventId,
    fbp: dto.meta?.fbp ?? dto.fbp,
    fbc: dto.meta?.fbc ?? dto.fbc,
    eventSourceUrl: dto.meta?.eventSourceUrl ?? dto.eventSourceUrl,
    externalId: dto.meta?.externalId ?? dto.externalId,
    email: dto.meta?.email ?? dto.email,
    phone: dto.meta?.phone ?? dto.phone,
    firstName: dto.meta?.firstName ?? dto.firstName,
    lastName: dto.meta?.lastName ?? dto.lastName,
    fbLoginId: dto.meta?.fbLoginId ?? dto.fbLoginId,
    ttp: dto.meta?.ttp ?? dto.ttp,
    ttclid: dto.meta?.ttclid ?? dto.ttclid,
  };
}
