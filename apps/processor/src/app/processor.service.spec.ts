import {
  CartClearedEvent,
  CartCreatedEvent,
  CartDeletedEvent,
  ProductAddedEvent,
  ProductQuantityUpdatedEvent,
  ProductRemovedEvent,
} from '@edd-cart/core';
import { PrismaService } from '@edd-cart/db';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { v4 } from 'uuid';
import { ProcessorService } from './processor.service';

describe(ProcessorService.name, () => {
  let service: ProcessorService;
  let mockPrismaService: DeepMocked<PrismaService>;
  const cartId = v4();
  const productId = v4();

  beforeEach(() => {
    mockPrismaService = createMock<PrismaService>();
    // Use Object.defineProperty to override read-only Prisma model delegates
    Object.defineProperty(mockPrismaService, 'cart', {
      value: {
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      writable: true,
    });
    Object.defineProperty(mockPrismaService, 'product', {
      value: {
        findUnique: jest.fn(),
      },
      writable: true,
    });
    service = new ProcessorService(mockPrismaService);
  });

  describe('handleCartCreatedEvent', () => {
    it('should create cart and return ok', async () => {
      const cart = { id: cartId } as any;
      (mockPrismaService.cart.create as jest.Mock).mockResolvedValue(cart);
      const result = await service.handleCartCreatedEvent(new CartCreatedEvent(cartId));
      expect(mockPrismaService.cart.create).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
    });
    it('should return err on prisma error', async () => {
      (mockPrismaService.cart.create as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.handleCartCreatedEvent(new CartCreatedEvent(cartId));
      expect(result.isErr()).toBe(true);
    });
  });

  describe('handleCartDeletedEvent', () => {
    it('should delete cart and return ok', async () => {
      const cart = { id: cartId } as any;
      (mockPrismaService.cart.delete as jest.Mock).mockResolvedValue(cart);
      const result = await service.handleCartDeletedEvent(new CartDeletedEvent(cartId));
      expect(mockPrismaService.cart.delete).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
    });
    it('should return err on prisma error', async () => {
      (mockPrismaService.cart.delete as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.handleCartDeletedEvent(new CartDeletedEvent(cartId));
      expect(result.isErr()).toBe(true);
    });
  });

  describe('handleCartClearedEvent', () => {
    it('should clear cart and return ok', async () => {
      const cart = { id: cartId } as any;
      (mockPrismaService.cart.update as jest.Mock).mockResolvedValue(cart);
      const result = await service.handleCartClearedEvent(new CartClearedEvent(cartId));
      expect(mockPrismaService.cart.update).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
    });
    it('should return err on prisma error', async () => {
      (mockPrismaService.cart.update as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.handleCartClearedEvent(new CartClearedEvent(cartId));
      expect(result.isErr()).toBe(true);
    });
  });

  describe('handleProductAddedEvent', () => {
    it('should add product and return ok', async () => {
      const cart = { id: cartId, total: 0 } as any;
      const product = { id: productId, price: 10 } as any;
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart);
      (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(product);
      (mockPrismaService.cart.update as jest.Mock).mockResolvedValue(cart);
      const result = await service.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 2));
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.product.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.cart.update).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
    });
    it('should return err if cart not found', async () => {
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 2));
      expect(result.isErr()).toBe(true);
    });
    it('should return err if product not found', async () => {
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, total: 0 } as any);
      (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 2));
      expect(result.isErr()).toBe(true);
    });
    it('should return err on prisma update error', async () => {
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, total: 0 } as any);
      (mockPrismaService.product.findUnique as jest.Mock).mockResolvedValue({ id: productId, price: 10 } as any);
      (mockPrismaService.cart.update as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.handleProductAddedEvent(new ProductAddedEvent(cartId, productId, 2));
      expect(result.isErr()).toBe(true);
    });
  });

  describe('handleProductRemovedEvent', () => {
    it('should remove product and return ok', async () => {
      const cart = { id: cartId } as any;
      (mockPrismaService.cart.update as jest.Mock).mockResolvedValue(cart);
      const result = await service.handleProductRemovedEvent(new ProductRemovedEvent(cartId, productId));
      expect(mockPrismaService.cart.update).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
    });
    it('should return err on prisma error', async () => {
      (mockPrismaService.cart.update as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.handleProductRemovedEvent(new ProductRemovedEvent(cartId, productId));
      expect(result.isErr()).toBe(true);
    });
  });

  describe('handleProductQuantityUpdatedEvent', () => {
    it('should update quantity and return ok', async () => {
      const cart = { id: cartId } as any;
      (mockPrismaService.cart.update as jest.Mock).mockResolvedValue(cart);
      const result = await service.handleProductQuantityUpdatedEvent(
        new ProductQuantityUpdatedEvent(cartId, productId, 3),
      );
      expect(mockPrismaService.cart.update).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
    });
    it('should return err on prisma error', async () => {
      (mockPrismaService.cart.update as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.handleProductQuantityUpdatedEvent(
        new ProductQuantityUpdatedEvent(cartId, productId, 3),
      );
      expect(result.isErr()).toBe(true);
    });
  });
});
