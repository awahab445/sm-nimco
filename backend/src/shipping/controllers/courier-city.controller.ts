import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CourierCityService } from '../services/courier-city.service';

@Controller('shipping')
export class CourierCityController {
  constructor(private readonly courierCityService: CourierCityService) {}

  @Get('provinces')
  async getProvinces() {
    return this.courierCityService.getProvinces();
  }

  @Get('cities')
  async getCities(@Query('province') province?: string) {
    return this.courierCityService.getActiveCities(province);
  }

  @Get('cities/:id')
  async getCity(@Param('id') id: string) {
    const city = await this.courierCityService.getCityById(id);
    if (!city) throw new NotFoundException(`City ${id} not found`);
    return city;
  }
}
