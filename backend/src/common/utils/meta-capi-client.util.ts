import type { MetaCapiClientDto } from '../dto/meta-capi-client.dto';

/** Normalize flat or nested Meta client fields from cart/checkout DTOs. */
export function resolveMetaCapiClient(dto: {
  meta?: MetaCapiClientDto;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}): MetaCapiClientDto {
  return {
    eventId: dto.meta?.eventId ?? dto.eventId,
    fbp: dto.meta?.fbp ?? dto.fbp,
    fbc: dto.meta?.fbc ?? dto.fbc,
    eventSourceUrl: dto.meta?.eventSourceUrl ?? dto.eventSourceUrl,
  };
}
