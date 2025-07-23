import {
  CartClearedEvent,
  CartCreatedEvent,
  CartDeletedEvent,
  CouponAddedEvent,
  CouponRemovedEvent,
  InjectionTokens,
  ProductAddedEvent,
  ProductQuantityUpdatedEvent,
  ProductRemovedEvent,
} from '@edd-cart/core';
import { CartEntity, PrismaService } from '@edd-cart/db';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { v4 } from 'uuid';
import { err, fromPromise, ok, Result } from 'neverthrow';
import { Observable } from 'rxjs';

@Injectable()
export class CartService {
  constructor(
    @Inject(InjectionTokens.PROCESSOR) private readonly processorClient: ClientKafka,
    private readonly prisma: PrismaService,
  ) {}

  public async createCart(): Promise<Result<string, Error>> {
    const cartId = v4();
    this.processorClient.emit(CartCreatedEvent.EVENT_PATTERN, new CartCreatedEvent(cartId));
    return ok(cartId);
  }

  public async deleteCartById(id: string): Promise<Result<Observable<any>, Error>> {
    return ok(this.processorClient.emit(CartDeletedEvent.EVENT_PATTERN, new CartDeletedEvent(id)));
  }

  public async clearCart(cartId: string): Promise<Result<Observable<any>, Error>> {
    return ok(this.processorClient.emit(CartClearedEvent.EVENT_PATTERN, new CartClearedEvent(cartId)));
  }

  public async getCartById(id: string): Promise<Result<CartEntity | null, Error>> {
    return await fromPromise(
      this.prisma.cart.findFirst({
        where: {
          id,
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );
  }

  public async getAllCarts(skip: number, take: number): Promise<Result<CartEntity[], Error>> {
    return await fromPromise(
      this.prisma.cart.findMany({
        skip,
        take: take > 100 ? 100 : take,
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );
  }

  public async addProductToCart(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<Result<Observable<any>, Error>> {
    return ok(
      this.processorClient.emit(ProductAddedEvent.EVENT_PATTERN, new ProductAddedEvent(cartId, productId, quantity)),
    );
  }

  public async removeProductFromCart(cartId: string, productId: string): Promise<Result<Observable<any>, Error>> {
    return ok(this.processorClient.emit(ProductRemovedEvent.EVENT_PATTERN, new ProductRemovedEvent(cartId, productId)));
  }

  public async updateProductQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<Result<Observable<any>, Error>> {
    return ok(
      this.processorClient.emit(
        ProductQuantityUpdatedEvent.EVENT_PATTERN,
        new ProductQuantityUpdatedEvent(cartId, productId, quantity),
      ),
    );
  }

  public async addCouponToCart(cartId: string, couponCode: string): Promise<Result<Observable<any>, Error>> {
    return ok(this.processorClient.emit(CouponAddedEvent.EVENT_PATTERN, new CouponAddedEvent(cartId, couponCode)));
  }

  public async removeCouponFromCart(cartId: string, couponCode: string): Promise<Result<Observable<any>, Error>> {
    return ok(this.processorClient.emit(CouponRemovedEvent.EVENT_PATTERN, new CouponRemovedEvent(cartId, couponCode)));
  }
}
