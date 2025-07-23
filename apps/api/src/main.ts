import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './app/api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const port = process.env.PORT || 3333;

  const config = new DocumentBuilder()
    .setTitle('Event-driven Cart')
    .setDescription('Event-driven Cart API')
    .setVersion('1.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
