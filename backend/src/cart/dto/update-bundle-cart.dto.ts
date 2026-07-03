import { IsInt, Min } from 'class-validator';

export class UpdateBundleCartDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
