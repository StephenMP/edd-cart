import { EventBase } from './event.base';

export class CouponRemovedEvent extends EventBase {
  constructor(public readonly cartId: string, public readonly couponCode: string) {
    super();
  }

  public static get EVENT_PATTERN(): string {
    return 'cart.coupon-removed';
  }
}
