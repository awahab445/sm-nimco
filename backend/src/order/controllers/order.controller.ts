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

  /**
   * Create order from cart
   * POST /orders
   */
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

  /**
   * Get current customer's orders. Requires Bearer token.
   * GET /orders/my
   */
  @Get('my')
  @UseGuards(CustomerJwtAuthGuard)
  async findMyOrders(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: CustomerJwtPayload,
  ) {
    return this.orderService.findAll(query, user.customerId);
  }

  /**
   * Track order via email + order number (public-safe lookup)
   * GET /orders/track?orderNumber=...&email=...
   */
  @Get('track')
  async trackOrder(
    @Query('orderNumber') orderNumber: string,
    @Query('email') email: string,
  ) {
    return this.orderService.trackByOrderNumberAndEmail(orderNumber, email);
  }

  /**
   * Get order by ID (customer/admin JWT required; customer ownership enforced)
   * GET /orders/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() request: any) {
    const customerId = request.user?.typ === 'customer' ? request.user.customerId : undefined;
    return this.orderService.findOneById(id, customerId);
  }

  /**
   * Get order by order number (customer/admin JWT required; customer ownership enforced)
   * GET /orders/number/:orderNumber
   */
  @Get('number/:orderNumber')
  @UseGuards(JwtAuthGuard)
  async findOneByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @Req() request: any,
  ) {
    const customerId = request.user?.typ === 'customer' ? request.user.customerId : undefined;
    return this.orderService.findOneByOrderNumber(orderNumber, customerId);
  }

  /**
   * List orders (admin or with customerId from token when implemented)
   * GET /orders
   */
  @Get()
  @UseGuards(CustomerJwtAuthGuard)
  async findAll(@Query() query: OrderQueryDto & { customerEmail?: string }, @Req() request: any) {
    const customerId = request.user?.customerId || undefined;
    return this.orderService.findAll(query, customerId);
  }
}

