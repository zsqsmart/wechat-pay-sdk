import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { startServices } from './utils/services';
import { APP_CONFIGS } from './constants';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix(APP_CONFIGS.apiPrefix);
  await startServices(app);
  await app.listen(APP_CONFIGS.port);
}
bootstrap();
