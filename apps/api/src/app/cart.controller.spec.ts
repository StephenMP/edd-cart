import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpException, NotFoundException } from '@nestjs/common';
import { CartEntity } from '@edd-cart/db';
import { err, ok } from 'neverthrow';
import { v4 } from 'uuid';
import { AddProductDTO } from '../dto/add-product.dto';
import { RemoveProductDTO } from '../dto/remove-product.dto';
import { AddCouponDTO } from '../dto/add-coupon.dto';
import { RemoveCouponDTO } from '../dto/remove-coupon.dto';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

describe('CartController', () => {
  let mockId: string;
  let controller: CartController;
  let mockCartService: DeepMocked<CartService>;
  let mockCart: CartEntity;

  beforeEach(() => {
    mockId = v4();
    mockCartService = createMock<CartService>();
    controller = new CartController(mockCartService);
    mockCart = {
      id: mockId,
      created_at: new Date(),
      sub_total: 100,
      total: 120,
      cart_products: [],
      coupon: null,
    } as CartEntity;
  });

  describe('createCart', () => {
    it('should create a cart and return its id', async () => {
      const mockResult = ok<string, Error>(mockId);
      mockCartService.createCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      const result = await controller.createCart();
      expect(mockCartService.createCart).toHaveBeenCalled();
      expect(result).toBe(mockId);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<string, Error>(new Error('fail'));
      mockCartService.createCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.createCart()).rejects.toThrow(HttpException);
    });
  });

  describe('deleteCartById', () => {
    it('should delete a cart by id', async () => {
      const mockResult = ok<any, Error>(undefined);
      mockCartService.deleteCartById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.deleteCartById(mockId)).resolves.toBeUndefined();
      expect(mockCartService.deleteCartById).toHaveBeenCalledWith(mockId);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<any, Error>(new Error('fail'));
      mockCartService.deleteCartById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.deleteCartById(mockId)).rejects.toThrow(HttpException);
    });
  });

  describe('clearCart', () => {
    it('should clear a cart', async () => {
      const mockResult = ok<any, Error>(undefined);
      mockCartService.clearCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.clearCart(mockId)).resolves.toBeUndefined();
      expect(mockCartService.clearCart).toHaveBeenCalledWith(mockId);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<any, Error>(new Error('fail'));
      mockCartService.clearCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.clearCart(mockId)).rejects.toThrow(HttpException);
    });
  });

  describe('getCartById', () => {
    it('should return a cart by id', async () => {
      const mockResult = ok<CartEntity, Error>(mockCart);
      mockCartService.getCartById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      const result = await controller.getCartById(mockId);
      expect(mockCartService.getCartById).toHaveBeenCalledWith(mockId);
      expect(result).toBe(mockCart);
    });
    it('should throw NotFoundException if no cart', async () => {
      const mockResult = ok<CartEntity | null, Error>(null);
      mockCartService.getCartById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.getCartById(mockId)).rejects.toThrow(NotFoundException);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<CartEntity, Error>(new Error('fail'));
      mockCartService.getCartById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.getCartById(mockId)).rejects.toThrow(HttpException);
    });
  });

  describe('getAllCarts', () => {
    it('should return all carts', async () => {
      const mockResult = ok<CartEntity[], Error>([mockCart]);
      mockCartService.getAllCarts = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      const result = await controller.getAllCarts(0, 100);
      expect(mockCartService.getAllCarts).toHaveBeenCalledWith(0, 100);
      expect(result).toEqual([mockCart]);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<CartEntity[], Error>(new Error('fail'));
      mockCartService.getAllCarts = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.getAllCarts(0, 100)).rejects.toThrow(HttpException);
    });
  });

  describe('addProductToCart', () => {
    it('should add a product to a cart', async () => {
      const dto = new AddProductDTO('prod-1', 2);
      const mockResult = ok<any, Error>(mockCart);
      mockCartService.addProductToCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.addProductToCart(mockId, dto)).resolves.toBeUndefined();
      expect(mockCartService.addProductToCart).toHaveBeenCalledWith(mockId, dto.productId, dto.quantity);
    });
    it('should throw NotFoundException if no cart', async () => {
      const dto = new AddProductDTO('prod-1', 2);
      const mockResult = ok<any, Error>(null);
      mockCartService.addProductToCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.addProductToCart(mockId, dto)).rejects.toThrow(NotFoundException);
    });
    it('should throw HttpException on error', async () => {
      const dto = new AddProductDTO('prod-1', 2);
      const mockResult = err<any, Error>(new Error('fail'));
      mockCartService.addProductToCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.addProductToCart(mockId, dto)).rejects.toThrow(HttpException);
    });
  });

  describe('removeProductFromCart', () => {
    it('should remove a product from a cart', async () => {
      const dto = new RemoveProductDTO('prod-1');
      const mockResult = ok<any, Error>(mockCart);
      mockCartService.removeProductFromCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.removeProductFromCart(mockId, dto)).resolves.toBeUndefined();
      expect(mockCartService.removeProductFromCart).toHaveBeenCalledWith(mockId, dto.productId);
    });
    it('should throw NotFoundException if no cart', async () => {
      const dto = new RemoveProductDTO('prod-1');
      const mockResult = ok<any, Error>(null);
      mockCartService.removeProductFromCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.removeProductFromCart(mockId, dto)).rejects.toThrow(NotFoundException);
    });
    it('should throw HttpException on error', async () => {
      const dto = new RemoveProductDTO('prod-1');
      const mockResult = err<any, Error>(new Error('fail'));
      mockCartService.removeProductFromCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.removeProductFromCart(mockId, dto)).rejects.toThrow(HttpException);
    });
  });

  describe('addCouponToCart', () => {
    it('should add a coupon to a cart', async () => {
      const dto = new AddCouponDTO('COUPON1');
      const mockResult = ok<any, Error>(mockCart);
      mockCartService.addCouponToCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.addCouponToCart(mockId, dto)).resolves.toBeUndefined();
      expect(mockCartService.addCouponToCart).toHaveBeenCalledWith(mockId, dto.couponCode);
    });
    it('should throw NotFoundException if no cart', async () => {
      const dto = new AddCouponDTO('COUPON1');
      const mockResult = ok<any, Error>(null);
      mockCartService.addCouponToCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.addCouponToCart(mockId, dto)).rejects.toThrow(NotFoundException);
    });
    it('should throw HttpException on error', async () => {
      const dto = new AddCouponDTO('COUPON1');
      const mockResult = err<any, Error>(new Error('fail'));
      mockCartService.addCouponToCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.addCouponToCart(mockId, dto)).rejects.toThrow(HttpException);
    });
  });

  describe('removeCouponFromCart', () => {
    it('should remove a coupon from a cart', async () => {
      const dto = new RemoveCouponDTO('COUPON1');
      const mockResult = ok<any, Error>(mockCart);
      mockCartService.removeCouponFromCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.removeCouponFromCart(mockId, dto)).resolves.toBeUndefined();
      expect(mockCartService.removeCouponFromCart).toHaveBeenCalledWith(mockId, dto.couponCode);
    });
    it('should throw NotFoundException if no cart', async () => {
      const dto = new RemoveCouponDTO('COUPON1');
      const mockResult = ok<any, Error>(null);
      mockCartService.removeCouponFromCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.removeCouponFromCart(mockId, dto)).rejects.toThrow(NotFoundException);
    });
    it('should throw HttpException on error', async () => {
      const dto = new RemoveCouponDTO('COUPON1');
      const mockResult = err<any, Error>(new Error('fail'));
      mockCartService.removeCouponFromCart = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.removeCouponFromCart(mockId, dto)).rejects.toThrow(HttpException);
    });
  });
});
