import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TaxService } from '../services/tax.service';
import { CreateTaxClassDto } from '../dto/create-tax-class.dto';
import { CreateTaxDto } from '../dto/create-tax.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('tax.manage')
  async createTaxClass(@Body() dto: CreateTaxClassDto) {
    return this.taxService.createTaxClass(dto);
  }

  @Get('classes')
  async findAllTaxClasses() {
    return this.taxService.findAllTaxClasses();
  }

  @Get('classes/:id')
  async findTaxClassById(@Param('id') id: string) {
    return this.taxService.findTaxClassById(id);
  }

  @Put('classes/:id')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('tax.manage')
  async updateTaxClass(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaxClassDto>,
  ) {
    return this.taxService.updateTaxClass(id, dto);
  }

  @Delete('classes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('tax.manage')
  async deleteTaxClass(@Param('id') id: string) {
    await this.taxService.deleteTaxClass(id);
  }

  @Post('taxes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('tax.manage')
  async createTax(@Body() dto: CreateTaxDto) {
    return this.taxService.createTax(dto);
  }

  @Get('taxes')
  async findAllTaxes() {
    return this.taxService.findAllTaxes();
  }

  @Get('taxes/:id')
  async findTaxById(@Param('id') id: string) {
    return this.taxService.findTaxById(id);
  }

  @Put('taxes/:id')
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('tax.manage')
  async updateTax(@Param('id') id: string, @Body() dto: Partial<CreateTaxDto>) {
    return this.taxService.updateTax(id, dto);
  }

  @Delete('taxes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
  @RequirePermissions('tax.manage')
  async deleteTax(@Param('id') id: string) {
    await this.taxService.deleteTax(id);
  }
}
