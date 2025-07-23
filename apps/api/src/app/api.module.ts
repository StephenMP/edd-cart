import { CoreModule, InjectionTokens } from '@edd-cart/core';
import { DbModule } from '@edd-cart/db';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { configuration } from '../config/config';
import { validationSchema } from '../config/config.validation';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    CoreModule,
    DbModule,
    ClientsModule.registerAsync([
      {
        name: InjectionTokens.PROCESSOR,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'cart',
                brokers: configService.get('kafka.brokers'),
              },
              consumer: {
                groupId: 'processor.consumer',
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [CartController, ProductController],
  providers: [CartService, ProductService],
})
export class ApiModule {}
