import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async autocomplete(query: string) {
    if (!query || query.length < 2) return { properties: [], localities: [], cities: [] };

    const [properties, localities] = await Promise.all([
      this.prisma.property.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { locality: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, city: true, type: true, listingType: true },
        take: 5,
      }),
      this.prisma.locality.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, city: true, state: true },
        take: 5,
      }),
    ]);

    // Distinct city suggestions
    const cities = await this.prisma.property.groupBy({
      by: ['city'],
      where: {
        status: 'ACTIVE',
        city: { contains: query, mode: 'insensitive' },
      },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 5,
    });

    return {
      properties,
      localities,
      cities: cities.map((c) => ({ city: c.city, count: c._count.city })),
    };
  }

  async getNearby(lat: number, lng: number, radiusKm = 5, listingType?: string) {
    // PostgreSQL ST_DWithin equivalent using bounding box approximation
    // For production, use PostGIS: ST_DWithin(ST_MakePoint(lng, lat), ST_MakePoint(p.lng, p.lat), radius)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    return this.prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        lat: { gte: lat - latDelta, lte: lat + latDelta },
        lng: { gte: lng - lngDelta, lte: lng + lngDelta },
        ...(listingType && { listingType: listingType as never }),
      },
      select: {
        id: true, title: true, lat: true, lng: true, price: true,
        type: true, listingType: true, bedrooms: true, builtUpArea: true,
        aiTrustScore: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      },
      take: 50,
    });
  }
}
