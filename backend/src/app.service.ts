import { Injectable } from '@nestjs/common';
import { PrismaService } from './catalog/services/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Ecommerce API';
  }

  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
