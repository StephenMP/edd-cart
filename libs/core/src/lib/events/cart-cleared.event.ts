import { EventBase } from './event.base';

export class CartClearedEvent extends EventBase {
  constructor(public readonly cartId: string) {
    super();
  }

  public static get EVENT_PATTERN(): string {
    return 'cart.cleared';
  }
}
