import { IsIn, IsString } from 'class-validator';
import { STORE_THEME_IDS } from '../constants/themes';

export class UpdateThemeDto {
  @IsString()
  @IsIn(STORE_THEME_IDS)
  theme!: string;
}
