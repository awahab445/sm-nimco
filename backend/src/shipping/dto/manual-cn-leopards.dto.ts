import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

function normalizeTrackingCnInput(
  value: unknown,
  obj: Record<string, unknown>,
): string {
  const fromTrackingCn =
    typeof value === 'string'
      ? value
      : typeof obj.trackingCn === 'string'
        ? obj.trackingCn
        : undefined;
  const fromTrackingNumber =
    typeof obj.trackingNumber === 'string' ? obj.trackingNumber : undefined;
  const fromSnake =
    typeof obj.tracking_cn === 'string'
      ? obj.tracking_cn
      : typeof obj.tracking_number === 'string'
        ? obj.tracking_number
        : undefined;
  const raw = fromTrackingCn ?? fromTrackingNumber ?? fromSnake ?? '';
  return String(raw).trim();
}

/**
 * Body for PATCH /admin/shipping/leopards/manual-cn/:orderId
 * Assign a CN booked externally on the Leopards portal.
 * Accepts `trackingCn` (preferred) or `trackingNumber` / snake_case aliases.
 */
export class ManualCnLeopardsDto {
  @Transform(({ value, obj }) =>
    normalizeTrackingCnInput(value, obj as Record<string, unknown>),
  )
  @IsString()
  @IsNotEmpty({ message: 'trackingCn is required' })
  @MinLength(1, { message: 'trackingCn cannot be empty' })
  trackingCn!: string;
}
