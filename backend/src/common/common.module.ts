import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

/**
 * Shared Nest utilities. HttpModule is exported so feature modules
 * (e.g. AnalyticsModule → CapiService) can inject HttpService.
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 3,
    }),
  ],
  exports: [HttpModule],
})
export class CommonModule {}
