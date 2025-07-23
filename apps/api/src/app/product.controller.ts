import { ProductEntity } from '@edd-cart/db';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { failWhale } from 'fail-whale';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  private readonly logger: Logger;
  constructor(private readonly productService: ProductService) {
    this.logger = new Logger('API.ProductController');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Returns a Product record matching the provided id',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the product to read (uuid)',
  })
  @ApiResponse({
    status: 200,
    description: 'A Product record',
    type: ProductEntity,
  })
  public async getProductById(@Param('id', ParseUUIDPipe) id: string): Promise<ProductEntity> {
    const result = await this.productService.getProductById(id);
    if (result.isOk()) {
      if (result.value) {
        return result.value;
      }

      throw new NotFoundException();
    }

    failWhale(result.error.message, this.logger);
    throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Get()
  @ApiOperation({
    summary: 'Returns a specified, or 100 if unspecified, number of Products (max 100)',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Skip x records (use for pagination)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: 'How many records to return. Defaults to 100',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'An array of Products',
    type: [ProductEntity],
  })
  public async getAllProducts(@Query('take') skip?: number, @Query('take') take?: number): Promise<ProductEntity[]> {
    const result = await this.productService.getAllProducts(skip || 0, take || 100);
    if (result.isOk()) {
      return result.value;
    }

    failWhale(result.error.message, this.logger);
    throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
