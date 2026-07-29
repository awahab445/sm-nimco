import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShippingRateService } from '../services/shipping-rate.service';
import {
  CalculateShippingFeeDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from '../dto/shipping-rate.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

/**
 * Public matrix rate calculation
 * POST /shipping/rates/calculate
 */
@Controller('shipping/rates')
export class ShippingRatesController {
  constructor(private readonly shippingRateService: ShippingRateService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculateFee(@Body() dto: CalculateShippingFeeDto) {
    const result =
      await this.shippingRateService.calculateShippingFeeFromDto(dto);
    return { success: true, data: result };
  }
}

/**
 * Admin shipping rate matrix management
 * Base: /admin/shipping-rates
 */
@Controller('admin/shipping-rates')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
export class AdminShippingRatesController {
  constructor(private readonly shippingRateService: ShippingRateService) {}

  @Get()
  @RequirePermissions('shipping.manage')
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.shippingRateService.listRates({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      province,
      city,
      search,
    });
  }

  @Post()
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateShippingRateDto) {
    return this.shippingRateService.create(dto);
  }

  @Post('upload-csv')
  @RequirePermissions('shipping.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const name = (file.originalname || '').toLowerCase();
        const mime = (file.mimetype || '').toLowerCase();
        const allowed =
          name.endsWith('.csv') ||
          name.endsWith('.xlsx') ||
          name.endsWith('.xls') ||
          mime.includes('csv') ||
          mime.includes('spreadsheet') ||
          mime.includes('excel');
        if (allowed) {
          cb(null, true);
          return;
        }
        cb(
          new BadRequestException(
            'Only .csv and .xlsx files are supported',
          ) as never,
          false,
        );
      },
    }),
  )
  @HttpCode(HttpStatus.OK)
  async uploadCsv(
    @UploadedFile()
    file:
      | { buffer: Buffer; originalname: string; mimetype?: string }
      | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('A .csv or .xlsx file is required');
    }
    const result = await this.shippingRateService.uploadCsv({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    return { success: true, data: result };
  }

  @Get(':id')
  @RequirePermissions('shipping.manage')
  async getById(@Param('id') id: string) {
    return this.shippingRateService.getById(id);
  }

  @Put(':id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateShippingRateDto) {
    return this.shippingRateService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('shipping.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.shippingRateService.delete(id);
  }
}
