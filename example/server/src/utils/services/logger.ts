import { LoggerService as NestLoggerService } from '@nestjs/common';
import { green, yellow } from 'colorette';
import { format as dateFormat } from 'date-fns';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';


import { BootstrapService } from './base';

export class LoggerService implements BootstrapService, NestLoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.printf(({ context, level, message, time }) => {
        const appStr = green(`[WeChat-Pay]`);
        const contextStr = context ? yellow(` [${context}] `) : ' ';

        return `${appStr} ${time} ${level}${contextStr}${message} `;
      }),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
          ),
        }),
        new transports.DailyRotateFile({
          level: 'info',
          dirname: 'logs',
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100k',
        })
      ],
    });
  }

  async start() { }

  async stop() { }

  log(message: string, context?: string) {
    const time = dateFormat(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    this.logger.log('info', message, { context, time });
  }

  error(message: string, context?: string) {
    const time = dateFormat(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    this.logger.log('info', message, { context, time });
  }

  warn(message: string, context?: string) {
    const time = dateFormat(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    this.logger.log('info', message, { context, time });
  }
}

export const logger = new LoggerService();
