import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { RawServerDefault } from 'fastify';

export class BootstrapService {
  start: (
    app: NestFastifyApplication<RawServerDefault>,
  ) => Promise<void> | void;
  stop: () => Promise<void> | void;
}
