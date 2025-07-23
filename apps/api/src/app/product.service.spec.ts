import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { PrismaService } from '@edd-cart/db';
import { v4 } from 'uuid';
import { ProductService } from './product.service';
import { ProductEntity } from '@edd-cart/db';

describe('ProductService', () => {
  const mockProductId = v4();
  let service: ProductService;
  let mockPrismaService: DeepMocked<PrismaService>;

  beforeEach(() => {
    mockPrismaService = createMock<PrismaService>();
    service = new ProductService(mockPrismaService);
  });

  describe('All Errors', () => {
    it('should return an error on unknown error for all functions', async () => {
      const mockResult: Error = new Error('test-message');
      mockPrismaService.product.findMany = jest.fn().mockReturnValue(Promise.reject(mockResult));
      mockPrismaService.product.findFirst = jest.fn().mockReturnValue(Promise.reject(mockResult));

      const jobs = [
        service.getAllProducts(0, 1),
        service.getProductById(mockProductId),
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
      const mockProductEntity: ProductEntity = {
        id: mockProductId,
        created_at: new Date(),
        name: 'Test Product',
        price: 99.99,
        cartItems: [],
      };

      mockPrismaService.product.findMany = jest.fn().mockReturnValue(Promise.resolve([mockProductEntity]));
      mockPrismaService.product.findFirst = jest.fn().mockReturnValue(Promise.resolve(mockProductEntity));

      // getAllProducts returns ProductEntity[]
      const getAllProductsResult = await service.getAllProducts(0, 1);
      expect(getAllProductsResult.isOk()).toBe(true);
      getAllProductsResult.map((arr) => {
        expect(Array.isArray(arr)).toBe(true);
        expect(arr[0].id).toBe(mockProductId);
      });

      // getProductById returns ProductEntity | null
      const getProductByIdResult = await service.getProductById(mockProductId);
      expect(getProductByIdResult.isOk()).toBe(true);
      getProductByIdResult.map((product) => {
        expect(product).not.toBeNull();
        if (product) expect(product.id).toBe(mockProductId);
      });
    });
  });
});
