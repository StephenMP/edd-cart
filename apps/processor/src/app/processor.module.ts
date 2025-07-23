import { Module } from '@nestjs/common';

import { DbModule } from '@edd-cart/db';
import { ProcessorController } from './processor.controller';
import { ProcessorService } from './processor.service';
import { CouponService } from './coupon.service';
import { CartTotalCalculationService } from './cart-total-calculation.service';

@Module({
  imports: [DbModule],
  controllers: [ProcessorController],
  providers: [ProcessorService, CouponService, CartTotalCalculationService],
})
export class ProcessorModule {}
