import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  StreamableFile,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';
import {
  GenerateLeopardsLoadsheetDto,
  ListLeopardsBookedOrdersQueryDto,
} from '../dto/leopards-loadsheet.dto';
import { LeopardsLoadsheetService } from '../services/leopards-loadsheet.service';

/**
 * Admin Leopards loadsheet operations.
 * Base: /admin/shipping/loadsheets
 */
@Controller('admin/shipping/loadsheets')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminLeopardsLoadsheetController {
  constructor(private readonly loadsheetService: LeopardsLoadsheetService) {}

  /**
   * List booked Leopards packets for loadsheet selection.
   * GET /admin/shipping/loadsheets/booked-packets
   */
  @Get('booked-packets')
  @RequirePermissions('shipping.manage')
  async listBookedPackets(@Query() query: ListLeopardsBookedOrdersQueryDto) {
    return this.loadsheetService.listBookedOrders(query ?? {});
  }

  /**
   * Generate a Leopards loadsheet for selected CNs / orders.
   * POST /admin/shipping/loadsheets/generate
   */
  @Post('generate')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async generateLoadsheet(@Body() dto: GenerateLeopardsLoadsheetDto) {
    return this.loadsheetService.generateLoadsheet(dto ?? {});
  }

  /**
   * List persisted loadsheets for reprint history.
   * GET /admin/shipping/loadsheets/history
   */
  @Get('history')
  @RequirePermissions('shipping.manage')
  async listLoadsheets() {
    return this.loadsheetService.listLoadsheets();
  }

  /**
   * Print / reprint stored (or re-fetched) loadsheet PDF.
   * GET /admin/shipping/loadsheets/:id/print
   */
  @Get(':id/print')
  @RequirePermissions('shipping.manage')
  @Header('Content-Type', 'application/pdf')
  async printLoadsheet(@Param('id') id: string): Promise<StreamableFile> {
    const pdf = await this.loadsheetService.reprintLoadsheetPdf(id);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `inline; filename="leopards-loadsheet-${id}.pdf"`,
    });
  }

  /**
   * Fetch a stored loadsheet manifest (packets + URLs) for the print modal.
   * GET /admin/shipping/loadsheets/:id
   */
  @Get(':id')
  @RequirePermissions('shipping.manage')
  async getLoadsheet(@Param('id') id: string) {
    return this.loadsheetService.getLoadsheetManifest(id);
  }
}
