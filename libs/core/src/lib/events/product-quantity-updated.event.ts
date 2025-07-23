import { EventBase } from './event.base';

export class ProductQuantityUpdatedEvent extends EventBase {
  constructor(public readonly cartId: string, public readonly productId: string, public readonly quantity: number) {
    super();
  }

  public static get EVENT_PATTERN(): string {
    return 'cart.product-quantity-updated';
  }
}
