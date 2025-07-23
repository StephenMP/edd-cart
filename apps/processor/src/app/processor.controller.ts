import {
  CartClearedEvent,
  CartCreatedEvent,
  CartDeletedEvent,
  CouponAddedEvent,
  CouponRemovedEvent,
  ProductAddedEvent,
  ProductQuantityUpdatedEvent,
  ProductRemovedEvent,
} from '@edd-cart/core';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { failWhale } from 'fail-whale';
import { CartTotalCalculationService } from './cart-total-calculation.service';
import { CouponService } from './coupon.service';
import { ProcessorService } from './processor.service';

@Controller()
export class ProcessorController {
  private readonly logger: Logger;

  constructor(
    private readonly processorService: ProcessorService,
    private readonly couponService: CouponService,
    private readonly cartTotalCalculationService: CartTotalCalculationService,
  ) {
    this.logger = new Logger(`Processor.${this.constructor.name}`);
  }

  @EventPattern(CartCreatedEvent.EVENT_PATTERN)
  public async handleCartCreatedEvent(@Payload() event: CartCreatedEvent, @Ctx() context: KafkaContext) {
    this.logger.log(`Received ${CartCreatedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.processorService.handleCartCreatedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }
  }

  @EventPattern(CartDeletedEvent.EVENT_PATTERN)
  public async handleCartDeletedEvent(@Payload() event: CartDeletedEvent, @Ctx() context: KafkaContext): Promise<void> {
    this.logger.log(`Received ${CartDeletedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.processorService.handleCartDeletedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }
  }

  @EventPattern(CartClearedEvent.EVENT_PATTERN)
  public async handleCartClearedEvent(@Payload() event: CartClearedEvent, @Ctx() context: KafkaContext): Promise<void> {
    this.logger.log(`Received ${CartClearedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.processorService.handleCartClearedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }
  }

  @EventPattern(ProductAddedEvent.EVENT_PATTERN)
  public async handleProductAddedEvent(
    @Payload() event: ProductAddedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.log(`Received ${ProductAddedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.processorService.handleProductAddedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }

    const totalResult = await this.cartTotalCalculationService.calculateCartTotal(event.cartId);
    if (totalResult.isErr()) {
      failWhale(totalResult.error.message, this.logger);
    }
  }

  @EventPattern(ProductRemovedEvent.EVENT_PATTERN)
  public async handleProductRemovedEvent(
    @Payload() event: ProductRemovedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.log(`Received ${ProductRemovedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.processorService.handleProductRemovedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }

    const totalResult = await this.cartTotalCalculationService.calculateCartTotal(event.cartId);
    if (totalResult.isErr()) {
      failWhale(totalResult.error.message, this.logger);
    }
  }

  @EventPattern(ProductQuantityUpdatedEvent.EVENT_PATTERN)
  public async handleProductQuantityUpdatedEvent(
    @Payload() event: ProductQuantityUpdatedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.log(`Received ${ProductQuantityUpdatedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.processorService.handleProductQuantityUpdatedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }

    const totalResult = await this.cartTotalCalculationService.calculateCartTotal(event.cartId);
    if (totalResult.isErr()) {
      failWhale(totalResult.error.message, this.logger);
    }
  }

  @EventPattern(CouponAddedEvent.EVENT_PATTERN)
  public async handleCouponAddedEvent(@Payload() event: CouponAddedEvent, @Ctx() context: KafkaContext): Promise<void> {
    this.logger.log(`Received ${CouponAddedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.couponService.handleCouponAddedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }

    const totalResult = await this.cartTotalCalculationService.calculateCartTotal(event.cartId);
    if (totalResult.isErr()) {
      failWhale(totalResult.error.message, this.logger);
    }
  }

  @EventPattern(CouponRemovedEvent.EVENT_PATTERN)
  public async handleCouponRemovedEvent(
    @Payload() event: CouponRemovedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.log(`Received ${CouponRemovedEvent.EVENT_PATTERN} event: ${JSON.stringify(event)}`);
    const result = await this.couponService.handleCouponRemovedEvent(event);

    if (result.isErr()) {
      failWhale(result.error.message, this.logger);
    }

    const totalResult = await this.cartTotalCalculationService.calculateCartTotal(event.cartId);
    if (totalResult.isErr()) {
      failWhale(totalResult.error.message, this.logger);
    }
  }
}
