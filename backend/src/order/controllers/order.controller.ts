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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtValidatePayload } from '../../auth/strategies/jwt.strategy';

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
  @UseGuards(JwtAuthGuard)
  async findMyOrders(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: JwtValidatePayload,
  ) {
    return this.orderService.findAll(query, user.customerId);
  }

  /**
   * Get order by ID (public; ownership not enforced - use for success page by orderId)
   * GET /orders/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: any) {
    const customerId = request.user?.customerId || undefined;
    return this.orderService.findOneById(id, customerId);
  }

  /**
   * Get order by order number
   * GET /orders/number/:orderNumber
   */
  @Get('number/:orderNumber')
  async findOneByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @Req() request: any,
  ) {
    const customerId = request.user?.customerId || undefined;
    return this.orderService.findOneByOrderNumber(orderNumber, customerId);
  }

  /**
   * List orders (admin or with customerId from token when implemented)
   * GET /orders
   */
  @Get()
  async findAll(@Query() query: OrderQueryDto & { customerEmail?: string }, @Req() request: any) {
    const customerId = request.user?.customerId || undefined;
    return this.orderService.findAll(query, customerId);
  }
}

