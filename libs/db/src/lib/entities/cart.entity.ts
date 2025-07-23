import { ApiProperty } from '@nestjs/swagger';
import { Coupon, Prisma, CartProduct } from '@prisma/client';

export class CartEntity implements Prisma.CartGetPayload<{ include: { cart_products: true; coupon: true } }> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  sub_total: number;

  @ApiProperty()
  total: number;

  cart_products: CartProduct[];

  coupon: Coupon;
}
