import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

const AMOUNT_MIN = 0;
const AMOUNT_MAX = 10_000_000;

function toOptionalNumber({ value }: { value: unknown }): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export class UpdateStoreOrderSettingsDto {
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(AMOUNT_MIN)
  @Max(AMOUNT_MAX)
  minimumOrderAmount?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(AMOUNT_MIN)
  @Max(AMOUNT_MAX)
  freeDeliveryThreshold?: number;
}
