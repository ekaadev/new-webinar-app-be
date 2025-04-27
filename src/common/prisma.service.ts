import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
    });
  }

  onModuleInit(): any {
    this.$on('query', (e) => {
      this.logger.error(e);
    });
    this.$on('info', (e) => {
      this.logger.error(e);
    });
    this.$on('warn', (e) => {
      this.logger.error(e);
    });
    this.$on('error', (e) => {
      this.logger.error(e);
    });
  }
}
