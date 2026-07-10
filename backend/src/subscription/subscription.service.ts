import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../catalog/services/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

const SUCCESS_MESSAGE = 'Thank you for subscribing!';

function isMissingSubscribersTable(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    (e.code === 'P2021' ||
      (e.message?.includes('subscribers') &&
        e.message?.includes('does not exist')))
  );
}

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async subscribe(dto: SubscribeDto): Promise<{ message: string }> {
    const email = this.normalizeEmail(dto.email);
    const source = dto.source?.trim() || null;

    try {
      await this.prisma.subscriber.create({
        data: { email, source },
      });
    } catch (e) {
      if (isMissingSubscribersTable(e)) {
        throw new ServiceUnavailableException(
          'Subscribers table is missing. From the backend folder run: `npm run prisma:push` (or `npm run prisma:push:accept-loss` if Prisma warns about schema changes).',
        );
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        return { message: SUCCESS_MESSAGE };
      }
      throw e;
    }

    return { message: SUCCESS_MESSAGE };
  }

  async listSubscribers() {
    try {
      return await this.prisma.subscriber.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          source: true,
          createdAt: true,
        },
      });
    } catch (e) {
      if (isMissingSubscribersTable(e)) {
        throw new ServiceUnavailableException(
          'Subscribers table is missing. From the backend folder run: `npm run prisma:push` (or `npm run prisma:push:accept-loss` if Prisma warns about schema changes).',
        );
      }
      throw e;
    }
  }
}
