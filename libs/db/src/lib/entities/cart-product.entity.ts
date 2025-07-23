import { ApiProperty } from '@nestjs/swagger';
import { Cart, Prisma, Product } from '@prisma/client';

export class CartProductEntity implements Prisma.CartProductGetPayload<{ include: { product: true } }> {
  @ApiProperty()
  public cart_id: string;
  
  public cart: Cart;

  @ApiProperty()
  public product_id: string;

  public product: Product;

  @ApiProperty()
  public id: string;

  @ApiProperty()
  public created_at: Date;

  @ApiProperty()
  public quantity: number;
}
