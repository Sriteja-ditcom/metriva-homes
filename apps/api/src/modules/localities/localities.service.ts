import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocalitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(city?: string) {
    return this.prisma.locality.findMany({
      where: city ? { city: { contains: city, mode: 'insensitive' } } : {},
      orderBy: { popularityScore: 'desc' },
      take: 100,
    });
  }

  async findById(id: string) {
    const locality = await this.prisma.locality.findUnique({ where: { id } });
    if (!locality) throw new NotFoundException('Locality not found');

    const stats = await this.prisma.property.aggregate({
      where: { localityId: id, status: 'ACTIVE' },
      _avg: { price: true, builtUpArea: true },
      _count: true,
    });

    return {
      ...locality,
      stats: {
        avgPrice: stats._avg.price ? Number(stats._avg.price) : null,
        avgArea: stats._avg.builtUpArea,
        totalListings: stats._count,
      },
    };
  }
}
