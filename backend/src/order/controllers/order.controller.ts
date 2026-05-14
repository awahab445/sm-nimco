import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { CustomerJwtAuthGuard } from '../../auth/guards/customer-jwt-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CustomerJwtPayload } from '../../auth/strategies/jwt.strategy';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: any,
  ) {
    const requestMetadata = {
      ipAddress: request.ip || request.headers['x-forwarded-for'] || undefined,
      userAgent: request.headers['user-agent'] || undefined,
    };

    return this.orderService.createOrder(createOrderDto, requestMetadata);
  }

  @Get('my')
  @UseGuards(CustomerJwtAuthGuard)
  async findMyOrders(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: CustomerJwtPayload,
  ) {
    return this.orderService.findAll(query, user.customerId);
  }

  @Get('track')
  async trackOrder(
    @Query('orderNumber') orderNumber: string,
    @Query('email') email: string,
  ) {
    return this.orderService.trackByOrderNumberAndEmail(orderNumber, email);
  }

  @Get('number/:orderNumber')
  @UseGuards(JwtAuthGuard)
  async findOneByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @Req() request: any,
  ) {
    const customerId = request.user?.typ === 'customer' ? request.user.customerId : undefined;
    return this.orderService.findOneByOrderNumber(orderNumber, customerId);
  }

  @Get()
  @UseGuards(CustomerJwtAuthGuard)
  async findAll(@Query() query: OrderQueryDto & { customerEmail?: string }, @Req() request: any) {
    const customerId = request.user?.customerId || undefined;
    return this.orderService.findAll(query, customerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() request: any) {
    const customerId = request.user?.typ === 'customer' ? request.user.customerId : undefined;
    return this.orderService.findOneById(id, customerId);
  }
}
