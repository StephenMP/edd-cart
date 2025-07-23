import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddProductDTO {
  @IsNotEmpty()
  @ApiProperty()
  public productId: string;

  @IsInt()
  @Min(1)
  @ApiProperty()
  public quantity: number;

  constructor(productId: string, quantity: number) {
    this.productId = productId;
    this.quantity = quantity;
  }
}
