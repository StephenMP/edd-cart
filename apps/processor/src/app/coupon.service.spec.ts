import { CouponAddedEvent, CouponRemovedEvent } from '@edd-cart/core';
import { PrismaService } from '@edd-cart/db';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { v4 } from 'uuid';
import { CouponService } from './coupon.service';

describe('CouponService (unit)', () => {
  let service: CouponService;
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
    Object.defineProperty(mockPrismaService, 'coupon', {
      value: {
        findFirst: jest.fn(),
      },
      writable: true,
    });
    service = new CouponService(mockPrismaService);
  });

  describe('handleCouponAddedEvent', () => {
    it('should error if cart not found', async () => {
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);
      const event = new CouponAddedEvent(v4(), 'CODE');
      const result = await service.handleCouponAddedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/cart not found/i));
    });

    it('should error if coupon not found', async () => {
      const cartId = v4();
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: null });
      (mockPrismaService.coupon.findFirst as jest.Mock).mockResolvedValue(null);
      const event = new CouponAddedEvent(cartId, 'NOPE');
      const result = await service.handleCouponAddedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/coupon not found/i));
    });

    it('should error if coupon is not active', async () => {
      const cartId = v4();
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: null });
      (mockPrismaService.coupon.findFirst as jest.Mock).mockResolvedValue({ is_active: false });
      const event = new CouponAddedEvent(cartId, 'INACTIVE');
      const result = await service.handleCouponAddedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/not active/i));
    });

    it('should error if another coupon already exists on cart', async () => {
      const cartId = v4();
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: { code: 'C1' } });
      const event = new CouponAddedEvent(cartId, 'C2');
      const result = await service.handleCouponAddedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/another coupon already exists/i));
    });

    it('should error if coupon already exists on cart', async () => {
      const cartId = v4();
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: { code: 'C1' } });
      const event = new CouponAddedEvent(cartId, 'C1');
      const result = await service.handleCouponAddedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/already exists on cart/i));
    });

    it('should add coupon to cart (happy path)', async () => {
      const cartId = v4();
      const coupon = { id: v4(), code: 'HAPPY', is_active: true };
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: null });
      (mockPrismaService.coupon.findFirst as jest.Mock).mockResolvedValue(coupon);
      (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ id: cartId, coupon });
      const event = new CouponAddedEvent(cartId, 'HAPPY');
      const result = await service.handleCouponAddedEvent(event);
      expect(result.isOk()).toBe(true);
      result.map((c) => {
        expect(c.coupon).not.toBeNull();
        expect(c.coupon.code).toBe('HAPPY');
      });
    });
  });

  describe('handleCouponRemovedEvent', () => {
    it('should error if cart not found', async () => {
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);
      const event = new CouponRemovedEvent(v4(), 'CODE');
      const result = await service.handleCouponRemovedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/cart not found/i));
    });

    it('should error if coupon not found', async () => {
      const cartId = v4();
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: null });
      (mockPrismaService.coupon.findFirst as jest.Mock).mockResolvedValue(null);
      const event = new CouponRemovedEvent(cartId, 'NOPE');
      const result = await service.handleCouponRemovedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/coupon not found/i));
    });

    it('should error if coupon not on cart', async () => {
      const cartId = v4();
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon: { code: 'C2' } });
      (mockPrismaService.coupon.findFirst as jest.Mock).mockResolvedValue({ code: 'C1' });
      const event = new CouponRemovedEvent(cartId, 'C1');
      const result = await service.handleCouponRemovedEvent(event);
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => expect(e.message).toMatch(/not on cart/i));
    });

    it('should remove coupon from cart (happy path)', async () => {
      const cartId = v4();
      const coupon = { id: v4(), code: 'HAPPY', is_active: true };
      (mockPrismaService.cart.findUnique as jest.Mock).mockResolvedValue({ id: cartId, coupon });
      (mockPrismaService.coupon.findFirst as jest.Mock).mockResolvedValue(coupon);
      (mockPrismaService.cart.update as jest.Mock).mockResolvedValue({ id: cartId, coupon: null });
      const event = new CouponRemovedEvent(cartId, 'HAPPY');
      const result = await service.handleCouponRemovedEvent(event);
      expect(result.isOk()).toBe(true);
      result.map((c) => {
        expect(c.coupon).toBeNull();
      });
    });
  });
});
