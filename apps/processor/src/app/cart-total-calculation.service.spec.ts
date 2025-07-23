import { PrismaService } from '@edd-cart/db';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { CouponLevel, CouponType } from '@prisma/client';
import { v4 } from 'uuid';
import { CartTotalCalculationService } from './cart-total-calculation.service';

describe('CartTotalCalculationService (unit)', () => {
  let service: CartTotalCalculationService;
  let mockPrismaService: DeepMocked<PrismaService>;

  beforeEach(() => {
    mockPrismaService = createMock<PrismaService>();
    Object.defineProperty(mockPrismaService, 'cart', {
      value: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      writable: true,
    });
    service = new CartTotalCalculationService(mockPrismaService);
  });

  it('should return error if cart not found', async () => {
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await service.calculateCartTotal(v4());
    expect(result.isErr()).toBe(true);
    result.mapErr((e) => expect(e.message).toMatch(/not found/i));
  });

  it('should calculate total for cart with no coupon', async () => {
    const cartId = v4();
    const product = { id: v4(), price: 100 };
    const cartProduct = { product, quantity: 2 };
    const cart = {
      id: cartId,
      cart_products: [cartProduct],
      coupon: null,
    };
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart as any);
    (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ ...cart, sub_total: 200, total: 200 });
    const result = await service.calculateCartTotal(cartId);
    expect(result.isOk()).toBe(true);
    result.map((c) => {
      expect(c.sub_total).toBe(200);
      expect(c.total).toBe(200);
    });
  });

  it('should apply cart-level fixed coupon', async () => {
    const cartId = v4();
    const product = { id: v4(), price: 100 };
    const cartProduct = { product, quantity: 2 };
    const coupon = {
      code: 'FIXED10',
      discount: 10,
      type: CouponType.FIXED,
      level: CouponLevel.CART,
      cart_id: cartId,
      is_active: true,
    };
    const cart = {
      id: cartId,
      cart_products: [cartProduct],
      coupon,
    };
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart as any);
    (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ ...cart, sub_total: 200, total: 190 });
    const result = await service.calculateCartTotal(cartId);
    expect(result.isOk()).toBe(true);
    result.map((c) => {
      expect(c.sub_total).toBe(200);
      expect(c.total).toBe(190);
    });
  });

  it('should apply cart-level percent coupon', async () => {
    const cartId = v4();
    const product = { id: v4(), price: 100 };
    const cartProduct = { product, quantity: 2 };
    const coupon = {
      code: 'PERC10',
      discount: 10,
      type: CouponType.PERCENTAGE,
      level: CouponLevel.CART,
      cart_id: cartId,
      is_active: true,
    };
    const cart = {
      id: cartId,
      cart_products: [cartProduct],
      coupon,
    };
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart as any);
    (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ ...cart, sub_total: 200, total: 180 });
    const result = await service.calculateCartTotal(cartId);
    expect(result.isOk()).toBe(true);
    result.map((c) => {
      expect(c.sub_total).toBe(200);
      expect(Math.round(c.total)).toBe(180);
    });
  });

  it('should apply product-level fixed coupon', async () => {
    const cartId = v4();
    const product = { id: v4(), price: 100 };
    const cartProduct = { product, quantity: 2 };
    const coupon = {
      code: 'PRODFIXED',
      discount: 50,
      type: CouponType.FIXED,
      level: CouponLevel.PRODUCT,
      cart_id: cartId,
      product_id: product.id,
      is_active: true,
    };
    const cart = {
      id: cartId,
      cart_products: [cartProduct],
      coupon,
    };
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart as any);
    (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ ...cart, sub_total: 200, total: 150 });
    const result = await service.calculateCartTotal(cartId);
    expect(result.isOk()).toBe(true);
    result.map((c) => {
      expect(c.sub_total).toBe(200);
      expect(c.total).toBe(150);
    });
  });

  it('should apply product-level percent coupon', async () => {
    const cartId = v4();
    const product = { id: v4(), price: 100 };
    const cartProduct = { product, quantity: 2 };
    const coupon = {
      code: 'PRODPERC',
      discount: 25,
      type: CouponType.PERCENTAGE,
      level: CouponLevel.PRODUCT,
      cart_id: cartId,
      product_id: product.id,
      is_active: true,
    };
    const cart = {
      id: cartId,
      cart_products: [cartProduct],
      coupon,
    };
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart as any);
    (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ ...cart, sub_total: 200, total: 150 });
    const result = await service.calculateCartTotal(cartId);
    expect(result.isOk()).toBe(true);
    result.map((c) => {
      expect(c.sub_total).toBe(200);
      expect(c.total).toBe(150);
    });
  });

  it('should error if cart-level fixed coupon discount > subtotal', async () => {
    const cartId = v4();
    const product = { id: v4(), price: 10 };
    const cartProduct = { product, quantity: 1 };
    const coupon = {
      code: 'TOOBIG',
      discount: 20,
      type: CouponType.FIXED,
      level: CouponLevel.CART,
      cart_id: cartId,
      is_active: true,
    };
    const cart = {
      id: cartId,
      cart_products: [cartProduct],
      coupon,
    };
    (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(cart as any);
    const result = await service.calculateCartTotal(cartId);
    expect(result.isErr()).toBe(true);
    result.mapErr((e) => expect(e.message).toMatch(/less than discount/i));
  });
});
