import { CartEntity, PrismaService } from '@edd-cart/db';
import { Injectable, Logger } from '@nestjs/common';
import { CouponLevel, CouponType } from '@prisma/client';
import { err, fromPromise, ok, Result } from 'neverthrow';

@Injectable()
export class CartTotalCalculationService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(`CartTotalCalculation.${this.constructor.name}`);
  }

  public async calculateCartTotal(cartId: string): Promise<Result<CartEntity, Error>> {
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

    const subTotal = cart.cart_products.reduce((acc, product) => acc + product.product.price * product.quantity, 0);
    let total = subTotal;

    if (cart.coupon) {
      const { discount, type, level, product_id } = cart.coupon;
      if (type === CouponType.FIXED && level === CouponLevel.CART && total < discount) {
        return err(new Error('Total is less than discount'));
      }

      // Handle Product Level First
      if (level === CouponLevel.PRODUCT) {
        const product = cart.cart_products.find((product) => product.product.id === product_id);
        if (product) {
          if (type === CouponType.FIXED) {
            total = total - discount;
          } else {
            const productPercentDiscount = product.product.price * product.quantity * (discount / 100);
            total = total - productPercentDiscount;
          }
        }
      }

      // Handle Cart Level
      if (level === CouponLevel.CART) {
        if (type === CouponType.FIXED) {
          total = total - discount;
        } else {
          total = total * (1 - discount / 100);
        }
      }
    }

    return await fromPromise(
      this.prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          total: total,
          sub_total: subTotal,
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
