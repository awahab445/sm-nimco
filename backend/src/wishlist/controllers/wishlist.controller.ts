import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { AddWishlistItemDto } from '../dto/add-wishlist-item.dto';
import { MergeWishlistDto } from '../dto/merge-wishlist.dto';
import { CustomerJwtAuthGuard } from '../../auth/guards/customer-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CustomerJwtPayload } from '../../auth/strategies/jwt.strategy';

@Controller('wishlist')
@UseGuards(CustomerJwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /** GET /wishlist — list wishlist products for the current customer. */
  @Get()
  findAll(@CurrentUser() user: CustomerJwtPayload) {
    return this.wishlistService.findAll(user.customerId);
  }

  /** GET /wishlist/count — badge count. */
  @Get('count')
  count(@CurrentUser() user: CustomerJwtPayload) {
    return this.wishlistService.count(user.customerId);
  }

  /** POST /wishlist — add a product. */
  @Post()
  add(
    @CurrentUser() user: CustomerJwtPayload,
    @Body() dto: AddWishlistItemDto,
  ) {
    return this.wishlistService.add(user.customerId, dto.productId);
  }

  /**
   * POST /wishlist/merge — merge guest localStorage product IDs after login.
   */
  @Post('merge')
  merge(
    @CurrentUser() user: CustomerJwtPayload,
    @Body() dto: MergeWishlistDto,
  ) {
    return this.wishlistService.merge(user.customerId, dto.productIds);
  }

  /** DELETE /wishlist/:productId — remove a product. */
  @Delete(':productId')
  remove(
    @CurrentUser() user: CustomerJwtPayload,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.remove(user.customerId, productId);
  }
}
