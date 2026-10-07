import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsUUID,
} from 'class-validator';
import {
  BOOK_LEOPARDS_SHIPMENT_TYPES,
  type BookLeopardsShipmentType,
} from './book-leopards.dto';

function normalizeShipmentType(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toUpperCase();
  return normalized || undefined;
}

/**
 * Body for POST /admin/shipping/leopards/bulk-book
 */
export class BulkBookLeopardsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  orderIds!: string[];

  @IsOptional()
  @Transform(({ value, obj }) => {
    const fromShipment = normalizeShipmentType(value);
    if (fromShipment) return fromShipment;
    const record = obj as Record<string, unknown>;
    return (
      normalizeShipmentType(record.serviceType) ??
      normalizeShipmentType(record.shipment_type) ??
      normalizeShipmentType(record.service_type)
    );
  })
  @IsIn([...BOOK_LEOPARDS_SHIPMENT_TYPES], {
    message: `shipmentType must be one of: ${BOOK_LEOPARDS_SHIPMENT_TYPES.join(', ')}`,
  })
  shipmentType?: BookLeopardsShipmentType;

  @IsOptional()
  @Transform(({ value }) => normalizeShipmentType(value))
  @IsIn([...BOOK_LEOPARDS_SHIPMENT_TYPES], {
    message: `serviceType must be one of: ${BOOK_LEOPARDS_SHIPMENT_TYPES.join(', ')}`,
  })
  serviceType?: BookLeopardsShipmentType;
}
