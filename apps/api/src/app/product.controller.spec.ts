import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpException, NotFoundException } from '@nestjs/common';
import { ProductEntity } from '@edd-cart/db';
import { err, ok } from 'neverthrow';
import { v4 } from 'uuid';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

describe('ProductController', () => {
  let mockId: string;
  let controller: ProductController;
  let mockProductService: DeepMocked<ProductService>;
  let mockProduct: ProductEntity;

  beforeEach(() => {
    mockId = v4();
    mockProductService = createMock<ProductService>();
    controller = new ProductController(mockProductService);
    mockProduct = {
      id: mockId,
      created_at: new Date(),
      name: 'Test Product',
      price: 99.99,
      cartItems: [],
    } as ProductEntity;
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const mockResult = ok<ProductEntity, Error>(mockProduct);
      mockProductService.getProductById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      const result = await controller.getProductById(mockId);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(mockId);
      expect(result).toBe(mockProduct);
    });
    it('should throw NotFoundException if no product', async () => {
      const mockResult = ok<ProductEntity | null, Error>(null);
      mockProductService.getProductById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.getProductById(mockId)).rejects.toThrow(NotFoundException);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<ProductEntity, Error>(new Error('fail'));
      mockProductService.getProductById = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.getProductById(mockId)).rejects.toThrow(HttpException);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockResult = ok<ProductEntity[], Error>([mockProduct]);
      mockProductService.getAllProducts = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      const result = await controller.getAllProducts(0, 100);
      expect(mockProductService.getAllProducts).toHaveBeenCalledWith(0, 100);
      expect(result).toEqual([mockProduct]);
    });
    it('should throw HttpException on error', async () => {
      const mockResult = err<ProductEntity[], Error>(new Error('fail'));
      mockProductService.getAllProducts = jest.fn().mockReturnValue(Promise.resolve(mockResult));
      await expect(controller.getAllProducts(0, 100)).rejects.toThrow(HttpException);
    });
  });
});
