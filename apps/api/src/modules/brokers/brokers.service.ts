import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrokersService {
  constructor(private prisma: PrismaService) {}

  async findAll(city?: string) {
    return this.prisma.broker.findMany({
      where: { isVerified: true, ...(city && { localities: { has: city } }) },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { rating: 'desc' },
      take: 50,
    });
  }

  async findById(id: string) {
    const broker = await this.prisma.broker.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, createdAt: true } },
        properties: {
          where: { status: 'ACTIVE' },
          select: { id: true, title: true, price: true, city: true, images: { take: 1 } },
          take: 10,
        },
      },
    });
    if (!broker) throw new NotFoundException('Broker not found');
    return broker;
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    return this.prisma.broker.upsert({
      where: { userId },
      create: { userId, ...data } as never,
      update: data as never,
    });
  }
}
