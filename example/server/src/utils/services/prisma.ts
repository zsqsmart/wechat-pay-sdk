import { BootstrapService } from './base';
import { PrismaClient } from '.prisma/client';

type BooleanObject<T> = {
  [K in keyof T]?: boolean;
};

export class PrismaService extends PrismaClient implements BootstrapService {
  constructor() {
    super({
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
      ],
      errorFormat: 'minimal',
    });
  }

  async start() {
    await this.$connect();
  }

  async stop() {
    await this.$disconnect();
  }

  /**
   * 去除某些字段
   * https://github.com/prisma/prisma/issues/5042#issuecomment-1854940791
   * @param fields 所有字段
   * @param excludes 被排除的字段
   */
  excludeFields<T>(fields: T, excludes: (keyof T)[]): BooleanObject<T> {
    const keys = Object.keys(fields!).filter(
      (key) => !excludes.includes(key as keyof T),
    ) as (keyof T)[];
    const prismaSelect: BooleanObject<T> = {};
    for (const key of keys) {
      prismaSelect[key] = true;
    }
    return prismaSelect;
  }
}

export const prisma = new PrismaService();
