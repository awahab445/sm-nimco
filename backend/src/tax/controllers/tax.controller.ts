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
} from '@nestjs/common';
import { TaxService } from '../services/tax.service';
import { CreateTaxClassDto } from '../dto/create-tax-class.dto';
import { CreateTaxDto } from '../dto/create-tax.dto';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  // ============================================================================
  // Tax Class Endpoints
  // ============================================================================

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
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
  async updateTaxClass(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaxClassDto>,
  ) {
    return this.taxService.updateTaxClass(id, dto);
  }

  @Delete('classes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaxClass(@Param('id') id: string) {
    await this.taxService.deleteTaxClass(id);
  }

  // ============================================================================
  // Tax Endpoints
  // ============================================================================

  @Post('taxes')
  @HttpCode(HttpStatus.CREATED)
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
  async updateTax(@Param('id') id: string, @Body() dto: Partial<CreateTaxDto>) {
    return this.taxService.updateTax(id, dto);
  }

  @Delete('taxes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTax(@Param('id') id: string) {
    await this.taxService.deleteTax(id);
  }
}

