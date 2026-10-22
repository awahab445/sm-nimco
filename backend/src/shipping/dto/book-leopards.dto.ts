import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

/** Admin/API service type codes for Leopards booking (ESSA-compatible). */
export const BOOK_LEOPARDS_SHIPMENT_TYPES = [
  'OVERNIGHT',
  'OVERLAND',
  'DETAIN',
] as const;

export type BookLeopardsShipmentType =
  (typeof BOOK_LEOPARDS_SHIPMENT_TYPES)[number];

function normalizeShipmentTypeInput(
  value: unknown,
  obj: Record<string, unknown>,
): string | undefined {
  const fromValue = typeof value === 'string' ? value : undefined;
  const fromServiceType =
    typeof obj.serviceType === 'string' ? obj.serviceType : undefined;
  const fromSnake =
    typeof obj.shipment_type === 'string' ? obj.shipment_type : undefined;
  const fromServiceSnake =
    typeof obj.service_type === 'string' ? obj.service_type : undefined;
  const raw = fromValue ?? fromServiceType ?? fromSnake ?? fromServiceSnake;
  if (raw == null) return undefined;
  const normalized = raw.trim().toUpperCase();
  return normalized || undefined;
}

function normalizeWeightGramsInput(
  value: unknown,
  obj: Record<string, unknown>,
): number | undefined {
  const raw =
    value ??
    obj.weight_grams ??
    obj.booked_packet_weight ??
    obj.bookedPacketWeight;
  if (raw == null || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.floor(n);
}

/**
 * Body for POST /admin/shipping/leopards/book/:orderId
 * Accepts `shipmentType`, `serviceType`, or snake_case aliases.
 * Optional `weightGrams` / `weight_grams` overrides auto-calculated packet weight.
 */
export class BookLeopardsDto {
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  /**
   * Service type: OVERNIGHT (Air), OVERLAND (Surface/Cargo), DETAIN (Economy).
   */
  @IsOptional()
  @Transform(({ value, obj }) =>
    normalizeShipmentTypeInput(value, obj as Record<string, unknown>),
  )
  @IsIn([...BOOK_LEOPARDS_SHIPMENT_TYPES], {
    message: `shipmentType must be one of: ${BOOK_LEOPARDS_SHIPMENT_TYPES.join(', ')}`,
  })
  shipmentType?: BookLeopardsShipmentType;

  /** Alias for shipmentType (admin UI / ESSA parity). */
  @IsOptional()
  @Transform(({ value, obj }) =>
    normalizeShipmentTypeInput(value, obj as Record<string, unknown>),
  )
  @IsIn([...BOOK_LEOPARDS_SHIPMENT_TYPES], {
    message: `serviceType must be one of: ${BOOK_LEOPARDS_SHIPMENT_TYPES.join(', ')}`,
  })
  serviceType?: BookLeopardsShipmentType;

  /**
   * Manual parcel weight in grams (scale weight). When >= 1, sent as
   * booked_packet_weight to Leopards; otherwise order calculated weight is used.
   */
  @IsOptional()
  @Transform(({ value, obj }) =>
    normalizeWeightGramsInput(value, obj as Record<string, unknown>),
  )
  @IsInt()
  @Min(1)
  weightGrams?: number;
}
