import { IsEnum } from 'class-validator';

/** Admin-only lifecycle updates (not `expired`; that is set by system jobs). */
export enum PatchablePromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export class PatchPromotionDto {
  @IsEnum(PatchablePromotionStatus)
  status: PatchablePromotionStatus;
}
