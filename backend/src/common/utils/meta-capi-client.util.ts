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
  fbLoginId?: string;
}): MetaCapiClientDto {
  return {
    eventId: dto.meta?.eventId ?? dto.eventId,
    fbp: dto.meta?.fbp ?? dto.fbp,
    fbc: dto.meta?.fbc ?? dto.fbc,
    eventSourceUrl: dto.meta?.eventSourceUrl ?? dto.eventSourceUrl,
    externalId: dto.meta?.externalId ?? dto.externalId,
    email: dto.meta?.email ?? dto.email,
    phone: dto.meta?.phone ?? dto.phone,
    fbLoginId: dto.meta?.fbLoginId ?? dto.fbLoginId,
  };
}
