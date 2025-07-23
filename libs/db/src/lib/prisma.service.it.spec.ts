import { Cart, CouponLevel, CouponType, PrismaClient } from '@prisma/client';
import { v4 } from 'uuid';

describe('PrismaService', () => {
  const mockCreatedAt: Date = new Date();
  const mockCartId = v4();
  const mockProductId = v4();
  const cartSeed: Cart = {
    id: mockCartId,
    created_at: mockCreatedAt,
    sub_total: 29.99,
    total: 29.99,
  } as Cart;

  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();

    // Create a cart first
    await prisma.cart.create({
      data: cartSeed,
    });

    // Create a product with a specific ID and connect it to the cart via CartProduct
    await prisma.product.create({
      data: {
        id: mockProductId,
        name: 'Test Product',
        price: 29.99,
      },
    });

    // Create a CartProduct to link the cart and product
    await prisma.cartProduct.create({
      data: {
        cart_id: mockCartId,
        product_id: mockProductId,
        quantity: 1,
      },
    });

    // Create a coupon and connect it to the cart
    await prisma.coupon.create({
      data: {
        code: 'TEST10',
        discount: 10.0,
        type: CouponType.PERCENTAGE,
        level: CouponLevel.CART,
        cart: {
          connect: {
            id: mockCartId,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "Product" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Coupon" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Cart" CASCADE`;
    prisma.$disconnect();
  });

  describe('db integration', () => {
    it('can read cart with products and coupon', async () => {
      const cart = await prisma.cart.findFirst({
        where: {
          id: mockCartId,
        },
        include: {
          cart_products: {
            include: {
              product: true,
            },
          },
          coupon: true,
        },
      });

      expect(cart).not.toBeNull();
      expect(cart).not.toBeUndefined();
      expect(cart.id).toStrictEqual(mockCartId);
      expect(cart.cart_products).toHaveLength(1);
      expect(cart.cart_products[0].product_id).toStrictEqual(mockProductId);
      expect(cart.cart_products[0].product.name).toStrictEqual('Test Product');
      expect(cart.cart_products[0].product.price).toStrictEqual(29.99);
      expect(cart.cart_products[0].quantity).toStrictEqual(1);
      expect(cart.coupon).not.toBeNull();
      expect(cart.coupon.code).toStrictEqual('TEST10');
      expect(cart.coupon.type).toStrictEqual(CouponType.PERCENTAGE);
      expect(cart.coupon.level).toStrictEqual(CouponLevel.CART);
    });

    it('can query products by price range', async () => {
      const products = await prisma.product.findMany({
        where: {
          price: {
            gte: 20.0,
            lte: 50.0,
          },
        },
      });

      expect(products).toHaveLength(1);
      expect(products[0].name).toStrictEqual('Test Product');
      expect(products[0].price).toBeGreaterThanOrEqual(20.0);
      expect(products[0].price).toBeLessThanOrEqual(50.0);
    });

    it('can query coupon by type and level', async () => {
      const coupon = await prisma.coupon.findMany({
        where: {
          type: CouponType.PERCENTAGE,
          level: CouponLevel.CART,
        },
      });

      expect(coupon).toHaveLength(1);
      expect(coupon[0].code).toStrictEqual('TEST10');
      expect(coupon[0].type).toStrictEqual(CouponType.PERCENTAGE);
      expect(coupon[0].level).toStrictEqual(CouponLevel.CART);
    });
  });
});
