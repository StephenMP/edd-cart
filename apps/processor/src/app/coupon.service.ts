import { CouponAddedEvent, CouponRemovedEvent } from '@edd-cart/core';
import { CartEntity, PrismaService } from '@edd-cart/db';
import { Injectable, Logger } from '@nestjs/common';
import { err, fromPromise, ok, Result } from 'neverthrow';

@Injectable()
export class CouponService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(`Coupon.${this.constructor.name}`);
  }

  public async handleCouponAddedEvent(event: CouponAddedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId, couponCode } = event;

    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        coupon: true,
        cart_products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return err(new Error('Cart not found'));
    }

    if (cart.coupon && cart.coupon.code !== couponCode) {
      return err(new Error('Another coupon already exists on cart'));
    }

    if (cart.coupon?.code === couponCode) {
      return err(new Error('Coupon already exists on cart'));
    }

    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: couponCode,
      },
    });

    if (!coupon) {
      return err(new Error('Coupon not found'));
    }
    if (!coupon.is_active) {
      return err(new Error('Coupon is not active'));
    }

    return await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          coupon: {
            connect: {
              id: coupon.id,
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
  }

  public async handleCouponRemovedEvent(event: CouponRemovedEvent): Promise<Result<CartEntity, Error>> {
    const { cartId, couponCode } = event;

    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        coupon: true,
        cart_products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return err(new Error('Cart not found'));
    }

    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: couponCode,
      },
    });

    if (!coupon) {
      return err(new Error('Coupon not found'));
    }

    if (cart.coupon?.code !== couponCode) {
      return err(new Error('Coupon not on cart'));
    }

    return await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          coupon: {
            disconnect: true,
          },
        },
        include: {
          cart_products: true,
          coupon: true,
        },
      }),
      (err: Error) => err,
    );
  }
}
