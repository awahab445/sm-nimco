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
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * POST /cart
   * Create a new cart
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCart() {
    return await this.cartService.createCart();
  }

  /**
   * GET /cart/:cartId
   * Fetch cart by ID
   */
  @Get(':cartId')
  async getCart(@Param('cartId') cartId: string) {
    return await this.cartService.getCart(cartId);
  }

  /**
   * POST /cart/:cartId/items
   * Add item to cart
   */
  @Post(':cartId/items')
  async addItemToCart(
    @Param('cartId') cartId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.cartService.addItemToCart(cartId, addToCartDto);
  }

  /**
   * PUT /cart/:cartId/items/:variantId
   * Update cart item quantity
   */
  @Put(':cartId/items/:variantId')
  async updateCartItem(
    @Param('cartId') cartId: string,
    @Param('variantId') variantId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateCartItem(cartId, variantId, updateDto);
  }

  /**
   * DELETE /cart/:cartId/items/:variantId
   * Remove item from cart
   */
  @Delete(':cartId/items/:variantId')
  async removeCartItem(
    @Param('cartId') cartId: string,
    @Param('variantId') variantId: string,
  ) {
    return await this.cartService.removeCartItem(cartId, variantId);
  }

  /**
   * DELETE /cart/:cartId
   * Clear cart (delete all items and release reservations)
   */
  @Delete(':cartId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param('cartId') cartId: string) {
    await this.cartService.clearCart(cartId);
  }
}

