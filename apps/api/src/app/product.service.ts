import { PrismaService, ProductEntity } from '@edd-cart/db';
import { Injectable } from '@nestjs/common';
import { fromPromise, Result } from 'neverthrow';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  public async getProductById(id: string): Promise<Result<ProductEntity | null, Error>> {
    return await fromPromise(
      this.prisma.product.findFirst({
        where: {
          id,
        },
        include: {
          cartItems: true,
        },
      }),
      (err: Error) => err,
    );
  }

  public async getAllProducts(skip: number, take: number): Promise<Result<ProductEntity[], Error>> {
    return await fromPromise(
      this.prisma.product.findMany({
        skip,
        take: take > 100 ? 100 : take,
        include: {
          cartItems: true,
        },
      }),
      (err: Error) => err,
    );
  }
}
