import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RemoveProductDTO {
  @IsNotEmpty()
  @ApiProperty()
  public productId: string;

  constructor(productId: string) {
    this.productId = productId;
  }
}
