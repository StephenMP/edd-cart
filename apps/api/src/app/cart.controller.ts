import { CartEntity } from '@edd-cart/db';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { failWhale } from 'fail-whale';
import { AddCouponDTO } from '../dto/add-coupon.dto';
import { AddProductDTO } from '../dto/add-product.dto';
import { RemoveCouponDTO } from '../dto/remove-coupon.dto';
import { RemoveProductDTO } from '../dto/remove-product.dto';
import { CartService } from './cart.service';

@Controller('carts')
export class CartController {
  private readonly logger: Logger;
  constructor(private readonly cartService: CartService) {
    this.logger = new Logger('API.CartController');
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The cart ID',
    type: String,
  })
  @ApiOperation({
    summary: 'Creates a Cart',
  })
  public async createCart(): Promise<string> {
    const result = await this.cartService.createCart();
    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.value;
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The cart record',
    type: CartEntity,
  })
  @ApiOperation({
    summary: 'Deletes a Cart',
  })
  public async deleteCartById(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.cartService.deleteCartById(id);
    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
  })
  @ApiOperation({
    summary: 'Clears a Cart',
  })
  public async clearCart(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const result = await this.cartService.clearCart(id);
    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Returns a Cart record matching the provided id',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the cart to read (uuid)',
  })
  @ApiResponse({
    status: 200,
    description: 'A Cart record',
    type: CartEntity,
  })
  public async getCartById(@Param('id', ParseUUIDPipe) id: string): Promise<CartEntity> {
    const result = await this.cartService.getCartById(id);
    if (result.isOk()) {
      if (result.value) {
        return result.value;
      }

      throw new NotFoundException();
    }

    failWhale(result.error.message, this.logger);
    throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Get()
  @ApiOperation({
    summary: 'Returns a specified, or 100 if unspecified, number of Carts (max 100)',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Skip x records (use for pagination)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: 'How many records to return. Defaults to 100',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'An array of Carts',
    type: [CartEntity],
  })
  public async getAllCarts(@Query('take') skip?: number, @Query('take') take?: number): Promise<CartEntity[]> {
    const result = await this.cartService.getAllCarts(skip || 0, take || 100);
    if (result.isOk()) {
      return result.value;
    }

    failWhale(result.error.message, this.logger);
    throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Post(':id/product')
  @ApiOperation({
    summary: 'Adds a Product to a Cart',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the cart to add the product to',
  })
  @ApiBody({
    type: AddProductDTO,
    description: 'The product and quantity to add to the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'A Cart record',
    type: CartEntity,
  })
  public async addProductToCart(@Param('id', ParseUUIDPipe) id: string, @Body() addProductDTO: AddProductDTO) {
    const { productId, quantity } = addProductDTO;
    const result = await this.cartService.addProductToCart(id, productId, quantity);
    if (result.isOk()) {
      if (!result.value) {
        throw new NotFoundException();
      }
    } else {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id/product')
  @ApiOperation({
    summary: 'Removes a Product from a Cart',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the cart to remove the product from',
  })
  @ApiBody({
    type: RemoveProductDTO,
    description: 'The ID of the product to remove from the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'A Cart record',
    type: CartEntity,
  })
  public async removeProductFromCart(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() removeProductDTO: RemoveProductDTO,
  ) {
    const { productId } = removeProductDTO;
    const result = await this.cartService.removeProductFromCart(id, productId);
    if (result.isOk()) {
      if (!result.value) {
        throw new NotFoundException();
      }
    } else {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/coupon')
  @ApiOperation({
    summary: 'Adds a Coupon to a Cart',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the cart to add the coupon to',
  })
  @ApiBody({
    type: AddCouponDTO,
    description: 'The coupon code to add to the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'A Cart record',
    type: CartEntity,
  })
  public async addCouponToCart(@Param('id', ParseUUIDPipe) id: string, @Body() addCouponDTO: AddCouponDTO) {
    const { couponCode } = addCouponDTO;
    const result = await this.cartService.addCouponToCart(id, couponCode);
    if (result.isOk()) {
      if (!result.value) {
        throw new NotFoundException();
      }
    } else {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id/coupon')
  @ApiOperation({
    summary: 'Removes a Coupon from a Cart',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the cart to remove the coupon from',
  })
  @ApiBody({
    type: RemoveCouponDTO,
    description: 'The coupon code to remove from the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'A Cart record',
    type: CartEntity,
  })
  public async removeCouponFromCart(@Param('id', ParseUUIDPipe) id: string, @Body() removeCouponDTO: RemoveCouponDTO) {
    const { couponCode } = removeCouponDTO;
    const result = await this.cartService.removeCouponFromCart(id, couponCode);
    if (result.isOk()) {
      if (!result.value) {
        throw new NotFoundException();
      }
    } else {
      failWhale(result.error.message, this.logger);
      throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
