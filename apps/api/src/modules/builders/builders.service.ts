import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BuildersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.builder.findMany({
      where: { isVerified: true },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { rating: 'desc' },
    });
  }

  async findById(id: string) {
    const builder = await this.prisma.builder.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true, createdAt: true } },
        projects: { where: { status: { not: 'ARCHIVED' } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!builder) throw new NotFoundException('Builder not found');
    return builder;
  }
}
