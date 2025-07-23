import { EventBase } from './event.base';

export class ProductRemovedEvent extends EventBase {
  constructor(public readonly cartId: string, public readonly productId: string) {
    super();
  }

  public static get EVENT_PATTERN(): string {
    return 'cart.product-removed';
  }
}
