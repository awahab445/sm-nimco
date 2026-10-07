import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

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

/**
 * Body for POST /admin/shipping/leopards/book/:orderId
 * Accepts `shipmentType`, `serviceType`, or snake_case aliases.
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
}
