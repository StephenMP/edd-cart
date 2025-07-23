import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '@edd-cart/db';
import { v4 } from 'uuid';
import { CartService } from './cart.service';
import { CartEntity } from '@edd-cart/db';
import { Observable, of } from 'rxjs';

describe('CartService', () => {
  const mockCartId = v4();
  let service: CartService;
  let mockProcessorClient: DeepMocked<ClientKafka>;
  let mockPrismaService: DeepMocked<PrismaService>;

  beforeEach(() => {
    mockProcessorClient = createMock<ClientKafka>();
    mockProcessorClient.emit = jest.fn().mockReturnValue(of('emitted'));
    mockPrismaService = createMock<PrismaService>();
    service = new CartService(mockProcessorClient, mockPrismaService);
  });

  describe('All Errors', () => {
    it('should return an error on unknown error for all functions', async () => {
      const mockResult: Error = new Error('test-message');

      mockPrismaService.cart.findMany = jest.fn().mockReturnValue(Promise.reject(mockResult));
      mockPrismaService.cart.findFirst = jest.fn().mockReturnValue(Promise.reject(mockResult));

      const jobs = [
        service.createCart(),
        service.deleteCartById(mockCartId),
        service.getAllCarts(0, 1),
        service.getCartById(mockCartId),
        service.clearCart(mockCartId),
        service.addProductToCart(mockCartId, 'prod1', 1),
        service.removeProductFromCart(mockCartId, 'prod1'),
        service.updateProductQuantity(mockCartId, 'prod1', 2),
        service.addCouponToCart(mockCartId, 'COUPON'),
        service.removeCouponFromCart(mockCartId, 'COUPON'),
      ];

      for (const job of jobs) {
        const result = await job;
        if (result.isErr()) {
          expect(result).not.toBeNull();
          expect(result).not.toBeUndefined();
          expect(result.isOk()).toBe(false);
          expect(result.isErr()).toBe(true);
          result.mapErr((e) => {
            expect(e.message).toBe('test-message');
          });
        }
      }
    });
  });

  describe('Happy Paths', () => {
    it('should pass for all functions', async () => {
      const mockCartEntity: CartEntity = {
        id: mockCartId,
        created_at: new Date(),
        sub_total: 0,
        total: 0,
        cart_products: [],
        coupon: null,
      };

      mockPrismaService.cart.findMany = jest.fn().mockReturnValue(Promise.resolve([mockCartEntity]));
      mockPrismaService.cart.findFirst = jest.fn().mockReturnValue(Promise.resolve(mockCartEntity));

      // createCart returns cartId (string)
      const createCartResult = await service.createCart();
      expect(createCartResult.isOk()).toBe(true);
      createCartResult.map((id) => {
        expect(typeof id).toBe('string');
        expect(id).toBeDefined();
      });

      // deleteCartById returns Observable
      const deleteCartResult = await service.deleteCartById(mockCartId);
      expect(deleteCartResult.isOk()).toBe(true);
      deleteCartResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });

      // getAllCarts returns CartEntity[]
      const getAllCartsResult = await service.getAllCarts(0, 1);
      expect(getAllCartsResult.isOk()).toBe(true);
      getAllCartsResult.map((arr) => {
        expect(Array.isArray(arr)).toBe(true);
        expect(arr[0].id).toBe(mockCartId);
      });

      // getCartById returns CartEntity | null
      const getCartByIdResult = await service.getCartById(mockCartId);
      expect(getCartByIdResult.isOk()).toBe(true);
      getCartByIdResult.map((cart) => {
        expect(cart).not.toBeNull();
        if (cart) expect(cart.id).toBe(mockCartId);
      });

      // clearCart returns Observable
      const clearCartResult = await service.clearCart(mockCartId);
      expect(clearCartResult.isOk()).toBe(true);
      clearCartResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });

      // addProductToCart returns Observable
      const addProductResult = await service.addProductToCart(mockCartId, 'prod1', 1);
      expect(addProductResult.isOk()).toBe(true);
      addProductResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });

      // removeProductFromCart returns Observable
      const removeProductResult = await service.removeProductFromCart(mockCartId, 'prod1');
      expect(removeProductResult.isOk()).toBe(true);
      removeProductResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });

      // updateProductQuantity returns Observable
      const updateProductResult = await service.updateProductQuantity(mockCartId, 'prod1', 2);
      expect(updateProductResult.isOk()).toBe(true);
      updateProductResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });

      // addCouponToCart returns Observable
      const addCouponResult = await service.addCouponToCart(mockCartId, 'COUPON');
      expect(addCouponResult.isOk()).toBe(true);
      addCouponResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });

      // removeCouponFromCart returns Observable
      const removeCouponResult = await service.removeCouponFromCart(mockCartId, 'COUPON');
      expect(removeCouponResult.isOk()).toBe(true);
      removeCouponResult.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });
    });
  });

  describe('createCart', () => {
    it('should create a cart and emit CartCreatedEvent', async () => {
      const result = await service.createCart();
      expect(mockProcessorClient.emit).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      result.map((id) => {
        expect(typeof id).toBe('string');
        expect(id).toBeDefined();
      });
    });
  });

  describe('clearCart', () => {
    it('should clear a cart and emit CartClearedEvent', async () => {
      const result = await service.clearCart(mockCartId);
      expect(mockProcessorClient.emit).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      result.map((obs) => {
        expect(obs).toBeInstanceOf(Observable);
      });
    });
  });
});
