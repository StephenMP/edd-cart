import {
  CartClearedEvent,
  CartCreatedEvent,
  CartDeletedEvent,
  ProductAddedEvent,
  ProductQuantityUpdatedEvent,
  ProductRemovedEvent,
} from '@edd-cart/core';
import { CartEntity, PrismaService } from '@edd-cart/db';
import { Injectable, Logger } from '@nestjs/common';
import { err, fromPromise, ok, Result } from 'neverthrow';
import { v4 } from 'uuid';

@Injectable()
export class ProcessorService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(`Reference.${this.constructor.name}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleCartCreatedEvent(event: CartCreatedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId } = event;
    const result = await fromPromise(
      this.prisma.cart.create({
        data: {
          id: cartId,
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );

    if (result.isOk()) {
      return ok(result.value);
    }

    return err(result.error);
  }

  public async handleCartDeletedEvent(event: CartDeletedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId } = event;
    const result = await fromPromise(
      this.prisma.cart.delete({
        where: {
          id: cartId,
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );

    if (result.isOk()) {
      return ok(result.value);
    }

    return err(result.error);
  }

  public async handleCartClearedEvent(event: CartClearedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId } = event;
    const result = await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          total: 0,
          sub_total: 0,
          coupon: {
            disconnect: true,
          },
          cart_products: {
            deleteMany: {},
          },
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );

    if (result.isOk()) {
      return ok(result.value);
    }

    return err(result.error);
  }

  public async handleProductAddedEvent(event: ProductAddedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId, productId, quantity } = event;

    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
    });

    if (!cart) {
      return err(new Error('Cart not found'));
    }

    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return err(new Error('Product not found'));
    }

    const total = cart.total + product.price * quantity;

    const result = await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          total,
          cart_products: {
            create: {
              product: {
                connect: {
                  id: productId,
                },
              },
              quantity,
            },
          },
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );

    if (result.isOk()) {
      return ok(result.value);
    }

    return err(result.error);
  }

  public async handleProductRemovedEvent(event: ProductRemovedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId, productId } = event;
    const result = await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          cart_products: {
            delete: {
              cart_id_product_id: {
                cart_id: cartId,
                product_id: productId,
              },
            },
          },
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );

    if (result.isOk()) {
      return ok(result.value);
    }

    return err(result.error);
  }

  public async handleProductQuantityUpdatedEvent(
    event: ProductQuantityUpdatedEvent,
  ): Promise<Result<CartEntity, Error>> {
    const { cartId, productId, quantity } = event;
    const result = await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          cart_products: {
            update: {
              where: {
                cart_id_product_id: {
                  cart_id: cartId,
                  product_id: productId,
                },
              },
              data: {
                quantity,
              },
            },
          },
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );

    if (result.isOk()) {
      return ok(result.value);
    }

    return err(result.error);
  }
}
