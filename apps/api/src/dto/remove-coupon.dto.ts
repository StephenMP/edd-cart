import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RemoveCouponDTO {
  @IsNotEmpty()
  @ApiProperty()
  public couponCode: string;

  constructor(couponCode: string) {
    this.couponCode = couponCode;
  }
}
