import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { logger } from './utils/services/logger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  home(): string {
    logger.log('wechat pay');
    return 'wechat pay';
  }

  @Get('hello')
  getHello(): string {
    logger.log('wechat pay');
    return 'wechat pay';
  }
}
