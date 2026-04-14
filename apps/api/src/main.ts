import { SanitizePipe } from '@flama/backend-core';
import { setupBullBoard } from '@flama/backend-queue';
import { QUEUE_NAMES } from '@flama/shared';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({
    origin: configService.get('app.frontendUrl'),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new SanitizePipe(), new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Flama API')
    .setDescription('Flama REST API documentation')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  setupBullBoard(app, [QUEUE_NAMES.EMAIL, QUEUE_NAMES.FILE_PROCESSING]);

  const port = configService.get('app.port');
  await app.listen(port);
}

bootstrap();
