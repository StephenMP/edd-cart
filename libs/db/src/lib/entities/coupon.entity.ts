import { ApiProperty } from '@nestjs/swagger';
import { Cart, CouponLevel, CouponType, Prisma, Product } from '@prisma/client';

export class CouponEntity implements Prisma.CouponGetPayload<{ include: { cart: true } }> {
  @ApiProperty()
  product_id: string;

  product: Product;

  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  code: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  type: CouponType;

  @ApiProperty()
  level: CouponLevel;

  @ApiProperty()
  cart_id: string;

  public cart: Cart;

  @ApiProperty()
  is_active: boolean;
}
