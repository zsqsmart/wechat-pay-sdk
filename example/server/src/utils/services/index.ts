import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { RawServerDefault } from 'fastify';

import { BootstrapService } from './base';
import { logger } from './logger';
import { mongoDB } from './mongo';

const services: BootstrapService[] = [logger, mongoDB];

export const startServices = async (
  app: NestFastifyApplication<RawServerDefault>,
) => {
  for (const service of services) {
    const serviceName = service.constructor.name;
    logger.log(`${serviceName} starting`);
    try {
      await service.start(app);
      logger.log(`${serviceName} started`);
    } catch (error) {
      logger.error(`${serviceName} start error: ${error.message}`);
    }
  }
};

export const stopServices = async () => {
  for (const service of services) {
    await service.stop();
    logger.log(`${service.constructor.name} stopped`);
  }
};
