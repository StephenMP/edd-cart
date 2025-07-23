import { ApiProperty } from '@nestjs/swagger';
import { CartProduct, Prisma } from '@prisma/client';

export class ProductEntity implements Prisma.ProductGetPayload<{ include: { cartItems: true } }> {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public created_at: Date;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public price: number;

  public cartItems: CartProduct[];
}
