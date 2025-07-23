import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Logger } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import {
  CartCreatedEvent,
  CartDeletedEvent,
  CartClearedEvent,
  ProductAddedEvent,
  ProductRemovedEvent,
  ProductQuantityUpdatedEvent,
  CouponAddedEvent,
  CouponRemovedEvent,
} from '@edd-cart/core';
import { ok, err } from 'neverthrow';
import { v4 } from 'uuid';
import { ProcessorController } from './processor.controller';
import { ProcessorService } from './processor.service';
import { CouponService } from './coupon.service';
import { CartTotalCalculationService } from './cart-total-calculation.service';

describe(ProcessorController.name, () => {
  let controller: ProcessorController;
  let mockProcessorService: DeepMocked<ProcessorService>;
  let mockCouponService: DeepMocked<CouponService>;
  let mockCartTotalCalculationService: DeepMocked<CartTotalCalculationService>;
  const mockKafkaContext: KafkaContext = {} as KafkaContext;
  const cartId = v4();
  const productId = v4();
  const couponCode = 'COUPON';

  beforeEach(() => {
    mockProcessorService = createMock<ProcessorService>();
    mockCouponService = createMock<CouponService>();
    mockCartTotalCalculationService = createMock<CartTotalCalculationService>();
    controller = new ProcessorController(
      mockProcessorService,
      mockCouponService,
      mockCartTotalCalculationService,
    );
    jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
  });

  describe('handleCartCreatedEvent', () => {
    it('should call service and not fail on ok', async () => {
      mockProcessorService.handleCartCreatedEvent.mockResolvedValue(ok({} as any));
      await controller.handleCartCreatedEvent(new CartCreatedEvent(cartId), mockKafkaContext);
      expect(mockProcessorService.handleCartCreatedEvent).toHaveBeenCalled();
    });
    it('should call failWhale on error', async () => {
      mockProcessorService.handleCartCreatedEvent.mockResolvedValue(err(new Error('fail')));
      await controller.handleCartCreatedEvent(new CartCreatedEvent(cartId), mockKafkaContext);
      expect(mockProcessorService.handleCartCreatedEvent).toHaveBeenCalled();
    });
  });

  describe('handleCartDeletedEvent', () => {
    it('should call service and not fail on ok', async () => {
      mockProcessorService.handleCartDeletedEvent.mockResolvedValue(ok({} as any));
      await controller.handleCartDeletedEvent(new CartDeletedEvent(cartId), mockKafkaContext);
      expect(mockProcessorService.handleCartDeletedEvent).toHaveBeenCalled();
    });
    it('should call failWhale on error', async () => {
      mockProcessorService.handleCartDeletedEvent.mockResolvedValue(err(new Error('fail')));
      await controller.handleCartDeletedEvent(new CartDeletedEvent(cartId), mockKafkaContext);
      expect(mockProcessorService.handleCartDeletedEvent).toHaveBeenCalled();
    });
  });

  describe('handleCartClearedEvent', () => {
    it('should call service and not fail on ok', async () => {
      mockProcessorService.handleCartClearedEvent.mockResolvedValue(ok({} as any));
      await controller.handleCartClearedEvent(new CartClearedEvent(cartId), mockKafkaContext);
      expect(mockProcessorService.handleCartClearedEvent).toHaveBeenCalled();
    });
    it('should call failWhale on error', async () => {
      mockProcessorService.handleCartClearedEvent.mockResolvedValue(err(new Error('fail')));
      await controller.handleCartClearedEvent(new CartClearedEvent(cartId), mockKafkaContext);
      expect(mockProcessorService.handleCartClearedEvent).toHaveBeenCalled();
    });
  });

  describe('handleProductAddedEvent', () => {
    it('should call service and recalc, not fail on ok', async () => {
      mockProcessorService.handleProductAddedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 1), mockKafkaContext);
      expect(mockProcessorService.handleProductAddedEvent).toHaveBeenCalled();
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
    it('should call failWhale on error', async () => {
      mockProcessorService.handleProductAddedEvent.mockResolvedValue(err(new Error('fail')));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 1), mockKafkaContext);
      expect(mockProcessorService.handleProductAddedEvent).toHaveBeenCalled();
    });
    it('should call failWhale if recalc fails', async () => {
      mockProcessorService.handleProductAddedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(err(new Error('fail')));
      await controller.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 1), mockKafkaContext);
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
  });

  describe('handleProductRemovedEvent', () => {
    it('should call service and recalc, not fail on ok', async () => {
      mockProcessorService.handleProductRemovedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleProductRemovedEvent(new ProductRemovedEvent(cartId, productId), mockKafkaContext);
      expect(mockProcessorService.handleProductRemovedEvent).toHaveBeenCalled();
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
    it('should call failWhale on error', async () => {
      mockProcessorService.handleProductRemovedEvent.mockResolvedValue(err(new Error('fail')));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleProductRemovedEvent(new ProductRemovedEvent(cartId, productId), mockKafkaContext);
      expect(mockProcessorService.handleProductRemovedEvent).toHaveBeenCalled();
    });
    it('should call failWhale if recalc fails', async () => {
      mockProcessorService.handleProductRemovedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(err(new Error('fail')));
      await controller.handleProductRemovedEvent(new ProductRemovedEvent(cartId, productId), mockKafkaContext);
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
  });

  describe('handleProductQuantityUpdatedEvent', () => {
    it('should call service and recalc, not fail on ok', async () => {
      mockProcessorService.handleProductQuantityUpdatedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleProductQuantityUpdatedEvent(new ProductQuantityUpdatedEvent(cartId, productId, 2), mockKafkaContext);
      expect(mockProcessorService.handleProductQuantityUpdatedEvent).toHaveBeenCalled();
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
    it('should call failWhale on error', async () => {
      mockProcessorService.handleProductQuantityUpdatedEvent.mockResolvedValue(err(new Error('fail')));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleProductQuantityUpdatedEvent(new ProductQuantityUpdatedEvent(cartId, productId, 2), mockKafkaContext);
      expect(mockProcessorService.handleProductQuantityUpdatedEvent).toHaveBeenCalled();
    });
    it('should call failWhale if recalc fails', async () => {
      mockProcessorService.handleProductQuantityUpdatedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(err(new Error('fail')));
      await controller.handleProductQuantityUpdatedEvent(new ProductQuantityUpdatedEvent(cartId, productId, 2), mockKafkaContext);
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
  });

  describe('handleCouponAddedEvent', () => {
    it('should call service and recalc, not fail on ok', async () => {
      mockCouponService.handleCouponAddedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleCouponAddedEvent(new CouponAddedEvent(cartId, couponCode), mockKafkaContext);
      expect(mockCouponService.handleCouponAddedEvent).toHaveBeenCalled();
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
    it('should call failWhale on error', async () => {
      mockCouponService.handleCouponAddedEvent.mockResolvedValue(err(new Error('fail')));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleCouponAddedEvent(new CouponAddedEvent(cartId, couponCode), mockKafkaContext);
      expect(mockCouponService.handleCouponAddedEvent).toHaveBeenCalled();
    });
    it('should call failWhale if recalc fails', async () => {
      mockCouponService.handleCouponAddedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(err(new Error('fail')));
      await controller.handleCouponAddedEvent(new CouponAddedEvent(cartId, couponCode), mockKafkaContext);
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
  });

  describe('handleCouponRemovedEvent', () => {
    it('should call service and recalc, not fail on ok', async () => {
      mockCouponService.handleCouponRemovedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleCouponRemovedEvent(new CouponRemovedEvent(cartId, couponCode), mockKafkaContext);
      expect(mockCouponService.handleCouponRemovedEvent).toHaveBeenCalled();
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
    it('should call failWhale on error', async () => {
      mockCouponService.handleCouponRemovedEvent.mockResolvedValue(err(new Error('fail')));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(ok({} as any));
      await controller.handleCouponRemovedEvent(new CouponRemovedEvent(cartId, couponCode), mockKafkaContext);
      expect(mockCouponService.handleCouponRemovedEvent).toHaveBeenCalled();
    });
    it('should call failWhale if recalc fails', async () => {
      mockCouponService.handleCouponRemovedEvent.mockResolvedValue(ok({} as any));
      mockCartTotalCalculationService.calculateCartTotal.mockResolvedValue(err(new Error('fail')));
      await controller.handleCouponRemovedEvent(new CouponRemovedEvent(cartId, couponCode), mockKafkaContext);
      expect(mockCartTotalCalculationService.calculateCartTotal).toHaveBeenCalledWith(cartId);
    });
  });
});
